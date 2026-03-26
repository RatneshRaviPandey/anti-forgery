using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace InfometaCodeGen;

/// <summary>
/// Generates self-contained encrypted Infometa V3 tokens using AES-256-GCM.
/// Tokens embed all product information and can be verified offline by the website
/// using only the brand's encryption key — no database lookup needed.
/// </summary>
public sealed class TokenV3Generator
{
    private const string TokenPrefix = "IMT3";
    private const int NonceSize = 12;   // AES-GCM standard
    private const int TagSize = 16;     // 128-bit auth tag

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private readonly byte[] _encryptionKey;
    private readonly BrandKeyFile _keyFile;

    public TokenV3Generator(BrandKeyFile keyFile)
    {
        if (string.IsNullOrEmpty(keyFile.EncryptionKey) || keyFile.EncryptionKey.Length != 64)
            throw new ArgumentException("Encryption key must be exactly 64 hex characters (32 bytes).");

        _encryptionKey = Convert.FromHexString(keyFile.EncryptionKey);
        _keyFile = keyFile;

        // Validate key expiry
        if (DateTime.TryParse(keyFile.ExpiresAt, out var exp) && exp < DateTime.UtcNow)
            throw new InvalidOperationException($"Brand key expired on {keyFile.ExpiresAt}. Contact Infometa to renew your subscription.");
    }

    public string KeyId => _keyFile.KeyId;
    public string BrandName => _keyFile.BrandName;
    public int Version => _keyFile.Version;
    public string ExpiresAt => _keyFile.ExpiresAt;

    /// <summary>Generate a single self-contained encrypted token.</summary>
    public string Generate(ProductInfo product, BatchInfo batch, int sequence)
    {
        var payload = new TokenV3Payload
        {
            V   = 3,
            Kid = _keyFile.KeyId,
            Kv  = _keyFile.Version,
            Bn  = _keyFile.BrandName,
            Bc  = _keyFile.BrandCode,
            Pn  = product.Name,
            Ps  = product.Sku,
            Pi  = product.Industry,
            Pc  = product.Category,
            Btc = batch.BatchCode,
            Md  = batch.ManufactureDate,
            Ed  = batch.ExpiryDate,
            Sq  = sequence,
            Ia  = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            Rnd = Convert.ToHexString(RandomNumberGenerator.GetBytes(8)).ToLowerInvariant(),
        };

        string payloadJson = JsonSerializer.Serialize(payload, JsonOptions);
        byte[] plaintext = Encoding.UTF8.GetBytes(payloadJson);

        // AES-256-GCM encrypt
        byte[] nonce = RandomNumberGenerator.GetBytes(NonceSize);
        byte[] ciphertext = new byte[plaintext.Length];
        byte[] tag = new byte[TagSize];

        using var aes = new AesGcm(_encryptionKey, TagSize);
        aes.Encrypt(nonce, plaintext, ciphertext, tag);

        // Combine: nonce (12) + ciphertext (variable) + tag (16)
        byte[] combined = new byte[nonce.Length + ciphertext.Length + tag.Length];
        nonce.CopyTo(combined, 0);
        ciphertext.CopyTo(combined, nonce.Length);
        tag.CopyTo(combined, nonce.Length + ciphertext.Length);

        string encoded = Base64UrlEncode(combined);
        return $"{TokenPrefix}.{_keyFile.KeyId}.{encoded}";
    }

    /// <summary>Decrypt and verify a token (for local testing).</summary>
    public TokenV3VerifyResult Verify(string token)
    {
        if (string.IsNullOrEmpty(token))
            return TokenV3VerifyResult.Fail("empty_token");

        // Token format: IMT3.{keyId}.{base64url(nonce+ciphertext+tag)}
        // Using '.' as delimiter because it's not in base64url alphabet
        string[] parts = token.Split('.', 3);
        if (parts.Length != 3 || parts[0] != TokenPrefix)
            return TokenV3VerifyResult.Fail("invalid_format");

        string keyId = parts[1];
        string encoded = parts[2];

        if (keyId != _keyFile.KeyId)
            return TokenV3VerifyResult.Fail("key_mismatch");

        try
        {
            byte[] combined = Base64UrlDecode(encoded);
            if (combined.Length < NonceSize + TagSize + 1)
                return TokenV3VerifyResult.Fail("payload_too_short");

            byte[] nonce = combined[..NonceSize];
            byte[] tag = combined[^TagSize..];
            byte[] ciphertext = combined[NonceSize..^TagSize];
            byte[] plaintext = new byte[ciphertext.Length];

            using var aes = new AesGcm(_encryptionKey, TagSize);
            aes.Decrypt(nonce, ciphertext, tag, plaintext);

            var payload = JsonSerializer.Deserialize<TokenV3Payload>(plaintext, JsonOptions);
            if (payload == null)
                return TokenV3VerifyResult.Fail("deserialize_failed");

            return TokenV3VerifyResult.Ok(payload);
        }
        catch (AuthenticationTagMismatchException)
        {
            return TokenV3VerifyResult.Fail("tampered", tampered: true);
        }
        catch (Exception ex)
        {
            return TokenV3VerifyResult.Fail($"decrypt_error: {ex.Message}");
        }
    }

    // ── Base64url (RFC 4648 §5, no padding) ──────────────────
    private static string Base64UrlEncode(byte[] data) =>
        Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[] Base64UrlDecode(string input)
    {
        string s = input.Replace('-', '+').Replace('_', '/');
        switch (s.Length % 4)
        {
            case 2: s += "=="; break;
            case 3: s += "="; break;
        }
        return Convert.FromBase64String(s);
    }
}

// ── Models ──────────────────────────────────────────────────

/// <summary>The key file distributed to brands by Infometa.</summary>
public class BrandKeyFile
{
    [JsonPropertyName("keyId")]         public string KeyId { get; set; } = "";
    [JsonPropertyName("brandName")]     public string BrandName { get; set; } = "";
    [JsonPropertyName("brandCode")]     public string BrandCode { get; set; } = "";
    [JsonPropertyName("encryptionKey")] public string EncryptionKey { get; set; } = "";
    [JsonPropertyName("version")]       public int Version { get; set; }
    [JsonPropertyName("issuedAt")]      public string IssuedAt { get; set; } = "";
    [JsonPropertyName("expiresAt")]     public string ExpiresAt { get; set; } = "";
}

/// <summary>Encrypted payload embedded in the QR token.</summary>
public class TokenV3Payload
{
    [JsonPropertyName("v")]   public int V { get; set; }
    [JsonPropertyName("kid")] public string Kid { get; set; } = "";
    [JsonPropertyName("kv")]  public int Kv { get; set; }
    [JsonPropertyName("bn")]  public string Bn { get; set; } = "";   // brand name
    [JsonPropertyName("bc")]  public string Bc { get; set; } = "";   // brand code
    [JsonPropertyName("pn")]  public string Pn { get; set; } = "";   // product name
    [JsonPropertyName("ps")]  public string Ps { get; set; } = "";   // product SKU
    [JsonPropertyName("pi")]  public string Pi { get; set; } = "";   // product industry
    [JsonPropertyName("pc")]  public string? Pc { get; set; }        // product category
    [JsonPropertyName("btc")] public string Btc { get; set; } = "";  // batch code
    [JsonPropertyName("md")]  public string? Md { get; set; }        // manufacture date
    [JsonPropertyName("ed")]  public string? Ed { get; set; }        // expiry date
    [JsonPropertyName("sq")]  public int Sq { get; set; }            // sequence number
    [JsonPropertyName("ia")]  public long Ia { get; set; }           // issued at (unix)
    [JsonPropertyName("rnd")] public string Rnd { get; set; } = "";  // random entropy
}

public record ProductInfo(string Name, string Sku, string Industry, string? Category = null);
public record BatchInfo(string BatchCode, string? ManufactureDate = null, string? ExpiryDate = null);

public class TokenV3VerifyResult
{
    public bool Valid { get; init; }
    public TokenV3Payload? Payload { get; init; }
    public string? FailureReason { get; init; }
    public bool Tampered { get; init; }

    public static TokenV3VerifyResult Ok(TokenV3Payload payload) => new() { Valid = true, Payload = payload };
    public static TokenV3VerifyResult Fail(string reason, bool tampered = false) =>
        new() { Valid = false, FailureReason = reason, Tampered = tampered };
}
