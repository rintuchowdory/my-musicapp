import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ results: [] });
  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIQAQ%253D%253D`,{headers:{'User-Agent':'Mozilla/5.0'}});
    const html = await res.text();
    const match = html.match(/var ytInitialData = ({.+?});/s);
    if (!match) return NextResponse.json({ results: [] });
    const data = JSON.parse(match[1]);
    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents??[];
    const results = contents.filter((item:any)=>item.videoRenderer).slice(0,15).map((item:any)=>{
      const v=item.videoRenderer;
      return {videoId:v.videoId,title:v.title?.runs?.[0]?.text??'Unknown',artist:v.ownerText?.runs?.[0]?.text??'Unknown',thumbnail:v.thumbnail?.thumbnails?.slice(-1)[0]?.url??'',duration:v.lengthText?.simpleText??''};
    });
    return NextResponse.json({ results });
  } catch(e){ return NextResponse.json({results:[]}); }
}
