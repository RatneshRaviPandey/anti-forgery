using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace InfometaCodeGen;

/// <summary>
/// Generates IMT3 (Infometa Token V3) encrypted tokens compatible with
/// the infometa.in verification endpoint.
/// 
/// Token format: IMT3.{keyId}.{base64url(nonce + ciphertext + authTag)}
/// Encryption:   AES-256-GCM, 12-byte nonce, 16-byte auth tag
/// </summary>
public static class TokenV3Generator
{
    /// <summary>
    /// Generate a single encrypted V3 token.
    /// </summary>
    public static string GenerateToken(BrandKey brandKey, ProductInfo product, BatchInfo batch, int sequence)
    {
        var payload = new V3TokenPayload
        {
            V = 3,
            Kid = brandKey.KeyId,
            Kv = brandKey.Version,
            Bn = brandKey.BrandName,
            Bc = brandKey.BrandCode,
            Pn = product.Name,
            Ps = product.Sku,
            Pi = product.Industry,
            Pc = product.Category,
            Btc = batch.BatchCode,
            Md = batch.ManufactureDate?.ToString("yyyy-MM-dd"),
            Ed = batch.ExpiryDate?.ToString("yyyy-MM-dd"),
            Sq = sequence,
            Ia = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            Rnd = Convert.ToHexString(RandomNumberGenerator.GetBytes(8)).ToLowerInvariant()
        };

        var json = JsonSerializer.Serialize(payload, JsonContext.Default.V3TokenPayload);
        var plaintext = Encoding.UTF8.GetBytes(json);

        // AES-256-GCM encryption
        var key = Convert.FromHexString(brandKey.EncryptionKey); // 32 bytes from 64 hex chars
        var nonce = RandomNumberGenerator.GetBytes(12);
        var ciphertext = new byte[plaintext.Length];
        var tag = new byte[16];

        using var aes = new AesGcm(key, tagSizeInBytes: 16);
        aes.Encrypt(nonce, plaintext, ciphertext, tag);

        // Combine: nonce(12) + ciphertext(N) + tag(16)
        var combined = new byte[nonce.Length + ciphertext.Length + tag.Length];
        Buffer.BlockCopy(nonce, 0, combined, 0, nonce.Length);
        Buffer.BlockCopy(ciphertext, 0, combined, nonce.Length, ciphertext.Length);
        Buffer.BlockCopy(tag, 0, combined, nonce.Length + ciphertext.Length, tag.Length);

        // Base64url encode (RFC 4648 §5, no padding)
        var encoded = Convert.ToBase64String(combined)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');

        return $"IMT3.{brandKey.KeyId}.{encoded}";
    }

    /// <summary>
    /// Generate a batch of tokens with sequential numbering.
    /// </summary>
    public static List<TokenResult> GenerateBatch(
        BrandKey brandKey, ProductInfo product, BatchInfo batch,
        int count, int startSequence = 1)
    {
        var results = new List<TokenResult>(count);
        for (int i = 0; i < count; i++)
        {
            int seq = startSequence + i;
            var token = GenerateToken(brandKey, product, batch, seq);
            results.Add(new TokenResult
            {
                Sequence = seq,
                Token = token,
                VerifyUrl = $"{batch.VerifyBaseUrl}/{Uri.EscapeDataString(token)}"
            });
        }
        return results;
    }
}

// ─── Data Models ────────────────────────────────────────────

public class BrandKey
{
    public required string KeyId { get; set; }           // e.g. "bk_a3f8c1"
    public required string BrandName { get; set; }
    public required string BrandCode { get; set; }       // short identifier
    public required string EncryptionKey { get; set; }   // 64 hex chars (32 bytes AES-256)
    public int Version { get; set; } = 1;
}

public class ProductInfo
{
    public required string Name { get; set; }
    public required string Sku { get; set; }
    public required string Industry { get; set; }
    public string? Category { get; set; }
}

public class BatchInfo
{
    public required string BatchCode { get; set; }
    public DateTime? ManufactureDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string VerifyBaseUrl { get; set; } = "https://infometa.in/verify";
}

public class TokenResult
{
    public int Sequence { get; set; }
    public required string Token { get; set; }
    public required string VerifyUrl { get; set; }
}

// ─── JSON Payload ───────────────────────────────────────────

public class V3TokenPayload
{
    [JsonPropertyName("v")]   public int V { get; set; }
    [JsonPropertyName("kid")] public string Kid { get; set; } = "";
    [JsonPropertyName("kv")]  public int Kv { get; set; }
    [JsonPropertyName("bn")]  public string Bn { get; set; } = "";
    [JsonPropertyName("bc")]  public string Bc { get; set; } = "";
    [JsonPropertyName("pn")]  public string Pn { get; set; } = "";
    [JsonPropertyName("ps")]  public string Ps { get; set; } = "";
    [JsonPropertyName("pi")]  public string Pi { get; set; } = "";
    [JsonPropertyName("pc")]  public string? Pc { get; set; }
    [JsonPropertyName("btc")] public string Btc { get; set; } = "";
    [JsonPropertyName("md")]  public string? Md { get; set; }
    [JsonPropertyName("ed")]  public string? Ed { get; set; }
    [JsonPropertyName("sq")]  public int Sq { get; set; }
    [JsonPropertyName("ia")]  public long Ia { get; set; }
    [JsonPropertyName("rnd")] public string Rnd { get; set; } = "";
}

// Source-generated JSON context for AOT compatibility
[JsonSerializable(typeof(V3TokenPayload))]
internal partial class JsonContext : JsonSerializerContext { }
