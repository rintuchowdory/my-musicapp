import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')??'';
  const tag = req.nextUrl.searchParams.get('tag')??'';
  try {
    let url='https://de1.api.radio-browser.info/json/stations/search?limit=30&hidebroken=true&order=clickcount&reverse=true';
    if(q)url+=`&name=${encodeURIComponent(q)}`;
    if(tag)url+=`&tag=${encodeURIComponent(tag)}`;
    const res=await fetch(url,{headers:{'User-Agent':'MusicApp/1.0'}});
    const data=await res.json();
    const stations=data.slice(0,30).map((s:any)=>({id:s.stationuuid,name:s.name,url:s.url_resolved||s.url,country:s.country,tags:s.tags,favicon:s.favicon,bitrate:s.bitrate}));
    return NextResponse.json({stations});
  } catch { return NextResponse.json({stations:[]}); }
}
