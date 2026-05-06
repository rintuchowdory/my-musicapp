import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const artist = req.nextUrl.searchParams.get('artist')??'';
  const title = req.nextUrl.searchParams.get('title')??'';
  if (!artist||!title) return NextResponse.json({lyrics:null});
  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    const data = await res.json();
    return NextResponse.json({lyrics:data.lyrics??null});
  } catch { return NextResponse.json({lyrics:null}); }
}
