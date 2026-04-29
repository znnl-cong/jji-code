'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getProjects, saveProject, deleteProject } from '@/lib/store';
import { DocumentProject } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const docxRef = useRef<HTMLInputElement>(null);

  const [representativeName, setRepresentativeName] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [recentProjects, setRecentProjects] = useState<DocumentProject[]>([]);

  useEffect(() => { setRecentProjects(getProjects()); }, []);

  const handleStart = async () => {
    if (!representativeName.trim()) { setError('대표자명을 입력해 주세요.'); return; }
    if (!itemName.trim()) { setError('아이템명을 입력해 주세요.'); return; }
    if (!itemDescription.trim()) { setError('아이템 설명을 입력해 주세요.'); return; }
    if (!docxFile) { setError('DOCX 양식 파일을 업로드해 주세요.'); return; }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('docx', docxFile);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '업로드 실패');

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
        templateDocxBase64: data.templateDocxBase64,
        filledFields: [],
        followUpQuestions: [],
        currentStep: 'generate',
        templateFileName: docxFile.name,
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

            {/* DOCX 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                사업계획서 양식 (DOCX) <span className="text-red-400">*</span>
              </label>
              <div
                onClick={() => docxRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-3 flex items-center gap-3 transition-colors ${
                  docxFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                {docxFile ? (
                  <>
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-700 truncate flex-1">{docxFile.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDocxFile(null); }}
                      className="text-gray-300 hover:text-gray-500"
                    >✕</button>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm text-gray-400">사업계획서 양식.docx 파일</span>
                  </>
                )}
                <input ref={docxRef} type="file" accept=".docx" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { setDocxFile(f); setError(''); } }} />
              </div>
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
