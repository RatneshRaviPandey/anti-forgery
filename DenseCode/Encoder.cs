using System.Drawing;using System.Drawing.Imaging;using System.Text;using static Shared;
static class Encoder{public static void Run(){
Console.Write("Input file path: ");
var p=Console.ReadLine()?.Trim().Trim('"');
if(string.IsNullOrEmpty(p)||!File.Exists(p)){Console.WriteLine("File not found.");return;}
var d=Path.Combine(Path.GetDirectoryName(p)??".",Path.GetFileNameWithoutExtension(p)+".densecode.png");
Console.Write($"Output [{d}]: ");var c=Console.ReadLine()?.Trim().Trim('"');
string o=string.IsNullOrEmpty(c)?d:c;
Console.WriteLine("\nEncoding...");
byte[] raw=File.ReadAllBytes(p),comp=Compress.GZip(raw);
var crc=Compress.Crc32(raw);var nm=Encoding.UTF8.GetBytes(Path.GetFileName(p));
byte[] pl;using(var ms=new MemoryStream())using(var w=new BinaryWriter(ms)){
w.Write(Encoding.ASCII.GetBytes("DC01"));w.Write((uint)raw.Length);w.Write((uint)comp.Length);
w.Write((ushort)nm.Length);w.Write(nm);w.Write(crc);w.Write(comp);pl=ms.ToArray();}
int nb=pl.Length*2,cn=4*FinderN*FinderN,s=(int)Math.Ceiling(Math.Sqrt(nb+cn));
s=Math.Max(s,FinderN*2+2);while(s*s-cn<nb)s++;int sz=QuietPx*2+s*CellPx;
Console.WriteLine($"  {raw.Length:N0}B -> {comp.Length:N0}B ({100.0*comp.Length/raw.Length:F1}%)");
Console.WriteLine($"  Grid:{s}x{s} Image:{sz}x{sz}px");
using var bmp=new Bitmap(sz,sz,PixelFormat.Format24bppRgb);using var g=Graphics.FromImage(bmp);
g.Clear(Color.White);g.FillRectangle(Brushes.Black,QuietPx,QuietPx,s*CellPx,s*CellPx);
int f=FinderN;DrawFinder(g,0,0,FinderInner[0]);DrawFinder(g,s-f,0,FinderInner[1]);
DrawFinder(g,0,s-f,FinderInner[2]);DrawFinder(g,s-f,s-f,FinderInner[3]);
for(int i=0;i<16&&f+i<s-f;i++)FillCell(g,f+i,0,Palette[i]);
int ni=0;for(int r=0;r<s&&ni<nb;r++)for(int cc=0;cc<s&&ni<nb;cc++)
if(!IsCorner(r,cc,s)){FillCell(g,cc,r,Palette[(ni%2==0)?(pl[ni/2]>>4)&0xF:pl[ni/2]&0xF]);ni++;}
bmp.Save(o,ImageFormat.Png);
Console.WriteLine($"  Saved:{o} Capacity:{100.0*nb/(s*s-cn):F1}%\nDone!");}}
