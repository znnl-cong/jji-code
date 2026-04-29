import Anthropic from '@anthropic-ai/sdk';
import { BusinessItemInput } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `당신은 한국의 정부지원사업·창업경진대회 사업계획서 작성 전문가입니다.

당신의 역할은 사용자가 입력한 창업 아이템 정보를 바탕으로,
2026 기후에너지환경창업대전 사업계획서 양식에 들어갈 내용을
정해진 schema key에 맞는 JSON 데이터로 생성하는 것입니다.

중요 규칙:
1. 문서 전체를 자유 형식으로 작성하지 마세요.
2. 반드시 schema key에 대응하는 JSON만 출력하세요.
3. JSON 바깥의 설명, 해설, 주석, 마크다운 코드블록을 출력하지 마세요.
4. 과장하거나 존재하지 않는 실적, 수상, 투자, 특허, 고객사, 매출을 지어내지 마세요.
5. 예비창업자 관점에서 현실적이고 설득력 있게 작성하세요.
6. 불확실한 정보는 단정하지 말고, 합리적인 가정 수준으로 작성하세요.
7. 사실 확인이 꼭 필요한 항목은 빈 문자열로 두거나 follow_up_questions에 질문으로 제시하세요.
8. follow_up_questions는 최대 3개까지만 작성하세요. 대표자 정보, 팀 구성원 정보에 관한 질문은 follow_up_questions에 포함하지 마세요.
9. 문체는 한국 정부지원사업 공문서 스타일로 작성하세요. OVERVIEW 계열 필드는 음슴체 종결을 원칙으로 합니다. 예: "~하고자 함", "~추진 예정", "~완료", "~확보할 계획", "~필요성 존재", "~도입할 예정". "합니다", "됩니다", "있습니다", "입니다" 같은 구어체 종결어미는 절대 사용하지 않습니다. 문장 끝에 마침표(.)를 찍지 않습니다.
10. TITLE 계열 필드는 짧고 명확한 제목형 문장으로 작성하세요.
11. DESC 계열 필드는 실제 사업계획서에 바로 넣을 수 있는 설명형 문장으로 작성하세요.
12. OVERVIEW 계열은 표에 들어가는 요약형 문단이므로 2~3문장 이내로 짧고 핵심 정보만 담아 작성하세요.
13. 팀 구성, 수상, 지재권, 투자유치 같은 사실기반 정보는 사용자 입력이 없으면 임의로 만들지 마세요.
14. 일정표(ROADMAP)는 아이템 특성에 맞는 현실적인 사업화 단계로 작성하세요.
15. 출력은 반드시 JSON 객체 1개만 반환하세요.

작성 목표:
- 심사위원이 읽었을 때 문제인식, 해결방안, 시장성, 차별성, 실행가능성이 한 번에 이해되도록 작성
- 양식 각 칸에 바로 넣을 수 있도록 구조화
- 문장 길이는 지나치게 길지 않게 유지`;

const USER_PROMPT_TEMPLATE = `아래 창업 아이템 정보를 바탕으로
2026 기후에너지환경창업대전 사업계획서 스키마의 각 필드 값을 생성하세요.

입력 정보:
{
  "representative_name": "{{REPRESENTATIVE_NAME}}",
  "item_name": "{{ITEM_NAME}}",
  "item_description": "{{ITEM_DESCRIPTION}}"
}

필드 작성 가이드:
- REPRESENTATIVE_NAME: 입력 정보의 representative_name 값을 그대로 사용. 없으면 빈 문자열
- ITEM_NAME: 창업 아이템명
- OVERVIEW_ITEM_DESCRIPTION: 제품·서비스 개요, 핵심 기능, 주요 고객, 제공 혜택 포함. 2~3문장 이내로 간결하게. 문장 종결은 "~하고자 함", "~제공하는 플랫폼", "~솔루션" 등 정부지원사업 공문서 음슴체 스타일로 작성
- OVERVIEW_BACKGROUND_AND_NEED: 개발 필요성과 해결방안 방향. 2~3문장 이내로 간결하게. 문장 종결은 "~필요성 존재", "~해결하고자 함", "~대응하기 위함" 등 음슴체 스타일로 작성
- OVERVIEW_TARGET_MARKET_AND_STRATEGY: 수익모델, 목표시장, 경쟁 대비 차별성. 2~3문장 이내로 간결하게. 문장 종결은 "~진입 예정", "~확보할 계획", "~차별화 전략 보유" 등 음슴체 스타일로 작성
- OVERVIEW_STATUS_AND_PLAN: 현재 개발·사업화 준비 현황, 향후 계획. 2~3문장 이내로 간결하게. 문장 종결은 "~완료", "~진행 중", "~추진 예정", "~도입할 계획" 등 음슴체 스타일로 작성
- OVERVIEW_IMAGE_TITLE: 첫 번째 참고 이미지 제목. 괄호 없이 7~8자 이내 단어만. 예: 서비스 구조, 시스템 구성도, 제품 이미지
- OVERVIEW_IMAGE_TITLE2: 두 번째 참고 이미지 제목. 괄호 없이 7~8자 이내 단어만. 예: 현장 적용 사례, 설계도, 앱 화면

- SECTION_1_1_MOTIVE_TITLE_1: 배경 및 개발 동기 핵심 제목 1
- SECTION_1_1_MOTIVE_DESC_1: 창업아이템 제안 배경 및 개발 동기 설명 1
- SECTION_1_1_MOTIVE_TITLE_2: 배경 및 개발 동기 핵심 제목 2
- SECTION_1_1_MOTIVE_DESC_2: 창업아이템 제안 배경 및 개발 동기 설명 2

- SECTION_1_2_PURPOSE_TITLE_1: 목적(필요성) 핵심 제목 1
- SECTION_1_2_PURPOSE_DESC_1: 창업아이템을 통해 구현하고자 하는 목표 설명
- SECTION_1_2_PURPOSE_TITLE_2: 목적(필요성) 핵심 제목 2
- SECTION_1_2_PURPOSE_DESC_2: 국내외 시장 문제점 또는 환경현안에 대한 혁신적 해결방안 설명

- SECTION_2_1_FEASIBILITY_TITLE_1: 사업 타당성 핵심 제목 1
- SECTION_2_1_FEASIBILITY_DESC_1: 기존 시장규모, 수요, 경쟁사 대비 우위 등 시장성/경쟁력 설명
- SECTION_2_1_FEASIBILITY_TITLE_2: 사업 타당성 핵심 제목 2
- SECTION_2_1_FEASIBILITY_DESC_2: 현재 기술개발 수준, 차별화 전략(기능, 성분, 디자인 등) 설명

- SECTION_2_2_EXECUTION_TITLE_1: 추진계획 핵심 제목 1
- SECTION_2_2_EXECUTION_DESC_1: 제작 소요기간 및 제작방법(자체/외주), 준비 계획 설명
- SECTION_2_2_EXECUTION_TITLE_2: 추진계획 핵심 제목 2
- SECTION_2_2_EXECUTION_DESC_2: 사업화 전체 로드맵 설명

- ROADMAP_ROW_1_TASK ~ ROADMAP_ROW_4_DETAIL:
  사업화 일정표용 값
  예: 기획/설계 → 시제품 제작 → 테스트/검증 → 출시/고객확보
  기간은 "2026.06 ~ 2026.08" 같은 형식으로 작성

- SECTION_3_1_STRATEGY_TITLE_1: 시장진입 및 수익 창출 전략 제목 1
- SECTION_3_1_STRATEGY_DESC_1: 단계별 사업화 계획, 목표시장 진입, 고객 확보 전략 설명
- SECTION_3_1_STRATEGY_TITLE_2: 시장진입 및 수익 창출 전략 제목 2
- SECTION_3_1_STRATEGY_DESC_2: 수익모델 및 성과 창출 전략 설명

- SECTION_3_2_FUNDING_TITLE_1: 자금 조달 계획 제목 1
- SECTION_3_2_FUNDING_DESC_1: R&D, 정책자금, 정부지원사업을 통한 자금 확보 전략 설명
- SECTION_3_2_FUNDING_TITLE_2: 자금 조달 계획 제목 2
- SECTION_3_2_FUNDING_DESC_2: 엔젤투자, VC, 크라우드펀딩 등 향후 투자유치 전략 설명

- TEAM_MEMBER_* / AWARD_* / IP_* / INVESTMENT_* / ATTACHMENT_*:
  사용자 정보가 없으면 빈 문자열로 두세요.
  절대 임의로 사실을 만들어내지 마세요.

추가 작성 원칙:
- OVERVIEW 계열은 표에 들어갈 요약형 문단으로 작성하세요.
- TITLE 계열은 짧고 강한 제목형 문구로 작성하세요.
- DESC 계열은 2~4문장 이내로 작성하세요.
- 너무 마케팅 문구처럼 쓰지 말고 심사 문서 스타일로 쓰세요.
- 고객, 문제, 해결방안, 차별성, 실행전략이 자연스럽게 이어지게 작성하세요.
- 확정할 수 없는 대표자 정보, 수상, 특허, 투자유치 내역은 비워두세요.

반드시 아래 JSON 형식 그대로 출력하세요:
{
  "REPRESENTATIVE_NAME": "",
  "ITEM_NAME": "",
  "OVERVIEW_ITEM_DESCRIPTION": "",
  "OVERVIEW_BACKGROUND_AND_NEED": "",
  "OVERVIEW_TARGET_MARKET_AND_STRATEGY": "",
  "OVERVIEW_STATUS_AND_PLAN": "",
  "OVERVIEW_IMAGE_TITLE": "",
  "OVERVIEW_IMAGE_TITLE2": "",
  "SECTION_1_1_MOTIVE_TITLE_1": "",
  "SECTION_1_1_MOTIVE_DESC_1": "",
  "SECTION_1_1_MOTIVE_TITLE_2": "",
  "SECTION_1_1_MOTIVE_DESC_2": "",
  "SECTION_1_2_PURPOSE_TITLE_1": "",
  "SECTION_1_2_PURPOSE_DESC_1": "",
  "SECTION_1_2_PURPOSE_TITLE_2": "",
  "SECTION_1_2_PURPOSE_DESC_2": "",
  "SECTION_2_1_FEASIBILITY_TITLE_1": "",
  "SECTION_2_1_FEASIBILITY_DESC_1": "",
  "SECTION_2_1_FEASIBILITY_TITLE_2": "",
  "SECTION_2_1_FEASIBILITY_DESC_2": "",
  "SECTION_2_2_EXECUTION_TITLE_1": "",
  "SECTION_2_2_EXECUTION_DESC_1": "",
  "SECTION_2_2_EXECUTION_TITLE_2": "",
  "SECTION_2_2_EXECUTION_DESC_2": "",
  "ROADMAP_ROW_1_TASK": "",
  "ROADMAP_ROW_1_PERIOD": "",
  "ROADMAP_ROW_1_DETAIL": "",
  "ROADMAP_ROW_2_TASK": "",
  "ROADMAP_ROW_2_PERIOD": "",
  "ROADMAP_ROW_2_DETAIL": "",
  "ROADMAP_ROW_3_TASK": "",
  "ROADMAP_ROW_3_PERIOD": "",
  "ROADMAP_ROW_3_DETAIL": "",
  "ROADMAP_ROW_4_TASK": "",
  "ROADMAP_ROW_4_PERIOD": "",
  "ROADMAP_ROW_4_DETAIL": "",
  "SECTION_3_1_STRATEGY_TITLE_1": "",
  "SECTION_3_1_STRATEGY_DESC_1": "",
  "SECTION_3_1_STRATEGY_TITLE_2": "",
  "SECTION_3_1_STRATEGY_DESC_2": "",
  "SECTION_3_2_FUNDING_TITLE_1": "",
  "SECTION_3_2_FUNDING_DESC_1": "",
  "SECTION_3_2_FUNDING_TITLE_2": "",
  "SECTION_3_2_FUNDING_DESC_2": "",
  "TEAM_MEMBER_1_POSITION": "",
  "TEAM_MEMBER_1_NAME": "",
  "TEAM_MEMBER_1_ROLE": "",
  "TEAM_MEMBER_1_PROFILE": "",
  "AWARD_1_DATE": "",
  "AWARD_1_RECIPIENT": "",
  "AWARD_1_NAME": "",
  "AWARD_1_ORGANIZER": "",
  "AWARD_1_LEVEL": "",
  "AWARD_1_PRIZE_KRW_THOUSAND": "",
  "IP_1_TYPE": "",
  "IP_1_NAME_NUMBER": "",
  "IP_1_ACQUIRED_DATE": "",
  "INVESTMENT_1_DATE": "",
  "INVESTMENT_1_AMOUNT_KRW_THOUSAND": "",
  "INVESTMENT_1_INSTITUTION": "",
  "INVESTMENT_1_NOTE": "",
  "ATTACHMENT_1_LABEL": "",
  "ATTACHMENT_1_TITLE": "",
  "follow_up_questions": []
}`;

function buildUserPrompt(input: BusinessItemInput): string {
  return USER_PROMPT_TEMPLATE
    .replace('{{REPRESENTATIVE_NAME}}', input.representativeName || '')
    .replace('{{ITEM_NAME}}', input.itemName)
    .replace('{{ITEM_DESCRIPTION}}', input.itemDescription);
}

export async function generateBusinessPlan(
  input: BusinessItemInput
): Promise<{ values: Record<string, string>; followUpQuestions: string[] }> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(input) }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const followUpQuestions: string[] = Array.isArray(parsed.follow_up_questions)
        ? parsed.follow_up_questions.slice(0, 3)
        : [];
      delete parsed.follow_up_questions;
      return { values: parsed, followUpQuestions };
    }
  } catch {
    // fallback
  }

  return { values: {}, followUpQuestions: [] };
}

export async function regenerateField(
  key: string,
  label: string,
  input: BusinessItemInput,
  currentValue: string,
  instruction?: string
): Promise<string> {
  const isTitle = key.includes('_TITLE_');
  const isDesc = key.includes('_DESC_') || key.includes('OVERVIEW_');
  const typeHint = isTitle
    ? '짧고 강한 제목형 문구로 (한 문장 이내)'
    : isDesc
    ? '2~4문장 설명형으로'
    : '간결한 텍스트로';

  const prompt = `다음 사업계획서 필드를 재작성해주세요.

필드: ${label} (key: ${key})
아이템: ${input.itemName}
${input.itemDescription ? `설명: ${input.itemDescription}` : ''}
현재 내용: ${currentValue}
${instruction ? `수정 지시사항: ${instruction}` : ''}

${typeHint} 작성하세요.
JSON이나 마크다운 없이 텍스트만 반환하세요.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text.trim() : currentValue;
}
