export interface BusinessItemInput {
  representativeName?: string;
  itemName: string;
  itemDescription: string;
}

export interface FilledField {
  key: string;
  label: string;
  value: string;
  section: string;
  type: 'text' | 'long_text' | 'enum';
  enumOptions?: string[];
  isEdited: boolean;
}

export interface DocumentProject {
  id: string;
  createdAt: string;
  updatedAt: string;
  businessInput: BusinessItemInput;
  templateDocxBase64: string | null;
  filledFields: FilledField[];
  followUpQuestions: string[];
  currentStep: 'upload' | 'generate' | 'preview';
  templateFileName?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface UploadResponse {
  success: boolean;
  templateDocxBase64: string;
}

export interface GenerateResponse {
  success: boolean;
  fields: FilledField[];
  followUpQuestions: string[];
}

export interface RegenerateResponse {
  success: boolean;
  value: string;
}

// 모든 필드 정의 (레이블, 타입, 섹션)
export const FIELD_DEFS: Record<string, {
  label: string;
  type: 'text' | 'long_text' | 'enum';
  section: string;
  enumOptions?: string[];
}> = {
  REPRESENTATIVE_NAME:               { label: '대표자명',                     type: 'text',      section: '기본 정보' },
  ITEM_NAME:                         { label: '아이템명',                     type: 'text',      section: '기본 정보' },

  OVERVIEW_ITEM_DESCRIPTION:         { label: '제품·서비스 개요',             type: 'long_text', section: '개요' },
  OVERVIEW_BACKGROUND_AND_NEED:      { label: '배경 및 필요성',               type: 'long_text', section: '개요' },
  OVERVIEW_TARGET_MARKET_AND_STRATEGY: { label: '목표시장 및 사업화 전략',    type: 'long_text', section: '개요' },
  OVERVIEW_STATUS_AND_PLAN:          { label: '현황 및 구체화 방안',          type: 'long_text', section: '개요' },
  OVERVIEW_IMAGE_TITLE:              { label: '대표 이미지 설명 1',           type: 'text',      section: '개요' },
  OVERVIEW_IMAGE_TITLE2:             { label: '대표 이미지 설명 2',           type: 'text',      section: '개요' },

  SECTION_1_1_MOTIVE_TITLE_1:        { label: '배경·개발동기 제목 1',         type: 'text',      section: '1. 창업아이템 현황' },
  SECTION_1_1_MOTIVE_DESC_1:         { label: '배경·개발동기 설명 1',         type: 'long_text', section: '1. 창업아이템 현황' },
  SECTION_1_1_MOTIVE_TITLE_2:        { label: '배경·개발동기 제목 2',         type: 'text',      section: '1. 창업아이템 현황' },
  SECTION_1_1_MOTIVE_DESC_2:         { label: '배경·개발동기 설명 2',         type: 'long_text', section: '1. 창업아이템 현황' },

  SECTION_1_2_PURPOSE_TITLE_1:       { label: '목적·필요성 제목 1',           type: 'text',      section: '1. 창업아이템 현황' },
  SECTION_1_2_PURPOSE_DESC_1:        { label: '목적·필요성 설명 1',           type: 'long_text', section: '1. 창업아이템 현황' },
  SECTION_1_2_PURPOSE_TITLE_2:       { label: '목적·필요성 제목 2',           type: 'text',      section: '1. 창업아이템 현황' },
  SECTION_1_2_PURPOSE_DESC_2:        { label: '목적·필요성 설명 2',           type: 'long_text', section: '1. 창업아이템 현황' },

  SECTION_2_1_FEASIBILITY_TITLE_1:   { label: '사업 타당성 제목 1',           type: 'text',      section: '2. 사업화 전략' },
  SECTION_2_1_FEASIBILITY_DESC_1:    { label: '사업 타당성 설명 1',           type: 'long_text', section: '2. 사업화 전략' },
  SECTION_2_1_FEASIBILITY_TITLE_2:   { label: '사업 타당성 제목 2',           type: 'text',      section: '2. 사업화 전략' },
  SECTION_2_1_FEASIBILITY_DESC_2:    { label: '사업 타당성 설명 2',           type: 'long_text', section: '2. 사업화 전략' },

  SECTION_2_2_EXECUTION_TITLE_1:     { label: '추진계획 제목 1',              type: 'text',      section: '2. 사업화 전략' },
  SECTION_2_2_EXECUTION_DESC_1:      { label: '추진계획 설명 1',              type: 'long_text', section: '2. 사업화 전략' },
  SECTION_2_2_EXECUTION_TITLE_2:     { label: '추진계획 제목 2',              type: 'text',      section: '2. 사업화 전략' },
  SECTION_2_2_EXECUTION_DESC_2:      { label: '추진계획 설명 2',              type: 'long_text', section: '2. 사업화 전략' },

  ROADMAP_ROW_1_TASK:                { label: '로드맵 1 - 추진내용',          type: 'text',      section: '로드맵' },
  ROADMAP_ROW_1_PERIOD:              { label: '로드맵 1 - 기간',              type: 'text',      section: '로드맵' },
  ROADMAP_ROW_1_DETAIL:              { label: '로드맵 1 - 세부내용',          type: 'text',      section: '로드맵' },
  ROADMAP_ROW_2_TASK:                { label: '로드맵 2 - 추진내용',          type: 'text',      section: '로드맵' },
  ROADMAP_ROW_2_PERIOD:              { label: '로드맵 2 - 기간',              type: 'text',      section: '로드맵' },
  ROADMAP_ROW_2_DETAIL:              { label: '로드맵 2 - 세부내용',          type: 'text',      section: '로드맵' },
  ROADMAP_ROW_3_TASK:                { label: '로드맵 3 - 추진내용',          type: 'text',      section: '로드맵' },
  ROADMAP_ROW_3_PERIOD:              { label: '로드맵 3 - 기간',              type: 'text',      section: '로드맵' },
  ROADMAP_ROW_3_DETAIL:              { label: '로드맵 3 - 세부내용',          type: 'text',      section: '로드맵' },
  ROADMAP_ROW_4_TASK:                { label: '로드맵 4 - 추진내용',          type: 'text',      section: '로드맵' },
  ROADMAP_ROW_4_PERIOD:              { label: '로드맵 4 - 기간',              type: 'text',      section: '로드맵' },
  ROADMAP_ROW_4_DETAIL:              { label: '로드맵 4 - 세부내용',          type: 'text',      section: '로드맵' },

  SECTION_3_1_STRATEGY_TITLE_1:      { label: '시장진입·수익 전략 제목 1',    type: 'text',      section: '3. 시장진입 전략' },
  SECTION_3_1_STRATEGY_DESC_1:       { label: '시장진입·수익 전략 설명 1',    type: 'long_text', section: '3. 시장진입 전략' },
  SECTION_3_1_STRATEGY_TITLE_2:      { label: '시장진입·수익 전략 제목 2',    type: 'text',      section: '3. 시장진입 전략' },
  SECTION_3_1_STRATEGY_DESC_2:       { label: '시장진입·수익 전략 설명 2',    type: 'long_text', section: '3. 시장진입 전략' },

  SECTION_3_2_FUNDING_TITLE_1:       { label: '자금 조달 계획 제목 1',        type: 'text',      section: '3. 시장진입 전략' },
  SECTION_3_2_FUNDING_DESC_1:        { label: '자금 조달 계획 설명 1',        type: 'long_text', section: '3. 시장진입 전략' },
  SECTION_3_2_FUNDING_TITLE_2:       { label: '자금 조달 계획 제목 2',        type: 'text',      section: '3. 시장진입 전략' },
  SECTION_3_2_FUNDING_DESC_2:        { label: '자금 조달 계획 설명 2',        type: 'long_text', section: '3. 시장진입 전략' },

  TEAM_MEMBER_1_POSITION:            { label: '팀원1 직급',                   type: 'text',      section: '팀 구성' },
  TEAM_MEMBER_1_NAME:                { label: '팀원1 성명',                   type: 'text',      section: '팀 구성' },
  TEAM_MEMBER_1_ROLE:                { label: '팀원1 담당업무',               type: 'text',      section: '팀 구성' },
  TEAM_MEMBER_1_PROFILE:             { label: '팀원1 경력·학력',              type: 'long_text', section: '팀 구성' },

  AWARD_1_DATE:                      { label: '수상이력1 일자',               type: 'text',      section: '실적·이력' },
  AWARD_1_RECIPIENT:                 { label: '수상이력1 수상자',             type: 'text',      section: '실적·이력' },
  AWARD_1_NAME:                      { label: '수상이력1 대회명',             type: 'text',      section: '실적·이력' },
  AWARD_1_ORGANIZER:                 { label: '수상이력1 주최기관',           type: 'text',      section: '실적·이력' },
  AWARD_1_LEVEL:                     { label: '수상이력1 훈격',               type: 'text',      section: '실적·이력' },
  AWARD_1_PRIZE_KRW_THOUSAND:        { label: '수상이력1 상금(천원)',         type: 'text',      section: '실적·이력' },

  IP_1_TYPE:                         { label: '지재권1 구분',                 type: 'text',      section: '실적·이력' },
  IP_1_NAME_NUMBER:                  { label: '지재권1 명칭·번호',            type: 'text',      section: '실적·이력' },
  IP_1_ACQUIRED_DATE:                { label: '지재권1 취득일',               type: 'text',      section: '실적·이력' },

  INVESTMENT_1_DATE:                 { label: '투자유치1 일자',               type: 'text',      section: '실적·이력' },
  INVESTMENT_1_AMOUNT_KRW_THOUSAND:  { label: '투자유치1 금액(천원)',         type: 'text',      section: '실적·이력' },
  INVESTMENT_1_INSTITUTION:          { label: '투자유치1 기관',               type: 'text',      section: '실적·이력' },
  INVESTMENT_1_NOTE:                 { label: '투자유치1 비고',               type: 'text',      section: '실적·이력' },

  ATTACHMENT_1_LABEL:                { label: '첨부 라벨',                    type: 'text',      section: '첨부' },
  ATTACHMENT_1_TITLE:                { label: '첨부 제목',                    type: 'text',      section: '첨부' },
};

export const FIELD_ORDER = Object.keys(FIELD_DEFS);
