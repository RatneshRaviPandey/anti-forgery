using System.Security.Cryptography;
using InfometaCodeGen;

// ══════════════════════════════════════════════════════════════
//  Infometa QR Code Generator — V3 Encrypted Tokens
//  
//  Generates AES-256-GCM encrypted tokens that can be verified
//  at https://infometa.in/api/verify/{token}
//
//  Usage:
//    dotnet run                          — Generate sample batch
//    dotnet run -- --count 100           — Generate 100 codes
//    dotnet run -- --key-file key.json   — Use key from file
// ══════════════════════════════════════════════════════════════

Console.WriteLine("╔══════════════════════════════════════════╗");
Console.WriteLine("║   Infometa QR Code Generator v3.0       ║");
Console.WriteLine("║   AES-256-GCM Encrypted Tokens          ║");
Console.WriteLine("╚══════════════════════════════════════════╝");
Console.WriteLine();

// ─── Parse CLI arguments ────────────────────────────────────
int count = 10;
string? keyFile = null;
string outputDir = Path.Combine(Directory.GetCurrentDirectory(), "output");

for (int i = 0; i < args.Length; i++)
{
    switch (args[i])
    {
        case "--count" or "-n" when i + 1 < args.Length:
            count = int.Parse(args[++i]);
            break;
        case "--key-file" or "-k" when i + 1 < args.Length:
            keyFile = args[++i];
            break;
        case "--output" or "-o" when i + 1 < args.Length:
            outputDir = args[++i];
            break;
        case "--help" or "-h":
            Console.WriteLine("Usage: dotnet run -- [options]");
            Console.WriteLine("  --count, -n       Number of QR codes to generate (default: 10)");
            Console.WriteLine("  --key-file, -k    Path to brand key JSON file");
            Console.WriteLine("  --output, -o      Output directory (default: ./output)");
            return;
    }
}

// ─── Brand Key ──────────────────────────────────────────────
BrandKey brandKey;

if (keyFile != null && File.Exists(keyFile))
{
    var json = File.ReadAllText(keyFile);
    brandKey = System.Text.Json.JsonSerializer.Deserialize<BrandKey>(json)
        ?? throw new Exception("Failed to parse key file");
    Console.WriteLine($"  Key loaded from: {keyFile}");
}
else
{
    // Generate a demo key (in production, this comes from the database)
    var encKey = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
    brandKey = new BrandKey
    {
        KeyId = $"bk_{Convert.ToHexString(RandomNumberGenerator.GetBytes(3)).ToLowerInvariant()}",
        BrandName = "Amul",
        BrandCode = "AMUL",
        EncryptionKey = encKey,
        Version = 1
    };

    // Save the key for reference
    var keyPath = Path.Combine(outputDir, $"{brandKey.KeyId}.json");
    Directory.CreateDirectory(outputDir);
    File.WriteAllText(keyPath, System.Text.Json.JsonSerializer.Serialize(brandKey, new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
    Console.WriteLine($"  ⚠  Generated NEW brand key: {brandKey.KeyId}");
    Console.WriteLine($"  Key saved to: {keyPath}");
    Console.WriteLine($"  ⚠  You MUST register this key in the database for verification to work.");
    Console.WriteLine($"     INSERT INTO brand_keys (key_id, brand_id, brand_name, encryption_key, version, is_active, expires_at)");
    Console.WriteLine($"     VALUES ('{brandKey.KeyId}', '<brand-uuid>', '{brandKey.BrandName}', '{brandKey.EncryptionKey}', {brandKey.Version}, true, '2027-12-31');");
}

Console.WriteLine($"  Brand: {brandKey.BrandName} ({brandKey.BrandCode})");
Console.WriteLine($"  Key ID: {brandKey.KeyId} (v{brandKey.Version})");
Console.WriteLine();

// ─── Product & Batch Info ───────────────────────────────────
var product = new ProductInfo
{
    Name = "Amul Butter 500g",
    Sku = "AMUL-BTR-500",
    Industry = "dairy",
    Category = "butter"
};

var batch = new BatchInfo
{
    BatchCode = $"BATCH-{DateTime.Now:yyyyMMdd}-001",
    ManufactureDate = DateTime.Today,
    ExpiryDate = DateTime.Today.AddMonths(6),
    VerifyBaseUrl = "https://infometa.in/api/verify"
};

Console.WriteLine($"  Product: {product.Name} ({product.Sku})");
Console.WriteLine($"  Batch: {batch.BatchCode}");
Console.WriteLine($"  Mfg: {batch.ManufactureDate:yyyy-MM-dd} → Exp: {batch.ExpiryDate:yyyy-MM-dd}");
Console.WriteLine();

// ─── Generate Tokens ────────────────────────────────────────
Console.WriteLine($"Generating {count} encrypted tokens...");
var tokens = TokenV3Generator.GenerateBatch(brandKey, product, batch, count);
Console.WriteLine($"  ✓ {tokens.Count} tokens generated");
Console.WriteLine();

// ─── Export QR Codes ────────────────────────────────────────
Console.WriteLine("Exporting QR code images...");
var batchDir = Path.Combine(outputDir, batch.BatchCode);
var manifestPath = QrCodeExporter.ExportBatchWithManifest(tokens, batchDir);
Console.WriteLine($"  ✓ {tokens.Count} QR codes saved to: {batchDir}");
Console.WriteLine($"  ✓ Manifest: {manifestPath}");
Console.WriteLine();

// ─── Summary ────────────────────────────────────────────────
Console.WriteLine("╔══════════════════════════════════════════╗");
Console.WriteLine("║   Generation Complete                    ║");
Console.WriteLine("╚══════════════════════════════════════════╝");
Console.WriteLine($"  Tokens: {tokens.Count}");
Console.WriteLine($"  Output: {batchDir}");
Console.WriteLine($"  Format: IMT3.{brandKey.KeyId}.{{encrypted}}");
Console.WriteLine();
Console.WriteLine("  Sample token:");
Console.WriteLine($"    {tokens[0].Token[..60]}...");
Console.WriteLine();
Console.WriteLine("  Verify URL:");
Console.WriteLine($"    {tokens[0].VerifyUrl[..80]}...");
Console.WriteLine();

// Print first 3 for quick reference
Console.WriteLine("  First 3 codes:");
for (int i = 0; i < Math.Min(3, tokens.Count); i++)
{
    Console.WriteLine($"    #{tokens[i].Sequence}: {tokens[i].Token[..50]}...");
}
