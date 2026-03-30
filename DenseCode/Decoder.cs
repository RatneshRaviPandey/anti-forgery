using System.Drawing;
using System.Text;
using static Shared;
static class Decoder
{
    public static void Run()
    {
        Console.Write("DenseCode image path: ");
        string? p=Console.ReadLine()?.Trim().Trim('"');
        if(string.IsNullOrEmpty(p)||!File.Exists(p)){Console.WriteLine("File not found.");return;}
        Console.WriteLine("\nDecoding...");
        using var bmp=new Bitmap(p);
        int side=(bmp.Width-QuietPx*2)/CellPx;
        Console.WriteLine($"  Image: {bmp.Width}x{bmp.Height}  Grid: {side}x{side}");
        int dc=side*side-4*FinderN*FinderN;
        byte[] all=new byte[(dc+1)/2];
        int ni=0;
        for(int r=0;r<side;r++)
            for(int c=0;c<side;c++)
                if(!IsCorner(r,c,side)&&ni<dc){
                    int px=QuietPx+c*CellPx+CellPx/2,py=QuietPx+r*CellPx+CellPx/2;
                    int v=NearestColor(bmp.GetPixel(px,py));
                    int bi=ni/2;
                    if(ni%2==0)all[bi]=(byte)(v<<4);else all[bi]|=(byte)v;
                    ni++;
                }
        using var ms=new MemoryStream(all);
        using var br=new BinaryReader(ms);
        string magic=Encoding.ASCII.GetString(br.ReadBytes(4));
        if(magic!="DC01"){Console.WriteLine("ERROR: Invalid DenseCode image.");return;}
        uint origSz=br.ReadUInt32(),compSz=br.ReadUInt32();
        ushort nl=br.ReadUInt16();
        string fn=Encoding.UTF8.GetString(br.ReadBytes(nl));
        uint expCrc=br.ReadUInt32();
        byte[] comp=br.ReadBytes((int)compSz);
        Console.WriteLine($"  File: {fn}  Original: {origSz:N0}B  Compressed: {compSz:N0}B");
        byte[] dec=Compress.UnGZip(comp);
        uint crc=Compress.Crc32(dec);
        Console.WriteLine($"  CRC32: {(crc==expCrc?"OK":"MISMATCH!")}  Size: {(dec.Length==origSz?"OK":"MISMATCH!")}");
        if(crc!=expCrc||dec.Length!=origSz) Console.WriteLine("  WARNING: Data integrity check failed!");
        string dir=Path.GetDirectoryName(p)??".",outPath=Path.Combine(dir,fn);
        if(File.Exists(outPath)){
            Console.Write($"  '{fn}' exists. Overwrite? [y/N]: ");
            if(Console.ReadLine()?.Trim().ToLowerInvariant()!="y") outPath=Path.Combine(dir,"decoded_"+fn);
        }
        File.WriteAllBytes(outPath,dec);
        Console.WriteLine($"  Saved: {outPath}\nDone!");
    }
}
