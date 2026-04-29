import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { hint } = await request.json() as { hint?: string };

    const hintLine = hint?.trim()
      ? `힌트/키워드: ${hint.trim()}`
      : '기후·에너지·환경 분야에서 혁신적이고 실현 가능한 창업 아이템을 자유롭게 제안하세요.';

    const prompt = `2026 기후에너지환경창업대전에 출품할 창업 아이템을 제안해주세요.
${hintLine}

다음 JSON 형식으로만 반환하세요 (마크다운, 코드블록 없이):
{
  "itemName": "아이템명 (30자 이내, 구체적이고 명확하게)",
  "itemDescription": "아이템 설명 (200~400자, 해결하는 문제·해결 방법·주요 고객·기술 차별점·개발 현황을 포함하여 자유롭게 작성)"
}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const match = text.match(/\{[\s\S]*\}/);

    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.itemName && parsed.itemDescription) {
        return NextResponse.json({ itemName: parsed.itemName, itemDescription: parsed.itemDescription });
      }
    }

    return NextResponse.json({ error: '아이템 생성에 실패했습니다.' }, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      { error: '오류가 발생했습니다.', details: String(error) },
      { status: 500 }
    );
  }
}
