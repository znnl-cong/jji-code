import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json() as { keyword: string };

    if (!keyword) {
      return NextResponse.json({ error: '키워드가 필요합니다.' }, { status: 400 });
    }

    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'PEXELS_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    const query = encodeURIComponent(keyword);
    const randomPage = Math.floor(Math.random() * 3) + 1;
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=5&page=${randomPage}&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );

    if (!res.ok) throw new Error(`Pexels API 오류: ${res.status}`);

    const data = await res.json() as { photos: { src: { large: string } }[] };
    const photos = data.photos ?? [];
    const photo = photos[Math.floor(Math.random() * photos.length)];

    if (!photo) {
      return NextResponse.json({ error: '관련 이미지를 찾지 못했습니다.' }, { status: 404 });
    }

    // 이미지를 서버에서 직접 가져와 base64로 변환
    const imgRes = await fetch(photo.src.large);
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

    return NextResponse.json({ success: true, dataUrl: `data:${contentType};base64,${base64}` });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
