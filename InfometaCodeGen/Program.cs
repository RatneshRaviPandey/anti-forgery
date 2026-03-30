using System.Diagnostics;
using System.Text;
using System.Text.Json;
using InfometaCodeGen;
using Spectre.Console;

const int DefaultQrPixelsPerModule = 10;

// ══════════════════════════════════════════════════════════════
// Infometa QR Code Generator v3 — Fully Offline
// No database required. Uses brand key file for encryption.
// ══════════════════════════════════════════════════════════════

// ── CLI mode ────────────────────────────────────────────────
if (args.Length >= 1)
{
    switch (args[0])
    {
        case "generate" when args.Length >= 2:
            RunCliGenerate(args);
            return;
        case "verify" when args.Length >= 2:
            RunCliVerify(args);
            return;
        case "key-info" when args.Length >= 2:
            RunCliKeyInfo(args[1]);
            return;
        case "help":
        case "--help":
        case "-h":
            PrintCliHelp();
            return;
    }
}

// ── Interactive Banner ──────────────────────────────────────
AnsiConsole.Write(new FigletText("Infometa").Color(Color.Teal));
AnsiConsole.MarkupLine("[grey]QR Code Token Generator v3.0 — Offline Mode[/]");
AnsiConsole.MarkupLine("[grey]Encrypted self-contained tokens · No database required[/]");
AnsiConsole.WriteLine();

// ── Load Brand Key ──────────────────────────────────────────
BrandKeyFile? keyFile = null;
TokenV3Generator? generator = null;

string? keyPath = FindKeyFile();
if (keyPath != null)
{
    (keyFile, generator) = TryLoadKey(keyPath);
    if (keyFile != null)
    {
        AnsiConsole.MarkupLine($"[green]Brand key loaded:[/] {Markup.Escape(keyFile.BrandName)} (v{keyFile.Version})");
        AnsiConsole.MarkupLine($"[grey]Key ID: {keyFile.KeyId}  ·  Expires: {keyFile.ExpiresAt}[/]");
    }
}
else
{
    AnsiConsole.MarkupLine("[yellow]No brand key file found in current directory.[/]");
    AnsiConsole.MarkupLine("[grey]Place your .json key file here, or select one manually.[/]");
}
AnsiConsole.WriteLine();

// ── Main menu loop ──────────────────────────────────────────
while (true)
{
    var choices = new List<string>();
    if (generator != null)
    {
        choices.Add("Generate codes");
        choices.Add("Verify a token");
        choices.Add("Key info");
    }
    choices.Add("Load brand key file");
    choices.Add("Exit");

    var choice = AnsiConsole.Prompt(
        new SelectionPrompt<string>()
            .Title("[teal]What would you like to do?[/]")
            .AddChoices(choices));

    switch (choice)
    {
        case "Generate codes":
            GenerateCodesFlow(generator!);
            break;
        case "Verify a token":
            VerifyTokenFlow(generator!);
            break;
        case "Key info":
            ShowKeyInfo(keyFile!);
            break;
        case "Load brand key file":
            (keyFile, generator) = LoadKeyFileInteractive();
            break;
        case "Exit":
            AnsiConsole.MarkupLine("[grey]Goodbye![/]");
            return;
    }
    AnsiConsole.WriteLine();
}

// ══════════════════════════════════════════════════════════════
// Interactive Flows
// ══════════════════════════════════════════════════════════════

static void GenerateCodesFlow(TokenV3Generator gen)
{
    AnsiConsole.MarkupLine("[teal]── Product Information ──[/]");
    string productName = AnsiConsole.Ask<string>("Product [teal]name[/]:");
    string productSku  = AnsiConsole.Ask<string>("Product [teal]SKU[/]:");
    string industry    = AnsiConsole.Ask<string>("Product [teal]industry[/] (e.g. dairy, pharma, electronics):");
    string category    = AnsiConsole.Prompt(
        new TextPrompt<string>("Product [teal]category[/] (optional):")
            .AllowEmpty());

    AnsiConsole.WriteLine();
    AnsiConsole.MarkupLine("[teal]── Batch Information ──[/]");
    string batchCode = AnsiConsole.Ask<string>("Batch [teal]code[/]:");
    string mfgDate   = AnsiConsole.Prompt(
        new TextPrompt<string>("Manufacture [teal]date[/] (YYYY-MM-DD, optional):")
            .AllowEmpty());
    string expDate   = AnsiConsole.Prompt(
        new TextPrompt<string>("Expiry [teal]date[/] (YYYY-MM-DD, optional):")
            .AllowEmpty());

    int quantity = AnsiConsole.Prompt(
        new TextPrompt<int>("Number of [teal]codes[/] to generate:")
            .DefaultValue(100)
            .Validate(n => n is > 0 and <= 100000
                ? ValidationResult.Success()
                : ValidationResult.Error("Must be between 1 and 100,000")));

    int startSeq = AnsiConsole.Prompt(
        new TextPrompt<int>("Starting [teal]sequence[/] number:")
            .DefaultValue(1)
            .Validate(n => n > 0 ? ValidationResult.Success() : ValidationResult.Error("Must be > 0")));

    var product = new ProductInfo(productName, productSku, industry,
        string.IsNullOrWhiteSpace(category) ? null : category);
    var batch = new BatchInfo(batchCode,
        string.IsNullOrWhiteSpace(mfgDate) ? null : mfgDate,
        string.IsNullOrWhiteSpace(expDate) ? null : expDate);

    // Confirmation
    AnsiConsole.WriteLine();
    var table = new Table().Border(TableBorder.Rounded);
    table.AddColumn("Property");
    table.AddColumn("Value");
    table.AddRow("Brand", gen.BrandName);
    table.AddRow("Key ID", gen.KeyId);
    table.AddRow("Product", $"{productName} ({productSku})");
    table.AddRow("Industry", industry);
    if (!string.IsNullOrWhiteSpace(category)) table.AddRow("Category", category);
    table.AddRow("Batch", batchCode);
    if (!string.IsNullOrWhiteSpace(mfgDate)) table.AddRow("Mfg Date", mfgDate);
    if (!string.IsNullOrWhiteSpace(expDate)) table.AddRow("Exp Date", expDate);
    table.AddRow("Quantity", $"{quantity} codes (seq {startSeq}–{startSeq + quantity - 1})");
    AnsiConsole.Write(table);

    bool generateQr = AnsiConsole.Confirm("Generate [teal]QR code images[/]?", true);
    int qrPixels = DefaultQrPixelsPerModule;
    if (generateQr)
    {
        qrPixels = AnsiConsole.Prompt(
            new TextPrompt<int>("QR [teal]pixels per module[/] (higher = larger image):")
                .DefaultValue(DefaultQrPixelsPerModule)
                .Validate(n => n is >= 4 and <= 50
                    ? ValidationResult.Success()
                    : ValidationResult.Error("Must be between 4 and 50")));

        string verifyUrl = AnsiConsole.Prompt(
            new TextPrompt<string>("Verify [teal]base URL[/] (QR codes will link here):")
                .DefaultValue(QrCodeExporter.VerifyBaseUrl));
        QrCodeExporter.VerifyBaseUrl = verifyUrl;
    }

    if (!AnsiConsole.Confirm("Proceed with generation?"))
        return;

    // Generate tokens
    var sw = Stopwatch.StartNew();
    var tokens = new List<(int Seq, string Token)>();

    AnsiConsole.Progress()
        .Start(ctx =>
        {
            var task = ctx.AddTask($"Generating {quantity} tokens...", maxValue: quantity);
            for (int i = 0; i < quantity; i++)
            {
                int seq = startSeq + i;
                string token = gen.Generate(product, batch, seq);
                tokens.Add((seq, token));
                task.Increment(1);
            }
            task.Description = "Done!";
        });
    sw.Stop();

    // Output directory
    string outputDir = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.Desktop),
        "infometa-codes",
        $"{SanitizeFilename(gen.BrandName)}-{SanitizeFilename(batchCode)}-{DateTime.Now:yyyyMMdd-HHmmss}");
    Directory.CreateDirectory(outputDir);

    // Export CSV
    string csvPath = Path.Combine(outputDir, "tokens.csv");
    var csv = new StringBuilder();
    csv.AppendLine("sequence,token,brand,product,sku,batch,industry");
    foreach (var (seq, token) in tokens)
    {
        csv.AppendLine($"{seq},\"{token}\",\"{CsvEscape(gen.BrandName)}\",\"{CsvEscape(productName)}\",\"{CsvEscape(productSku)}\",\"{CsvEscape(batchCode)}\",\"{CsvEscape(industry)}\"");
    }
    File.WriteAllText(csvPath, csv.ToString());

    AnsiConsole.MarkupLine($"\n[green]Generated {tokens.Count} codes in {sw.Elapsed.TotalSeconds:F1}s[/]");
    AnsiConsole.MarkupLine($"[green]CSV exported to:[/] [link]{Markup.Escape(csvPath)}[/]");

    // Export QR code images
    if (generateQr)
    {
        string qrDir = Path.Combine(outputDir, "qr-codes");
        var label = new QrLabelInfo(gen.BrandName, productName, productSku, batchCode);

        AnsiConsole.Progress()
            .Start(ctx =>
            {
                var task = ctx.AddTask($"Generating {tokens.Count} QR images...", maxValue: tokens.Count);
                QrCodeExporter.ExportBatch(tokens, qrDir, SanitizeFilename(productSku), label, qrPixels,
                    _ => task.Increment(1));
                task.Description = "Done!";
            });

        AnsiConsole.MarkupLine($"[green]QR images exported to:[/] [link]{Markup.Escape(qrDir)}[/]");
    }

    AnsiConsole.MarkupLine($"[green]Output folder:[/] [link]{Markup.Escape(outputDir)}[/]");

    // Sample tokens
    AnsiConsole.WriteLine();
    AnsiConsole.MarkupLine("[grey]Sample tokens (first 3):[/]");
    foreach (var (seq, token) in tokens.Take(3))
    {
        string display = token.Length > 80 ? token[..80] + "..." : token;
        AnsiConsole.MarkupLine($"  [dim]#{seq}[/] {Markup.Escape(display)}");
    }

    // Verify first token as sanity check
    var result = gen.Verify(tokens[0].Token);
    AnsiConsole.MarkupLine(result.Valid
        ? "[green]Self-verification: PASS[/]"
        : $"[red]Self-verification: FAIL ({result.FailureReason})[/]");
}

static void VerifyTokenFlow(TokenV3Generator gen)
{
    string token = AnsiConsole.Ask<string>("Enter [teal]token[/]:");
    var result = gen.Verify(token);

    if (result.Valid && result.Payload != null)
    {
        AnsiConsole.MarkupLine("[green]Token is VALID[/]");
        var table = new Table().Border(TableBorder.Rounded);
        table.AddColumn("Field");
        table.AddColumn("Value");
        table.AddRow("Version", result.Payload.V.ToString());
        table.AddRow("Key ID", result.Payload.Kid);
        table.AddRow("Key Ver", result.Payload.Kv.ToString());
        table.AddRow("Brand", result.Payload.Bn);
        table.AddRow("Brand Code", result.Payload.Bc);
        table.AddRow("Product", result.Payload.Pn);
        table.AddRow("SKU", result.Payload.Ps);
        table.AddRow("Industry", result.Payload.Pi);
        if (!string.IsNullOrEmpty(result.Payload.Pc)) table.AddRow("Category", result.Payload.Pc);
        table.AddRow("Batch", result.Payload.Btc);
        if (!string.IsNullOrEmpty(result.Payload.Md)) table.AddRow("Mfg Date", result.Payload.Md);
        if (!string.IsNullOrEmpty(result.Payload.Ed)) table.AddRow("Exp Date", result.Payload.Ed);
        table.AddRow("Sequence", result.Payload.Sq.ToString());
        table.AddRow("Issued", DateTimeOffset.FromUnixTimeSeconds(result.Payload.Ia).ToString("u"));
        AnsiConsole.Write(table);
    }
    else
    {
        AnsiConsole.MarkupLine($"[red]Token is INVALID[/]: {result.FailureReason}");
        if (result.Tampered)
            AnsiConsole.MarkupLine("[red]WARNING: Token may have been tampered with![/]");
    }
}

static void ShowKeyInfo(BrandKeyFile keyFile)
{
    var table = new Table().Border(TableBorder.Rounded).Title("[teal]Brand Key Details[/]");
    table.AddColumn("Property");
    table.AddColumn("Value");
    table.AddRow("Key ID", keyFile.KeyId);
    table.AddRow("Brand", keyFile.BrandName);
    table.AddRow("Brand Code", keyFile.BrandCode);
    table.AddRow("Version", keyFile.Version.ToString());
    table.AddRow("Issued", keyFile.IssuedAt);
    table.AddRow("Expires", keyFile.ExpiresAt);
    table.AddRow("Key (first 8)", keyFile.EncryptionKey[..8] + "...");

    bool expired = DateTime.TryParse(keyFile.ExpiresAt, out var exp) && exp < DateTime.UtcNow;
    table.AddRow("Status", expired ? "[red]EXPIRED[/]" : "[green]ACTIVE[/]");

    AnsiConsole.Write(table);
}

static (BrandKeyFile?, TokenV3Generator?) LoadKeyFileInteractive()
{
    string path = AnsiConsole.Ask<string>("Enter path to [teal]brand key file[/] (.json):");
    path = path.Trim('"', '\'', ' ');

    return TryLoadKey(path);
}

// ══════════════════════════════════════════════════════════════
// Key File Loading
// ══════════════════════════════════════════════════════════════

static string? FindKeyFile()
{
    // Look for *.json files matching brand key pattern in the current directory
    var candidates = Directory.GetFiles(Directory.GetCurrentDirectory(), "*.json")
        .Where(f =>
        {
            try
            {
                string text = File.ReadAllText(f);
                return text.Contains("\"keyId\"") && text.Contains("\"encryptionKey\"");
            }
            catch { return false; }
        })
        .ToList();

    if (candidates.Count == 1) return candidates[0];
    if (candidates.Count > 1)
    {
        string selected = AnsiConsole.Prompt(
            new SelectionPrompt<string>()
                .Title("Multiple key files found. Select one:")
                .AddChoices(candidates.Select(c => Path.GetFileName(c)!)));
        return candidates.First(c => Path.GetFileName(c) == selected);
    }
    return null;
}

static (BrandKeyFile?, TokenV3Generator?) TryLoadKey(string path)
{
    if (!File.Exists(path))
    {
        AnsiConsole.MarkupLine($"[red]File not found:[/] {Markup.Escape(path)}");
        return (null, null);
    }

    try
    {
        string json = File.ReadAllText(path);
        var keyFile = JsonSerializer.Deserialize<BrandKeyFile>(json);
        if (keyFile == null || string.IsNullOrEmpty(keyFile.KeyId))
        {
            AnsiConsole.MarkupLine("[red]Invalid key file format.[/]");
            return (null, null);
        }

        var gen = new TokenV3Generator(keyFile);
        AnsiConsole.MarkupLine($"[green]Key loaded successfully:[/] {Markup.Escape(keyFile.BrandName)} (v{keyFile.Version})");
        return (keyFile, gen);
    }
    catch (InvalidOperationException ex)
    {
        AnsiConsole.MarkupLine($"[red]{Markup.Escape(ex.Message)}[/]");
        return (null, null);
    }
    catch (Exception ex)
    {
        AnsiConsole.MarkupLine($"[red]Error loading key file:[/] {Markup.Escape(ex.Message)}");
        return (null, null);
    }
}

// ══════════════════════════════════════════════════════════════
// CLI Commands
// ══════════════════════════════════════════════════════════════

// dotnet run -- generate <keyFile> [--product "Name" --sku "SKU" --industry "ind"
//   --batch "BATCH-001" --qty 100 --start-seq 1 --mfg-date 2026-01-01 --exp-date 2027-01-01]
static void RunCliGenerate(string[] args)
{
    string keyPath = args[1];
    var (keyFile, gen) = TryLoadKeySilent(keyPath);
    if (gen == null) { Console.Error.WriteLine($"ERROR: Failed to load key file: {keyPath}"); Environment.Exit(1); return; }

    string? productName = GetArg(args, "--product");
    string? sku         = GetArg(args, "--sku");
    string? industry    = GetArg(args, "--industry");
    string? category    = GetArg(args, "--category");
    string? batchCode   = GetArg(args, "--batch");
    string? mfgDate     = GetArg(args, "--mfg-date");
    string? expDate     = GetArg(args, "--exp-date");
    int qty = int.TryParse(GetArg(args, "--qty"), out var q) ? q : 100;
    int startSeq = int.TryParse(GetArg(args, "--start-seq"), out var s) ? s : 1;
    string? output = GetArg(args, "--output");
    bool generateQr = HasFlag(args, "--qr");
    int qrPixels = int.TryParse(GetArg(args, "--qr-size"), out var qp) ? qp : DefaultQrPixelsPerModule;
    string? verifyUrl = GetArg(args, "--verify-url");
    if (verifyUrl != null) QrCodeExporter.VerifyBaseUrl = verifyUrl;

    if (productName == null || sku == null || industry == null || batchCode == null)
    {
        Console.Error.WriteLine("ERROR: Required arguments: --product, --sku, --industry, --batch");
        Environment.Exit(1);
        return;
    }

    var product = new ProductInfo(productName, sku, industry, category);
    var batch = new BatchInfo(batchCode, mfgDate, expDate);

    Console.WriteLine($"Generating {qty} tokens for {keyFile!.BrandName} / {productName}...");
    var sw = Stopwatch.StartNew();
    var tokens = new List<(int Seq, string Token)>();

    for (int i = 0; i < qty; i++)
    {
        int seq = startSeq + i;
        tokens.Add((seq, gen.Generate(product, batch, seq)));
    }
    sw.Stop();

    // Output directory
    string outputDir = output ?? Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.Desktop),
        "infometa-codes",
        $"{SanitizeFilename(keyFile.BrandName)}-{SanitizeFilename(batchCode)}-{DateTime.Now:yyyyMMdd-HHmmss}");
    Directory.CreateDirectory(outputDir);

    // Export CSV
    string csvPath = Path.Combine(outputDir, "tokens.csv");
    var csv = new StringBuilder();
    csv.AppendLine("sequence,token,brand,product,sku,batch,industry");
    foreach (var (seq, token) in tokens)
        csv.AppendLine($"{seq},\"{token}\",\"{CsvEscape(keyFile.BrandName)}\",\"{CsvEscape(productName)}\",\"{CsvEscape(sku)}\",\"{CsvEscape(batchCode)}\",\"{CsvEscape(industry)}\"");
    File.WriteAllText(csvPath, csv.ToString());

    Console.WriteLine($"Generated {tokens.Count} codes in {sw.Elapsed.TotalSeconds:F1}s");
    Console.WriteLine($"CSV: {csvPath}");

    // Export QR images
    if (generateQr)
    {
        string qrDir = Path.Combine(outputDir, "qr-codes");
        var label = new QrLabelInfo(keyFile.BrandName, productName, sku, batchCode);
        QrCodeExporter.ExportBatch(tokens, qrDir, SanitizeFilename(sku), label, qrPixels);
        Console.WriteLine($"QR images: {qrDir} ({tokens.Count} PNGs)");
    }
}

// dotnet run -- verify <keyFile> <token>
static void RunCliVerify(string[] args)
{
    string keyPath = args[1];
    string token = args.Length > 2 ? args[2] : "";
    if (string.IsNullOrEmpty(token)) { Console.Error.WriteLine("ERROR: provide a token as 3rd argument"); return; }

    var (_, gen) = TryLoadKeySilent(keyPath);
    if (gen == null) { Console.Error.WriteLine($"ERROR: Failed to load key file: {keyPath}"); return; }

    var result = gen.Verify(token);
    if (result.Valid && result.Payload != null)
    {
        Console.WriteLine("VALID");
        Console.WriteLine($"  Brand:      {result.Payload.Bn}");
        Console.WriteLine($"  Product:    {result.Payload.Pn} ({result.Payload.Ps})");
        Console.WriteLine($"  Industry:   {result.Payload.Pi}");
        Console.WriteLine($"  Batch:      {result.Payload.Btc}");
        Console.WriteLine($"  Sequence:   {result.Payload.Sq}");
        Console.WriteLine($"  Issued:     {DateTimeOffset.FromUnixTimeSeconds(result.Payload.Ia):u}");
    }
    else
    {
        Console.WriteLine($"INVALID: {result.FailureReason}");
        if (result.Tampered) Console.WriteLine("  WARNING: Possible tampering!");
    }
}

static void RunCliKeyInfo(string keyPath)
{
    var (keyFile, _) = TryLoadKeySilent(keyPath);
    if (keyFile == null) { Console.Error.WriteLine($"ERROR: Failed to load key file: {keyPath}"); return; }

    Console.WriteLine($"Key ID:     {keyFile.KeyId}");
    Console.WriteLine($"Brand:      {keyFile.BrandName}");
    Console.WriteLine($"Brand Code: {keyFile.BrandCode}");
    Console.WriteLine($"Version:    {keyFile.Version}");
    Console.WriteLine($"Issued:     {keyFile.IssuedAt}");
    Console.WriteLine($"Expires:    {keyFile.ExpiresAt}");
}

static void PrintCliHelp()
{
    Console.WriteLine("Infometa QR Code Generator v3.0");
    Console.WriteLine();
    Console.WriteLine("USAGE:");
    Console.WriteLine("  InfometaCodeGen                                    Interactive mode");
    Console.WriteLine("  InfometaCodeGen generate <keyFile> [options]       Generate tokens");
    Console.WriteLine("  InfometaCodeGen verify <keyFile> <token>           Verify a token");
    Console.WriteLine("  InfometaCodeGen key-info <keyFile>                 Show key info");
    Console.WriteLine();
    Console.WriteLine("GENERATE OPTIONS:");
    Console.WriteLine("  --product \"Product Name\"     Product name (required)");
    Console.WriteLine("  --sku \"SKU-001\"              Product SKU (required)");
    Console.WriteLine("  --industry \"dairy\"           Industry (required)");
    Console.WriteLine("  --batch \"BATCH-001\"          Batch code (required)");
    Console.WriteLine("  --qty 100                    Number of codes (default: 100)");
    Console.WriteLine("  --start-seq 1                Starting sequence (default: 1)");
    Console.WriteLine("  --category \"ghee\"            Product category (optional)");
    Console.WriteLine("  --mfg-date 2026-01-01        Manufacture date (optional)");
    Console.WriteLine("  --exp-date 2027-01-01        Expiry date (optional)");
    Console.WriteLine("  --output dir                 Custom output directory (optional)");
    Console.WriteLine("  --qr                         Generate QR code PNG images");
    Console.WriteLine("  --qr-size 10                 Pixels per QR module (default: 10)");
    Console.WriteLine("  --verify-url URL             Custom verify URL (default: https://infometa.tech/verify)");
}

// ══════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════

static (BrandKeyFile?, TokenV3Generator?) TryLoadKeySilent(string path)
{
    if (!File.Exists(path)) return (null, null);
    try
    {
        var keyFile = JsonSerializer.Deserialize<BrandKeyFile>(File.ReadAllText(path));
        if (keyFile == null || string.IsNullOrEmpty(keyFile.KeyId)) return (null, null);
        return (keyFile, new TokenV3Generator(keyFile));
    }
    catch { return (null, null); }
}

static string? GetArg(string[] args, string name)
{
    for (int i = 0; i < args.Length - 1; i++)
        if (args[i] == name) return args[i + 1];
    return null;
}

static bool HasFlag(string[] args, string name) =>
    args.Any(a => a == name);

static string SanitizeFilename(string name) =>
    string.Concat(name.Select(c => Path.GetInvalidFileNameChars().Contains(c) ? '_' : c));

static string CsvEscape(string value) =>
    value.Replace("\"", "\"\"");
