Console.WriteLine("╔══════════════════════════════════════════════════════╗");
Console.WriteLine("║  DenseCode - High-Density Color Grid Format         ║");
Console.WriteLine("║  16 colors × 4 bits/cell — exceeds QR capacity      ║");
Console.WriteLine("╚══════════════════════════════════════════════════════╝");
Console.WriteLine("\n  1. Encode file → DenseCode image (.png)");
Console.WriteLine("  2. Decode DenseCode image → file");
Console.Write("\nChoice: ");
switch (Console.ReadLine()?.Trim())
{
    case "1": Encoder.Run(); break;
    case "2": Decoder.Run(); break;
    default: Console.WriteLine("Invalid choice."); break;
}
