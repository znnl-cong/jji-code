import { NextRequest, NextResponse } from 'next/server';
import { ApiError, UploadResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse | ApiError>> {
  try {
    const formData = await request.formData();
    const docxFile = formData.get('docx') as File | null;

    if (!docxFile) {
      return NextResponse.json({ error: 'DOCX 파일이 필요합니다.' }, { status: 400 });
    }
    if (!docxFile.name.endsWith('.docx')) {
      return NextResponse.json({ error: '.docx 파일만 지원합니다.' }, { status: 400 });
    }
    if (docxFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '파일은 10MB 이하여야 합니다.' }, { status: 400 });
    }

    const arrayBuffer = await docxFile.arrayBuffer();
    const templateDocxBase64 = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({ success: true, templateDocxBase64 });
  } catch (error) {
    return NextResponse.json(
      { error: '파일 처리 중 오류가 발생했습니다.', details: String(error) },
      { status: 500 }
    );
  }
}
