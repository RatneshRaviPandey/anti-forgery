using System.Text;
using System.Text.Json;
using QRCoder;
using SkiaSharp;
using Spectre.Console;
using ZXing.SkiaSharp;

// ── Configuration ──────────────────────────────────────────────────
// QR Version 40, ECC-L can hold 2953 bytes in binary mode.
// We use a conservative chunk size to keep QR codes reliably scannable.
const int DefaultChunkSize = 2500; // bytes of Base64 per QR code

if (args.Length == 0)
{
    // Interactive mode - prompt the user
    await RunInteractive();
    return;
}

var command = args[0].ToLowerInvariant();

switch (command)
{
    case "encode":
        await RunEncode(args);
        break;
    case "decode":
        await RunDecode(args);
        break;
    case "info":
        RunInfo(args);
        break;
    case "--help":
    case "-h":
        PrintUsage();
        break;
    default:
        PrintUsage();
        break;
}

// ── Interactive Mode ───────────────────────────────────────────────
async Task RunInteractive()
{
    AnsiConsole.Write(new FigletText("FileToQR").Color(Color.Blue));
    AnsiConsole.MarkupLine("[dim]Convert any file to QR codes and back[/]\n");

    while (true)
    {
        var action = AnsiConsole.Prompt(
            new SelectionPrompt<string>()
                .Title("[bold]What would you like to do?[/]")
                .AddChoices("Encode a file to QR codes", "Decode QR codes to a file", "Show file info", "Exit"));

        switch (action)
        {
            case "Encode a file to QR codes":
                await RunEncodeInteractive();
                break;
            case "Decode QR codes to a file":
                await RunDecodeInteractive();
                break;
            case "Show file info":
                RunInfoInteractive();
                break;
            case "Exit":
                return;
        }

        AnsiConsole.WriteLine();
    }
}

async Task RunEncodeInteractive()
{
    var filePath = AnsiConsole.Prompt(
        new TextPrompt<string>("[bold]Enter the file path to encode:[/]")
            .ValidationErrorMessage("[red]File not found[/]")
            .Validate(path => File.Exists(path) ? ValidationResult.Success() : ValidationResult.Error("[red]File not found[/]")));

    var outputDir = AnsiConsole.Prompt(
        new TextPrompt<string>("[bold]Output directory for QR images:[/]")
            .DefaultValue("qr_output"));

    var chunkSize = AnsiConsole.Prompt(
        new TextPrompt<int>("[bold]Chunk size (bytes per QR code):[/]")
            .DefaultValue(DefaultChunkSize)
            .ValidationErrorMessage("[red]Must be a positive number[/]")
            .Validate(n => n > 0 ? ValidationResult.Success() : ValidationResult.Error("[red]Must be > 0[/]")));

    await RunEncodeCore(filePath, outputDir, chunkSize);
}

async Task RunDecodeInteractive()
{
    var qrFolder = AnsiConsole.Prompt(
        new TextPrompt<string>("[bold]Enter the QR images folder path:[/]")
            .ValidationErrorMessage("[red]Folder not found[/]")
            .Validate(path => Directory.Exists(path) ? ValidationResult.Success() : ValidationResult.Error("[red]Folder not found[/]")));

    var outputPath = AnsiConsole.Prompt(
        new TextPrompt<string>("[bold]Output file path (leave blank for original name):[/]")
            .AllowEmpty());

    await RunDecodeCore(qrFolder, string.IsNullOrWhiteSpace(outputPath) ? null : outputPath);
}

void RunInfoInteractive()
{
    var filePath = AnsiConsole.Prompt(
        new TextPrompt<string>("[bold]Enter the file path:[/]")
            .ValidationErrorMessage("[red]File not found[/]")
            .Validate(path => File.Exists(path) ? ValidationResult.Success() : ValidationResult.Error("[red]File not found[/]")));

    var chunkSize = AnsiConsole.Prompt(
        new TextPrompt<int>("[bold]Chunk size (bytes per QR code):[/]")
            .DefaultValue(DefaultChunkSize));

    RunInfoCore(filePath, chunkSize);
}

// ── Encode: File → QR Codes ────────────────────────────────────────
async Task RunEncode(string[] args)
{
    if (args.Length < 2)
    {
        AnsiConsole.MarkupLine("[red]Usage: FileToQR encode <file-path> [[--output <dir>]] [[--chunk-size <bytes>]][/]");
        return;
    }

    var filePath = args[1];
    var outputDir = "qr_output";
    var chunkSize = DefaultChunkSize;

    for (int i = 2; i < args.Length; i++)
    {
        if (args[i] == "--output" && i + 1 < args.Length)
            outputDir = args[++i];
        else if (args[i] == "--chunk-size" && i + 1 < args.Length)
            chunkSize = int.Parse(args[++i]);
    }

    if (!File.Exists(filePath))
    {
        AnsiConsole.MarkupLine($"[red]File not found:[/] {filePath}");
        return;
    }

    await RunEncodeCore(filePath, outputDir, chunkSize);
}

async Task RunEncodeCore(string filePath, string outputDir, int chunkSize)
{
    var fileBytes = await File.ReadAllBytesAsync(filePath);
    var fileName = Path.GetFileName(filePath);
    var base64 = Convert.ToBase64String(fileBytes);

    // Split into chunks
    var chunks = new List<string>();
    for (int offset = 0; offset < base64.Length; offset += chunkSize)
    {
        var length = Math.Min(chunkSize, base64.Length - offset);
        chunks.Add(base64.Substring(offset, length));
    }

    var totalChunks = chunks.Count;

    Directory.CreateDirectory(outputDir);

    // Write manifest as first QR code (index 0)
    var manifest = new ChunkManifest
    {
        FileName = fileName,
        FileSize = fileBytes.Length,
        TotalChunks = totalChunks,
        ChunkSize = chunkSize,
        Sha256 = ComputeSha256(fileBytes)
    };

    AnsiConsole.MarkupLine($"[bold blue]File:[/] {fileName}");
    AnsiConsole.MarkupLine($"[bold blue]Size:[/] {FormatBytes(fileBytes.Length)}");
    AnsiConsole.MarkupLine($"[bold blue]QR Codes:[/] {totalChunks + 1} (1 manifest + {totalChunks} data)");
    AnsiConsole.MarkupLine($"[bold blue]Output:[/] {Path.GetFullPath(outputDir)}");
    AnsiConsole.WriteLine();

    await AnsiConsole.Progress()
        .StartAsync(async ctx =>
        {
            var task = ctx.AddTask("[green]Generating QR codes[/]", maxValue: totalChunks + 1);

            // Generate manifest QR
            var manifestJson = JsonSerializer.Serialize(manifest);
            var manifestPayload = $"FILETOQR:MANIFEST:{manifestJson}";
            GenerateQrImage(manifestPayload, Path.Combine(outputDir, "qr_000_manifest.png"));
            task.Increment(1);

            // Generate data QR codes
            for (int i = 0; i < totalChunks; i++)
            {
                var payload = $"FILETOQR:{i + 1}:{totalChunks}:{chunks[i]}";
                var qrPath = Path.Combine(outputDir, $"qr_{i + 1:D3}_data.png");
                GenerateQrImage(payload, qrPath);
                task.Increment(1);
            }

            await Task.CompletedTask;
        });

    AnsiConsole.MarkupLine($"\n[bold green]Done![/] {totalChunks + 1} QR code images saved to [blue]{Path.GetFullPath(outputDir)}[/]");
    AnsiConsole.MarkupLine("[dim]To reconstruct: FileToQR decode <qr-folder> --output <file-path>[/]");
}

// ── Decode: QR Codes → File ────────────────────────────────────────
async Task RunDecode(string[] args)
{
    if (args.Length < 2)
    {
        AnsiConsole.MarkupLine("[red]Usage: FileToQR decode <qr-folder> [[--output <file-path>]][/]");
        return;
    }

    var qrFolder = args[1];
    string? outputPath = null;

    for (int i = 2; i < args.Length; i++)
    {
        if (args[i] == "--output" && i + 1 < args.Length)
            outputPath = args[++i];
    }

    if (!Directory.Exists(qrFolder))
    {
        AnsiConsole.MarkupLine($"[red]Folder not found:[/] {qrFolder}");
        return;
    }

    await RunDecodeCore(qrFolder, outputPath);
}

async Task RunDecodeCore(string qrFolder, string? outputPath)
{
    var pngFiles = Directory.GetFiles(qrFolder, "*.png").OrderBy(f => f).ToArray();

    if (pngFiles.Length == 0)
    {
        AnsiConsole.MarkupLine("[red]No PNG files found in the folder.[/]");
        return;
    }

    AnsiConsole.MarkupLine($"[bold blue]Found {pngFiles.Length} QR code images[/]");

    ChunkManifest? manifest = null;
    var dataChunks = new SortedDictionary<int, string>();

    await AnsiConsole.Progress()
        .StartAsync(async ctx =>
        {
            var task = ctx.AddTask("[green]Reading QR codes[/]", maxValue: pngFiles.Length);

            foreach (var pngFile in pngFiles)
            {
                var decoded = DecodeQrImage(pngFile);

                if (decoded == null)
                {
                    AnsiConsole.MarkupLine($"[yellow]Warning: Could not decode {Path.GetFileName(pngFile)}[/]");
                    task.Increment(1);
                    continue;
                }

                if (decoded.StartsWith("FILETOQR:MANIFEST:"))
                {
                    var json = decoded["FILETOQR:MANIFEST:".Length..];
                    manifest = JsonSerializer.Deserialize<ChunkManifest>(json);
                }
                else if (decoded.StartsWith("FILETOQR:"))
                {
                    // Format: FILETOQR:<index>:<total>:<data>
                    var parts = decoded["FILETOQR:".Length..].Split(':', 3);
                    if (parts.Length == 3 && int.TryParse(parts[0], out var idx))
                    {
                        dataChunks[idx] = parts[2];
                    }
                }

                task.Increment(1);
            }

            await Task.CompletedTask;
        });

    if (manifest == null)
    {
        AnsiConsole.MarkupLine("[red]No manifest QR code found. Cannot reconstruct file.[/]");
        return;
    }

    // Determine output path
    outputPath ??= manifest.FileName;

    AnsiConsole.MarkupLine($"[bold blue]Original file:[/] {manifest.FileName}");
    AnsiConsole.MarkupLine($"[bold blue]Original size:[/] {FormatBytes(manifest.FileSize)}");
    AnsiConsole.MarkupLine($"[bold blue]Expected chunks:[/] {manifest.TotalChunks}");
    AnsiConsole.MarkupLine($"[bold blue]Decoded chunks:[/] {dataChunks.Count}");

    if (dataChunks.Count < manifest.TotalChunks)
    {
        var missing = Enumerable.Range(1, manifest.TotalChunks)
            .Where(i => !dataChunks.ContainsKey(i))
            .ToArray();
        AnsiConsole.MarkupLine($"[red]Missing chunks: {string.Join(", ", missing)}[/]");
        AnsiConsole.MarkupLine("[red]File reconstruction may be incomplete or corrupted.[/]");
    }

    // Reassemble
    var sb = new StringBuilder();
    for (int i = 1; i <= manifest.TotalChunks; i++)
    {
        if (dataChunks.TryGetValue(i, out var chunk))
            sb.Append(chunk);
    }

    var fileBytes = Convert.FromBase64String(sb.ToString());

    // Verify checksum
    var actualHash = ComputeSha256(fileBytes);
    if (actualHash == manifest.Sha256)
    {
        AnsiConsole.MarkupLine("[bold green]Checksum verified![/]");
    }
    else
    {
        AnsiConsole.MarkupLine("[bold red]Checksum mismatch! File may be corrupted.[/]");
    }

    await File.WriteAllBytesAsync(outputPath, fileBytes);
    AnsiConsole.MarkupLine($"\n[bold green]File reconstructed:[/] {Path.GetFullPath(outputPath)} ({FormatBytes(fileBytes.Length)})");
}

// ── Info: Show file stats ──────────────────────────────────────────
void RunInfo(string[] args)
{
    if (args.Length < 2)
    {
        AnsiConsole.MarkupLine("[red]Usage: FileToQR info <file-path> [[--chunk-size <bytes>]][/]");
        return;
    }

    var filePath = args[1];
    var chunkSize = DefaultChunkSize;

    for (int i = 2; i < args.Length; i++)
    {
        if (args[i] == "--chunk-size" && i + 1 < args.Length)
            chunkSize = int.Parse(args[++i]);
    }

    if (!File.Exists(filePath))
    {
        AnsiConsole.MarkupLine($"[red]File not found:[/] {filePath}");
        return;
    }

    RunInfoCore(filePath, chunkSize);
}

void RunInfoCore(string filePath, int chunkSize)
{
    var fileSize = new FileInfo(filePath).Length;
    var base64Length = (int)Math.Ceiling(fileSize / 3.0) * 4;
    var totalChunks = (int)Math.Ceiling((double)base64Length / chunkSize);

    var table = new Table();
    table.AddColumn("Property");
    table.AddColumn("Value");
    table.AddRow("File", Path.GetFileName(filePath));
    table.AddRow("File Size", FormatBytes(fileSize));
    table.AddRow("Base64 Size", FormatBytes(base64Length));
    table.AddRow("Chunk Size", $"{chunkSize} chars");
    table.AddRow("QR Codes Needed", $"{totalChunks + 1} (1 manifest + {totalChunks} data)");

    AnsiConsole.Write(table);
}

// ── Helpers ────────────────────────────────────────────────────────
void GenerateQrImage(string payload, string outputPath)
{
    using var generator = new QRCodeGenerator();
    using var data = generator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.L);

    // Render to bitmap via SkiaSharp
    int moduleCount = data.ModuleMatrix.Count;
    int scale = 10;
    int border = 4 * scale;
    int size = moduleCount * scale + border * 2;

    using var surface = SKSurface.Create(new SKImageInfo(size, size));
    var canvas = surface.Canvas;
    canvas.Clear(SKColors.White);

    using var blackPaint = new SKPaint { Color = SKColors.Black, IsAntialias = false };

    for (int y = 0; y < moduleCount; y++)
    {
        for (int x = 0; x < moduleCount; x++)
        {
            if (data.ModuleMatrix[y][x])
            {
                canvas.DrawRect(border + x * scale, border + y * scale, scale, scale, blackPaint);
            }
        }
    }

    using var image = surface.Snapshot();
    using var encoded = image.Encode(SKEncodedImageFormat.Png, 100);
    using var stream = File.OpenWrite(outputPath);
    encoded.SaveTo(stream);
}

string? DecodeQrImage(string imagePath)
{
    using var bitmap = SKBitmap.Decode(imagePath);
    if (bitmap == null) return null;

    var reader = new BarcodeReader();
    var result = reader.Decode(bitmap);
    return result?.Text;
}

string ComputeSha256(byte[] data)
{
    var hash = System.Security.Cryptography.SHA256.HashData(data);
    return Convert.ToHexString(hash).ToLowerInvariant();
}

string FormatBytes(long bytes)
{
    string[] sizes = ["B", "KB", "MB", "GB"];
    double len = bytes;
    int order = 0;
    while (len >= 1024 && order < sizes.Length - 1)
    {
        order++;
        len /= 1024;
    }
    return $"{len:0.##} {sizes[order]}";
}

void PrintUsage()
{
    AnsiConsole.MarkupLine("[bold underline]FileToQR - Convert any file to QR codes[/]\n");
    AnsiConsole.MarkupLine("[bold]Commands:[/]");
    AnsiConsole.MarkupLine("  [green]encode[/] <file>   [[--output <dir>]] [[--chunk-size <n>]]  Convert file to QR code images");
    AnsiConsole.MarkupLine("  [green]decode[/] <folder> [[--output <file>]]                      Reconstruct file from QR images");
    AnsiConsole.MarkupLine("  [green]info[/]   <file>   [[--chunk-size <n>]]                     Preview how many QR codes needed");
    AnsiConsole.MarkupLine("\n[bold]Examples:[/]");
    AnsiConsole.MarkupLine("  FileToQR encode document.pdf");
    AnsiConsole.MarkupLine("  FileToQR encode photo.jpg --output my_qr_codes --chunk-size 2000");
    AnsiConsole.MarkupLine("  FileToQR decode qr_output --output restored.pdf");
    AnsiConsole.MarkupLine("  FileToQR info largefile.zip");
}

// ── Types ──────────────────────────────────────────────────────────
record ChunkManifest
{
    public string FileName { get; init; } = "";
    public long FileSize { get; init; }
    public int TotalChunks { get; init; }
    public int ChunkSize { get; init; }
    public string Sha256 { get; init; } = "";
}
