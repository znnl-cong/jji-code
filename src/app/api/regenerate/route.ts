import { NextRequest, NextResponse } from 'next/server';
import { regenerateField } from '@/lib/ai/claude';
import { BusinessItemInput, ApiError, RegenerateResponse } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<RegenerateResponse | ApiError>> {
  try {
    const body = await request.json();
    const { key, label, businessInput, currentValue, instruction } = body as {
      key: string;
      label: string;
      businessInput: BusinessItemInput;
      currentValue: string;
      instruction?: string;
    };

    if (!key || !businessInput?.itemName) {
      return NextResponse.json({ error: '필드 키와 아이템 정보가 필요합니다.' }, { status: 400 });
    }

    const value = await regenerateField(key, label, businessInput, currentValue, instruction);
    return NextResponse.json({ success: true, value });
  } catch (error) {
    return NextResponse.json(
      { error: '재생성 중 오류가 발생했습니다.', details: String(error) },
      { status: 500 }
    );
  }
}
