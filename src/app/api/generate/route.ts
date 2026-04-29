import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessPlan } from '@/lib/ai/claude';
import { BusinessItemInput, ApiError, GenerateResponse, FilledField, FIELD_DEFS, FIELD_ORDER } from '@/types';

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateResponse | ApiError>> {
  try {
    const body = await request.json();
    const { businessInput } = body as { businessInput: BusinessItemInput };

    if (!businessInput?.itemName) {
      return NextResponse.json({ error: '아이템명이 필요합니다.' }, { status: 400 });
    }

    const { values, followUpQuestions } = await generateBusinessPlan(businessInput);

    const fields: FilledField[] = FIELD_ORDER.map((key) => {
      const def = FIELD_DEFS[key];
      return {
        key,
        label: def.label,
        value: values[key] ?? '',
        section: def.section,
        type: def.type,
        enumOptions: def.enumOptions,
        isEdited: false,
      };
    });

    return NextResponse.json({ success: true, fields, followUpQuestions });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: '초안 생성 중 오류가 발생했습니다.', details: String(error) },
      { status: 500 }
    );
  }
}
