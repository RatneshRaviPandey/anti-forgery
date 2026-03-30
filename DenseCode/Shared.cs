using System.Drawing;
static class Shared
{
    public const int CellPx=4, QuietPx=12, FinderN=7;
    public static readonly Color[] Palette = {
        Color.FromArgb(0,0,0),Color.FromArgb(255,0,0),Color.FromArgb(0,160,0),Color.FromArgb(0,0,255),
        Color.FromArgb(255,255,0),Color.FromArgb(255,0,255),Color.FromArgb(0,255,255),Color.FromArgb(255,255,255),
        Color.FromArgb(255,128,0),Color.FromArgb(128,0,255),Color.FromArgb(0,200,128),Color.FromArgb(200,0,100),
        Color.FromArgb(160,160,0),Color.FromArgb(0,128,255),Color.FromArgb(160,80,0),Color.FromArgb(128,128,128)
    };
    public static readonly Color[] FinderInner = {
        Color.FromArgb(255,0,0),Color.FromArgb(0,160,0),Color.FromArgb(0,0,255),Color.FromArgb(255,255,0)
    };
    public static bool IsCorner(int r,int c,int s) =>
        (r<FinderN&&c<FinderN)||(r<FinderN&&c>=s-FinderN)||
        (r>=s-FinderN&&c<FinderN)||(r>=s-FinderN&&c>=s-FinderN);
    public static void FillCell(Graphics g,int col,int row,Color color)
    {
        using var b=new SolidBrush(color);
        g.FillRectangle(b,QuietPx+col*CellPx,QuietPx+row*CellPx,CellPx,CellPx);
    }
    public static void DrawFinder(Graphics g,int cx,int cy,Color inner)
    {
        for(int r=0;r<FinderN;r++)
            for(int c=0;c<FinderN;c++){
                int ring=Math.Min(Math.Min(r,c),Math.Min(FinderN-1-r,FinderN-1-c));
                FillCell(g,cx+c,cy+r,ring switch{0=>Color.Black,1=>Color.White,_=>inner});
            }
    }
    public static int NearestColor(Color c)
    {
        int best=0,bd=int.MaxValue;
        for(int i=0;i<Palette.Length;i++){
            int dr=c.R-Palette[i].R,dg=c.G-Palette[i].G,db=c.B-Palette[i].B;
            int d=dr*dr+dg*dg+db*db;
            if(d<bd){bd=d;best=i;}
        }
        return best;
    }
}
