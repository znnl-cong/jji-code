import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 녹색산업 세부분야 분류 (광범위한 커버리지)
const GREEN_SUBFIELDS = [
  // 에너지 전환
  '태양광·태양열 에너지 활용 및 효율화',
  '풍력·해상풍력 발전 기술',
  '수소 생산·저장·운반·활용',
  '에너지저장시스템(ESS) 및 배터리 기술',
  '스마트그리드·분산에너지 관리',
  '소형모듈원자로(SMR) 및 핵융합 기술',
  '지열·조력·파력·해양온도차 에너지',
  '바이오매스·바이오가스 에너지화',
  '건물일체형 태양광(BIPV) 및 에너지자립건물',
  '에너지 수요관리 및 수요반응(DR) 시스템',

  // 기후·탄소
  '탄소포집·저장·활용(CCUS) 기술',
  '탄소발자국 측정·추적·검증 플랫폼',
  '자발적 탄소시장 및 탄소크레딧 거래',
  '기업 탄소중립 전환 컨설팅·솔루션',
  '기후변화 적응 및 기상재해 대응',
  '도시 열섬 저감 및 냉각 인프라',
  '메탄·아산화질소 등 비CO2 온실가스 저감',
  'ESG 데이터 수집·분석·보고 플랫폼',

  // 순환경제·자원
  '폐기물 선별·재활용 자동화 기술',
  '플라스틱 화학적 재활용 및 대체소재',
  '전자폐기물(e-waste) 귀금속 회수',
  '음식물쓰레기 자원화·바이오가스화',
  '폐배터리 재사용·재제조(2nd life)',
  '업사이클링 제품 설계 및 유통 플랫폼',
  '제로웨이스트 소비 생태계 조성',
  '산업 부산물 재자원화 및 공생 네트워크',

  // 수자원·해양·토양
  '스마트 수도관 누수 감지 및 수도관망 관리',
  '폐수처리·수질 정화 기술',
  '해양 미세플라스틱 수거·정화',
  '산호초·갯벌·맹그로브 블루카본 생태계 복원',
  '토양오염 모니터링·정화·복원',
  '가뭄·홍수 대비 스마트 물 관리',
  '수산양식 스마트화 및 수질 자동 제어',

  // 대기·환경측정
  '초미세먼지·VOCs 실내외 측정 및 저감',
  '악취·소음 환경민원 관리 플랫폼',
  '환경위성·드론 기반 원격 환경 모니터링',
  '대기오염원 역추적 및 배출원 관리',
  '스마트 환경센서 네트워크 및 디지털트윈',

  // 녹색 모빌리티·물류
  '전기차 충전 인프라 최적화·공유',
  '수소연료전지 차량·선박·항공기',
  '친환경 라스트마일 배송 솔루션',
  '탄소효율 물류 경로 최적화',
  '친환경 선박 운항 효율화·배출 저감',
  '도심항공모빌리티(UAM) 그린에너지 연동',
  '전기 이륜·화물차 인프라 및 서비스',

  // 녹색 농식품
  '스마트팜 에너지 효율화·신재생에너지 연계',
  '정밀농업으로 비료·농약 사용 최소화',
  '대체단백질·세포배양육·식물성 식품',
  '푸드로스(식품폐기) 저감 공급망 관리',
  '도시농업·수직농장·식물공장',
  '친환경 농자재·생분해 포장재',
  '농업 탄소흡수원 크레딧화 플랫폼',

  // 녹색 건축·도시
  '건물 에너지 관리 시스템(BEMS) 및 AI 최적화',
  '그린리모델링 및 단열 성능 진단·개선',
  '지속가능한 건축 소재 개발 및 유통',
  '스마트시티 에너지·환경 통합 관제',
  '도시 녹지·바이오필릭 디자인 플랫폼',
  '빗물 활용·열에너지 회수 건물 시스템',

  // 생물다양성·생태계
  '생물다양성 모니터링 AI·센서 플랫폼',
  '침입외래종 조기탐지 및 관리',
  '생태계 서비스 가치 산정·보상 체계',
  '산림 탄소흡수 측정·인증·거래',
  '야생동물 이동통로 스마트 모니터링',

  // 그린파이낸스·교육·제도
  '중소기업 탄소감축 투자 연계 금융 플랫폼',
  '녹색채권·임팩트투자 투명성 검증 시스템',
  '기후환경 교육 및 행동변화 유도 앱·서비스',
  '환경규제 컴플라이언스 자동화 솔루션',
  '공급망 환경리스크 실사(Due Diligence) 플랫폼',
];

// 기술 접근 방식
const TECH_APPROACHES = [
  'AI·머신러닝 기반 예측 및 최적화',
  'IoT·엣지컴퓨팅·센서 네트워크',
  '블록체인 기반 투명성·추적',
  '로봇공학·자동화·드론',
  '바이오테크·합성생물학',
  '나노소재·첨단화학소재',
  '디지털트윈·시뮬레이션',
  '위성·원격탐사·빅데이터',
  '모바일 앱·SaaS 플랫폼',
  '하드웨어 디바이스·임베디드 시스템',
  '클라우드 데이터 분석·대시보드',
  '전기화학·에너지변환 소재',
];

// 주요 고객·적용 섹터
const TARGET_SECTORS = [
  '중소 제조업체',
  '건설·부동산 개발사',
  '농어업 종사자·농협',
  '물류·유통 기업',
  '지방자치단체·공공기관',
  '개인 소비자·가정',
  '에너지 공기업·발전사',
  '해운·항만·수산업',
  '유통·식품 기업',
  '병원·의료시설',
  '데이터센터·IT 기업',
  '학교·교육기관',
  '스타트업·VC 투자자',
  '글로벌 수출 제조업',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(request: NextRequest) {
  try {
    const { hint } = await request.json() as { hint?: string };

    // 매 호출마다 서로 다른 세부분야·기술·섹터를 랜덤 선택해 다양성 확보
    const subfield = pickRandom(GREEN_SUBFIELDS);
    const tech = pickRandom(TECH_APPROACHES);
    const sector = pickRandom(TARGET_SECTORS);

    const hintLine = hint?.trim()
      ? `사용자 힌트/키워드: ${hint.trim()}\n위 힌트를 반영하되, 아래 방향성도 창의적으로 결합하세요.`
      : '';

    const prompt = `2026 기후에너지환경창업대전 출품용 창업 아이템을 제안해주세요.
${hintLine}

【이번 제안의 방향성】
- 녹색산업 세부분야: ${subfield}
- 핵심 기술 접근: ${tech}
- 주요 고객/적용 섹터: ${sector}

위 세 가지 방향성을 창의적으로 결합한 구체적이고 실현 가능한 아이템을 제안하세요.
방향성에 얽매이지 말고, 진정으로 혁신적인 아이디어라면 자유롭게 발전시켜도 됩니다.

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
