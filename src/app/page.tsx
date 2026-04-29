'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { getProjects, saveProject, deleteProject } from '@/lib/store';
import { DocumentProject } from '@/types';

export default function HomePage() {
  const router = useRouter();

  const [representativeName, setRepresentativeName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [recentProjects, setRecentProjects] = useState<DocumentProject[]>([]);

  const [hint, setHint] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  useEffect(() => { setRecentProjects(getProjects()); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError('');
    try {
      const res = await fetch('/api/suggest-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hint: hint.trim() }),
      });
      if (!res.ok) throw new Error('생성에 실패했습니다.');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.itemName) setItemName(data.itemName);
      if (data.itemDescription) setItemDescription(data.itemDescription);
      setIsAiGenerated(true);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStart = async () => {
    if (!representativeName.trim()) { setError('대표자명을 입력해 주세요.'); return; }
    if (!itemName.trim()) { setError('아이템명을 입력해 주세요.'); return; }
    if (!itemDescription.trim()) { setError('아이템 설명을 입력해 주세요.'); return; }

    setUploading(true);
    setError('');

    try {
      const templateRes = await fetch('/template.docx');
      if (!templateRes.ok) throw new Error('양식 파일을 불러오지 못했습니다.');
      const arrayBuffer = await templateRes.arrayBuffer();
      const templateDocxBase64 = btoa(
        new Uint8Array(arrayBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), '')
      );

      const projectId = uuidv4();
      const project: DocumentProject = {
        id: projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        businessInput: {
          representativeName: representativeName.trim() || undefined,
          itemName: itemName.trim(),
          itemDescription: itemDescription.trim(),
        },
        templateDocxBase64,
        filledFields: [],
        followUpQuestions: [],
        currentStep: 'generate',
        templateFileName: 'template.docx',
      };

      saveProject(project);
      router.push(`/analyze?id=${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setUploading(false);
    }
  };

  const stepLabels: Record<DocumentProject['currentStep'], string> = {
    upload: '업로드', generate: '편집 중', preview: '완성',
  };
  const stepColors: Record<DocumentProject['currentStep'], 'gray' | 'yellow' | 'green'> = {
    upload: 'gray', generate: 'yellow', preview: 'green',
  };

  const handleResume = (p: DocumentProject) => {
    const paths: Record<DocumentProject['currentStep'], string> = {
      upload: '/',
      generate: `/generate?id=${p.id}`,
      preview: `/preview?id=${p.id}`,
    };
    router.push(paths[p.currentStep]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <span className="text-lg font-bold text-gray-900">사업계획서 AI</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">AI로 사업계획서를 빠르게</h1>
          <p className="text-gray-500">아이템 정보와 양식을 입력하면 AI가 모든 항목을 작성해드립니다</p>
        </div>

        <Card>
          <div className="space-y-4">
            {/* 대표자명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                대표자명 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                placeholder="예: 홍길동"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* AI 아이템 자동 생성 */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 space-y-2.5">
              <p className="text-sm font-medium text-blue-800">
                AI로 아이템 자동 생성
                <span className="ml-1.5 text-xs font-normal text-blue-500">키워드 없이도 생성 가능합니다</span>
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !generating) handleGenerate(); }}
                  placeholder="키워드 입력 (선택) — 예: 태양광 폐패널 재활용, 탄소 발자국 앱..."
                  disabled={generating}
                  className="flex-1 h-9 px-3 rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm placeholder:text-gray-400 disabled:opacity-60"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors"
                >
                  {generating ? (
                    <><Spinner size="sm" className="text-white" />생성 중...</>
                  ) : isAiGenerated ? (
                    '↺ 다시 생성'
                  ) : (
                    '✦ AI 생성'
                  )}
                </button>
              </div>
              {generateError && (
                <p className="text-xs text-red-500">{generateError}</p>
              )}
            </div>

            {/* 아이템명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                아이템명 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="예: 중소 제조공장 에너지 낭비 탐지 AI 솔루션"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* 아이템 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                아이템 설명 <span className="text-red-400">*</span>
                <span className="ml-1 text-xs font-normal text-gray-400">자세할수록 AI 작성 품질이 올라갑니다</span>
              </label>
              <textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder={`어떤 문제를 해결하는지, 어떻게 해결하는지, 주요 고객이 누구인지, 기술/차별점, 현재 개발 현황 등을 자유롭게 적어주세요.\n\n예) IoT 센서와 엣지 AI를 결합해 중소 제조공장의 에너지 낭비 구간을 실시간으로 탐지하고 절감 조치를 자동 추천하는 SaaS입니다. 기존 EMS 대비 설치 비용이 80% 저렴하고, MVP 개발이 완료되어 3개 공장과 파일럿 협의 중입니다. 주요 고객은 연 매출 50~500억 규모 중소 제조업체의 에너지 관리자입니다.`}
                rows={7}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button size="lg" className="w-full" onClick={handleStart} loading={uploading}>
              {uploading ? '파일 분석 중...' : 'AI 초안 작성 시작'}
            </Button>
          </div>
        </Card>

        {/* 최근 작업 */}
        {recentProjects.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">최근 작업</h2>
            <div className="space-y-2">
              {recentProjects.map((p) => (
                <Card key={p.id} padding="sm"
                  className="flex items-center gap-3 group cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleResume(p)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{p.businessInput.itemName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.templateFileName} · {new Date(p.updatedAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <Badge variant={stepColors[p.currentStep]}>{stepLabels[p.currentStep]}</Badge>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProject(p.id); setRecentProjects(getProjects()); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                  >✕</button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
