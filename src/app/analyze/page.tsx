'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';
import { getProject, saveProject } from '@/lib/store';
import { DocumentProject, FilledField } from '@/types';

const STEPS = [
  '아이템 정보를 분석하고 있어요...',
  '사업계획서 구조를 파악하고 있어요...',
  '각 항목을 작성하고 있어요...',
  '마무리하고 있어요...',
];

function AnalyzeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get('id');
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) { router.push('/'); return; }
    const p = getProject(projectId);
    if (!p) { router.push('/'); return; }
    if (p.filledFields.length > 0) { router.push(`/generate?id=${projectId}`); return; }
    autoGenerate(p);
  }, [projectId]);

  useEffect(() => {
    const timer = setInterval(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), 3500);
    return () => clearInterval(timer);
  }, []);

  const autoGenerate = async (p: DocumentProject) => {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessInput: p.businessInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '생성 실패');

      const updated: DocumentProject = {
        ...p,
        filledFields: data.fields as FilledField[],
        followUpQuestions: data.followUpQuestions ?? [],
        currentStep: 'generate',
      };
      saveProject(updated);
      router.push(`/generate?id=${p.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-sm px-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-30" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
            <Spinner size="lg" />
          </div>
        </div>

        {error ? (
          <div className="space-y-3">
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={() => router.push('/')} className="text-sm text-gray-500 underline">처음으로 돌아가기</button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-semibold text-gray-800">{STEPS[stepIndex]}</p>
            <p className="text-sm text-gray-400">AI가 사업계획서 초안을 작성 중입니다</p>
          </div>
        )}

        {!error && (
          <div className="flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= stepIndex ? 'w-4 bg-blue-500' : 'w-1.5 bg-gray-200'
              }`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>}>
      <AnalyzeContent />
    </Suspense>
  );
}
