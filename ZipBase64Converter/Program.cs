using System;
using System.IO;

class Program
{
    static void Main()
    {
        Console.Write("Choose operation (1 = Zip to Base64, 2 = Base64 to Zip): ");
        string? choice = Console.ReadLine()?.Trim();

        if (choice == "1")
        {
            Console.Write("Enter path to .zip file: ");
            string? zipPath = Console.ReadLine()?.Trim();
            if (string.IsNullOrEmpty(zipPath) || !File.Exists(zipPath))
            {
                Console.WriteLine("File not found.");
                return;
            }

            string outputPath = Path.ChangeExtension(zipPath, ".txt");
            Console.Write($"Output path [{outputPath}]: ");
            string? customOutput = Console.ReadLine()?.Trim();
            if (!string.IsNullOrEmpty(customOutput))
                outputPath = customOutput;

            byte[] zipBytes = File.ReadAllBytes(zipPath);
            string base64 = Convert.ToBase64String(zipBytes);
            File.WriteAllText(outputPath, base64);

            Console.WriteLine($"\nEncoded successfully!");
            Console.WriteLine($"Input:  {zipPath}");
            Console.WriteLine($"Output: {outputPath}");
            Console.WriteLine($"Size:   {zipBytes.Length:N0} bytes -> {base64.Length:N0} chars");
        }
        else if (choice == "2")
        {
            Console.Write("Enter path to Base64 text file: ");
            string? base64Path = Console.ReadLine()?.Trim();
            if (string.IsNullOrEmpty(base64Path) || !File.Exists(base64Path))
            {
                Console.WriteLine("File not found.");
                return;
            }

            string outputPath = Path.ChangeExtension(base64Path, ".zip");
            Console.Write($"Output path [{outputPath}]: ");
            string? customOutput = Console.ReadLine()?.Trim();
            if (!string.IsNullOrEmpty(customOutput))
                outputPath = customOutput;

            string base64 = File.ReadAllText(base64Path).Trim();
            byte[] zipBytes = Convert.FromBase64String(base64);
            File.WriteAllBytes(outputPath, zipBytes);

            Console.WriteLine($"\nDecoded successfully!");
            Console.WriteLine($"Input:  {base64Path}");
            Console.WriteLine($"Output: {outputPath}");
            Console.WriteLine($"Size:   {base64.Length:N0} chars -> {zipBytes.Length:N0} bytes");
        }
        else
        {
            Console.WriteLine("Invalid choice.");
        }
    }
}
