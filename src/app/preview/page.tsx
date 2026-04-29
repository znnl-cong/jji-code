'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { getProject, saveProject } from '@/lib/store';
import { DocumentProject } from '@/types';

function PreviewContent() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get('id');

  const [project, setProject] = useState<DocumentProject | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) { router.push('/'); return; }
    const p = getProject(projectId);
    if (!p) { router.push('/'); return; }
    const updated = { ...p, currentStep: 'preview' as const };
    saveProject(updated);
    setProject(updated);
  }, [projectId]);

  const handleDownload = async () => {
    if (!project) return;
    setDownloading(true);
    setError('');

    try {
      const fileName = `${project.businessInput.itemName}_사업계획서.docx`;
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateDocxBase64: project.templateDocxBase64,
          fields: project.filledFields,
          fileName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '다운로드 실패');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  if (!project) {
    return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  }

  const editedCount = project.filledFields.filter((f) => f.isEdited).length;
  const filledCount = project.filledFields.filter((f) => f.value.trim()).length;

  // 미리보기용: long_text 필드만 추려서 섹션별로 표시
  const previewFields = project.filledFields.filter(
    (f) => f.type === 'long_text' && f.value.trim()
  );
  const shortFields = project.filledFields.filter(
    (f) => f.type !== 'long_text' && f.value.trim()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/generate?id=${projectId}`)} className="text-gray-400 hover:text-gray-600">←</button>
            <span className="font-semibold text-gray-800 truncate max-w-sm">{project.businessInput.itemName}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push(`/generate?id=${projectId}`)}>
              편집으로 돌아가기
            </Button>
            <Button onClick={handleDownload} loading={downloading}>
              DOCX 다운로드
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* 요약 카드 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">작성 완료</h2>
            <Badge variant="green">완성</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{project.filledFields.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">전체 항목</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{filledCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">작성 완료</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{editedCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">직접 수정</p>
            </div>
          </div>
        </Card>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* 기본 정보 미리보기 */}
        {shortFields.length > 0 && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3">기본 정보</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {shortFields.map((f) => (
                <div key={f.key} className="flex gap-2 text-sm">
                  <span className="text-gray-400 shrink-0">{f.label}</span>
                  <span className="text-gray-800 font-medium truncate">{f.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 본문 미리보기 */}
        {previewFields.length > 0 && (
          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">본문 미리보기</h3>
              <p className="text-xs text-gray-400 mt-0.5">다운로드 후 {'{{KEY}}'}가 실제 내용으로 치환됩니다</p>
            </div>
            <div className="p-6 space-y-5">
              {previewFields.map((f) => (
                <div key={f.key}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                    {f.label}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 다운로드 CTA */}
        <div className="flex flex-col items-center gap-3 py-4">
          <Button size="lg" onClick={handleDownload} loading={downloading} className="min-w-52">
            DOCX 다운로드
          </Button>
          <p className="text-xs text-gray-400">
            원본 양식의 서식이 유지된 채로 {'{{KEY}}'}가 AI 작성 내용으로 치환됩니다
          </p>
        </div>
      </main>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>}>
      <PreviewContent />
    </Suspense>
  );
}
