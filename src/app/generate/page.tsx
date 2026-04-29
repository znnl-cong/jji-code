'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { getProject, saveProject } from '@/lib/store';
import { DocumentProject, FilledField } from '@/types';

function groupBySection(fields: FilledField[]): Record<string, FilledField[]> {
  const groups: Record<string, FilledField[]> = {};
  for (const f of fields) {
    if (!groups[f.section]) groups[f.section] = [];
    groups[f.section].push(f);
  }
  return groups;
}

function FieldEditor({
  field, onChange, onRegenerate, regenerating,
}: {
  field: FilledField;
  onChange: (v: string) => void;
  onRegenerate: (instruction?: string) => void;
  regenerating: boolean;
}) {
  const [showInstruction, setShowInstruction] = useState(false);
  const [instruction, setInstruction] = useState('');

  if (field.type === 'enum' && field.enumOptions) {
    return (
      <div className="flex flex-wrap gap-2">
        {field.enumOptions.map((opt: string) => (
          <button key={opt} onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
              field.value === opt
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                : 'border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >{opt}</button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {field.type === 'long_text' ? (
        <textarea value={field.value} onChange={(e) => onChange(e.target.value)} rows={4}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed resize-none" />
      ) : (
        <input type="text" value={field.value} onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      )}
      <div className="flex items-center gap-2">
        <button onClick={() => onRegenerate()} disabled={regenerating}
          className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-40">
          {regenerating ? '생성 중...' : '↺ AI 재생성'}
        </button>
        <button onClick={() => setShowInstruction(!showInstruction)}
          className="text-xs text-gray-400 hover:text-gray-600">
          {showInstruction ? '취소' : '+ 지시사항'}
        </button>
        {showInstruction && (
          <input type="text" value={instruction} onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && instruction) { onRegenerate(instruction); setShowInstruction(false); setInstruction(''); } }}
            placeholder="수정 방향 입력 후 Enter"
            className="flex-1 h-7 px-2 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400" />
        )}
      </div>
    </div>
  );
}

function GenerateContent() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get('id');

  const [project, setProject] = useState<DocumentProject | null>(null);
  const [fields, setFields] = useState<FilledField[]>([]);
  const [activeSection, setActiveSection] = useState('');
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) { router.push('/'); return; }
    const p = getProject(projectId);
    if (!p) { router.push('/'); return; }
    setProject(p);
    setFields(p.filledFields);
    if (p.filledFields.length > 0) {
      const sections = [...new Set(p.filledFields.map((f) => f.section))];
      setActiveSection(sections[0]);
    }
  }, [projectId]);

  const handleChange = (key: string, value: string) => {
    setSaved(false);
    const updated = fields.map((f) => f.key === key ? { ...f, value, isEdited: true } : f);
    setFields(updated);
    if (project) {
      const up = { ...project, filledFields: updated };
      setProject(up);
    }
  };

  const handleSave = () => {
    if (!project) return;
    const up = { ...project, filledFields: fields };
    saveProject(up);
    setProject(up);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRegenerate = async (field: FilledField, instruction?: string) => {
    if (!project) return;
    setRegenerating(field.key);
    setError('');
    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: field.key,
          label: field.label,
          businessInput: project.businessInput,
          currentValue: field.value,
          instruction,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      handleChange(field.key, data.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : '재생성 실패');
    } finally {
      setRegenerating(null);
    }
  };

  const handleDownload = async () => {
    if (!project) return;
    handleSave();
    setDownloading(true);
    setError('');
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateDocxBase64: project.templateDocxBase64,
          fields,
          fileName: `${project.businessInput.itemName}_사업계획서.docx`,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '다운로드 실패'); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${project.businessInput.itemName}_사업계획서.docx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  if (!project || fields.length === 0) {
    return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  }

  const HIDDEN_SECTIONS = ['팀 구성', '실적·이력', '첨부'];
  const groups = groupBySection(fields);
  const sectionNames = [...new Set(fields.map((f) => f.section))].filter((s) => !HIDDEN_SECTIONS.includes(s));
  const activeFields = groups[activeSection] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600">←</button>
            <div>
              <p className="text-xs text-gray-400">수정 페이지</p>
              <p className="font-semibold text-gray-800 truncate max-w-xs text-sm">{project.businessInput.itemName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{fields.filter((f) => f.isEdited).length}개 수정됨</span>
            <button
              onClick={handleSave}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                saved
                  ? 'border-green-300 bg-green-50 text-green-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {saved ? '✓ 저장됨' : '저장'}
            </button>
            <Button onClick={handleDownload} loading={downloading}>다운로드</Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full">
        <aside className="w-52 shrink-0 border-r border-gray-100 bg-white overflow-y-auto">
          <nav className="p-2 space-y-0.5 pt-4">
            {sectionNames.map((s) => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === s ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {s}
                <span className="ml-1 text-xs text-gray-400">({groups[s].length})</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {project.followUpQuestions && project.followUpQuestions.length > 0 && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-xs font-semibold text-amber-700">AI가 확인을 요청한 사항</p>
              <ul className="space-y-1">
                {project.followUpQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-amber-800 flex gap-2">
                    <span className="text-amber-400 shrink-0">{i + 1}.</span>{q}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-500 pt-0.5">해당 항목을 직접 수정하거나, 정보 입력 후 재생성하세요.</p>
            </div>
          )}

          {error && <p className="mb-4 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <Card>
            <h2 className="font-bold text-gray-900 mb-5">{activeSection}</h2>
            <div className="space-y-5">
              {activeFields.map((f) => (
                <div key={f.key}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-sm font-medium text-gray-700">{f.label}</label>
                    {f.isEdited && <Badge variant="blue">수정됨</Badge>}
                    {regenerating === f.key && <Spinner size="sm" />}
                  </div>
                  <FieldEditor
                    field={f}
                    onChange={(v) => handleChange(f.key, v)}
                    onRegenerate={(inst) => handleRegenerate(f, inst)}
                    regenerating={regenerating === f.key}
                  />
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => { const idx = sectionNames.indexOf(activeSection); if (idx > 0) setActiveSection(sectionNames[idx - 1]); }}
              disabled={sectionNames.indexOf(activeSection) === 0}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
            >← 이전 섹션</button>
            {sectionNames.indexOf(activeSection) < sectionNames.length - 1 ? (
              <button
                onClick={() => { const idx = sectionNames.indexOf(activeSection); setActiveSection(sectionNames[idx + 1]); }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >다음 섹션 →</button>
            ) : (
              <Button onClick={handleDownload} loading={downloading}>다운로드 →</Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>}>
      <GenerateContent />
    </Suspense>
  );
}
