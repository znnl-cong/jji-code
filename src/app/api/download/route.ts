import { NextRequest, NextResponse } from 'next/server';
import { fillDocxTemplate } from '@/lib/docx/filler';
import { FilledField, ApiError } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { templateDocxBase64, fields, fileName } = body as {
      templateDocxBase64: string;
      fields: FilledField[];
      fileName?: string;
    };

    if (!templateDocxBase64 || !fields) {
      return NextResponse.json(
        { error: '템플릿과 필드 데이터가 필요합니다.' } as ApiError,
        { status: 400 }
      );
    }

    // FilledField 배열 → key-value 맵으로 변환
    const data: Record<string, string> = {};
    for (const field of fields) {
      data[field.key] = field.value;
    }

    const docxBuffer = Buffer.from(templateDocxBase64, 'base64');
    const filled = await fillDocxTemplate(docxBuffer, data);

    const outputFileName = fileName || `사업계획서_${Date.now()}.docx`;

    return new NextResponse(new Uint8Array(filled), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(outputFileName)}`,
        'Content-Length': String(filled.length),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: '문서 생성 중 오류가 발생했습니다.', details: String(error) } as ApiError,
      { status: 500 }
    );
  }
}
