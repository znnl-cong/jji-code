import { NextRequest, NextResponse } from 'next/server';

// 스키마 기반 방식으로 전환 후 이 라우트는 사용하지 않음
export async function POST(_request: NextRequest) {
  return Response.json({ success: true, sections: [], questions: [] });
}
