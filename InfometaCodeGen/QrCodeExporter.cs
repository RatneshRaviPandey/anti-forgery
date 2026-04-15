using QRCoder;
using System.Drawing;

namespace InfometaCodeGen;

/// <summary>
/// Exports QR code images from token data.
/// Uses QRCoder library (no SkiaSharp/ImageSharp dependency).
/// </summary>
public static class QrCodeExporter
{
    /// <summary>
    /// Generate a single QR code PNG image.
    /// </summary>
    public static byte[] GeneratePng(string content, int pixelsPerModule = 10)
    {
        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(content, QRCodeGenerator.ECCLevel.M);
        using var code = new PngByteQRCode(data);
        return code.GetGraphic(pixelsPerModule);
    }

    /// <summary>
    /// Save a single QR code to a PNG file.
    /// </summary>
    public static void SavePng(string content, string filePath, int pixelsPerModule = 10)
    {
        var png = GeneratePng(content, pixelsPerModule);
        File.WriteAllBytes(filePath, png);
    }

    /// <summary>
    /// Export a batch of tokens as QR code PNG images into a directory.
    /// Returns the list of file paths created.
    /// </summary>
    public static List<string> ExportBatch(
        List<TokenResult> tokens, string outputDir,
        string prefix = "qr", int pixelsPerModule = 10)
    {
        Directory.CreateDirectory(outputDir);
        var files = new List<string>();

        foreach (var token in tokens)
        {
            var fileName = $"{prefix}_{token.Sequence:D4}.png";
            var filePath = Path.Combine(outputDir, fileName);
            SavePng(token.VerifyUrl, filePath, pixelsPerModule);
            files.Add(filePath);
        }

        return files;
    }

    /// <summary>
    /// Export batch with a manifest CSV file listing all tokens.
    /// </summary>
    public static string ExportBatchWithManifest(
        List<TokenResult> tokens, string outputDir,
        string prefix = "qr", int pixelsPerModule = 10)
    {
        var files = ExportBatch(tokens, outputDir, prefix, pixelsPerModule);

        // Write manifest CSV
        var manifestPath = Path.Combine(outputDir, "manifest.csv");
        using var writer = new StreamWriter(manifestPath);
        writer.WriteLine("sequence,token,verify_url,qr_file");
        for (int i = 0; i < tokens.Count; i++)
        {
            writer.WriteLine($"{tokens[i].Sequence},\"{tokens[i].Token}\",\"{tokens[i].VerifyUrl}\",\"{Path.GetFileName(files[i])}\"");
        }

        return manifestPath;
    }
}
