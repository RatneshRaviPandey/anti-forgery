using QRCoder;
using SkiaSharp;

namespace InfometaCodeGen;

/// <summary>
/// Generates QR code PNG images from tokens using QRCoder + SkiaSharp.
/// Each QR image includes a label strip at the bottom with sequence, SKU, and batch info.
/// </summary>
public static class QrCodeExporter
{
    private const int DefaultModulePixels = 10;  // pixels per QR module
    private const int LabelHeight = 60;
    private const int Padding = 20;

    /// <summary>Base URL for verification. QR codes will encode: {VerifyBaseUrl}?code={token}</summary>
    public static string VerifyBaseUrl { get; set; } = "https://infometa.tech/verify";

    /// <summary>
    /// Export a single QR code PNG image for the given token.
    /// </summary>
    public static void ExportPng(string token, string filePath, QrLabelInfo? label = null, int pixelsPerModule = DefaultModulePixels)
    {
        byte[] png = GeneratePng(token, label, pixelsPerModule);
        File.WriteAllBytes(filePath, png);
    }

    /// <summary>
    /// Export QR code images for all tokens into the specified directory.
    /// Images are named: {prefix}-{sequence:D5}.png
    /// </summary>
    public static void ExportBatch(
        IReadOnlyList<(int Seq, string Token)> tokens,
        string outputDir,
        string filePrefix,
        QrLabelInfo baseLabel,
        int pixelsPerModule = DefaultModulePixels,
        Action<int>? onProgress = null)
    {
        Directory.CreateDirectory(outputDir);

        for (int i = 0; i < tokens.Count; i++)
        {
            var (seq, token) = tokens[i];
            var label = baseLabel with { Sequence = seq };
            string fileName = $"{SanitizeFilename(filePrefix)}-{seq:D5}.png";
            string filePath = Path.Combine(outputDir, fileName);

            byte[] png = GeneratePng(token, label, pixelsPerModule);
            File.WriteAllBytes(filePath, png);
            onProgress?.Invoke(i + 1);
        }
    }

    /// <summary>
    /// Generate a QR code PNG as a byte array (in-memory).
    /// </summary>
    public static byte[] GeneratePng(string token, QrLabelInfo? label = null, int pixelsPerModule = DefaultModulePixels)
    {
        // Encode a verification URL so scanning auto-opens the browser
        string qrContent = $"{VerifyBaseUrl}?code={Uri.EscapeDataString(token)}";

        using var qrGenerator = new QRCodeGenerator();
        QRCodeData qrData = qrGenerator.CreateQrCode(qrContent, QRCodeGenerator.ECCLevel.M);

        int moduleCount = qrData.ModuleMatrix.Count;
        int qrSize = moduleCount * pixelsPerModule;
        int imgWidth = qrSize + Padding * 2;
        int imgHeight = qrSize + Padding * 2 + (label != null ? LabelHeight : 0);

        using var surface = SKSurface.Create(new SKImageInfo(imgWidth, imgHeight, SKColorType.Rgba8888, SKAlphaType.Premul));
        var canvas = surface.Canvas;

        // White background
        canvas.Clear(SKColors.White);

        // Draw QR modules
        using var blackPaint = new SKPaint { Color = SKColors.Black, IsAntialias = false };
        for (int y = 0; y < moduleCount; y++)
        {
            for (int x = 0; x < moduleCount; x++)
            {
                if (qrData.ModuleMatrix[y][x])
                {
                    canvas.DrawRect(
                        Padding + x * pixelsPerModule,
                        Padding + y * pixelsPerModule,
                        pixelsPerModule,
                        pixelsPerModule,
                        blackPaint);
                }
            }
        }

        // Draw label strip at bottom
        if (label != null)
        {
            int labelY = qrSize + Padding * 2;

            // Separator line
            using var linePaint = new SKPaint { Color = new SKColor(200, 200, 200), StrokeWidth = 1, IsAntialias = true };
            canvas.DrawLine(Padding, labelY, imgWidth - Padding, labelY, linePaint);

            // Primary label: brand + product
            using var primaryFont = new SKFont(SKTypeface.Default, 13) { Edging = SKFontEdging.Antialias };
            using var primaryPaint = new SKPaint { Color = new SKColor(50, 50, 50), IsAntialias = true };
            string primaryText = $"{label.BrandName} — {label.ProductName}";
            canvas.DrawText(primaryText, Padding, labelY + 20, primaryFont, primaryPaint);

            // Secondary label: SKU | Batch | Seq
            using var secondaryFont = new SKFont(SKTypeface.Default, 11) { Edging = SKFontEdging.Antialias };
            using var secondaryPaint = new SKPaint { Color = new SKColor(120, 120, 120), IsAntialias = true };
            string secondaryText = $"SKU: {label.Sku}  |  Batch: {label.BatchCode}  |  #{label.Sequence}";
            canvas.DrawText(secondaryText, Padding, labelY + 40, secondaryFont, secondaryPaint);

            // Infometa watermark on the right
            using var watermarkFont = new SKFont(SKTypeface.Default, 9) { Edging = SKFontEdging.Antialias };
            using var watermarkPaint = new SKPaint { Color = new SKColor(180, 180, 180), IsAntialias = true };
            float wmWidth = watermarkFont.MeasureText("Infometa Verified");
            canvas.DrawText("Infometa Verified", imgWidth - Padding - wmWidth, labelY + 50, watermarkFont, watermarkPaint);
        }

        canvas.Flush();

        // Encode to PNG
        using var image = surface.Snapshot();
        using var data = image.Encode(SKEncodedImageFormat.Png, 100);
        return data.ToArray();
    }

    private static string SanitizeFilename(string name) =>
        string.Concat(name.Select(c => Path.GetInvalidFileNameChars().Contains(c) ? '_' : c));
}

/// <summary>Label metadata printed below the QR code.</summary>
public record QrLabelInfo(
    string BrandName,
    string ProductName,
    string Sku,
    string BatchCode,
    int Sequence = 0
);
