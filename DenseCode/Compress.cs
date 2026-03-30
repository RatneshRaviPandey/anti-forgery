using System.IO.Compression;
static class Compress
{
    public static byte[] GZip(byte[] data)
    {
        using var ms=new MemoryStream();
        using(var gz=new GZipStream(ms,CompressionLevel.Optimal)) gz.Write(data,0,data.Length);
        return ms.ToArray();
    }
    public static byte[] UnGZip(byte[] data)
    {
        using var i=new MemoryStream(data);
        using var gz=new GZipStream(i,CompressionMode.Decompress);
        using var o=new MemoryStream();
        gz.CopyTo(o);
        return o.ToArray();
    }
    public static uint Crc32(byte[] data)
    {
        uint[] t=new uint[256];
        for(uint i=0;i<256;i++){
            uint c=i;
            for(int j=0;j<8;j++) c=(c&1)!=0?(c>>1)^0xEDB88320:c>>1;
            t[i]=c;
        }
        uint r=0xFFFFFFFF;
        foreach(byte b in data) r=t[(r^b)&0xFF]^(r>>8);
        return r^0xFFFFFFFF;
    }
}
