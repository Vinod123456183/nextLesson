'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

const TYPES = [
  { value: 'lesson',  label: 'Lesson',  active: 'bg-blue-500 text-white border-blue-500',   inactive: 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50' },
  { value: 'tip',     label: 'Tip',     active: 'bg-green-500 text-white border-green-500',  inactive: 'bg-white text-green-600 border-green-200 hover:bg-green-50' },
  { value: 'mistake', label: 'Mistake', active: 'bg-red-500 text-white border-red-500',      inactive: 'bg-white text-red-600 border-red-200 hover:bg-red-50' },
];

export function TypeFilter() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const activeType   = searchParams.get('type');
  const activeTag    = searchParams.get('tag');

  function handleType(type: string) {
    const params = new URLSearchParams();
    if (activeTag) params.set('tag', activeTag);          // preserve tag filter
    if (type !== activeType) params.set('type', type);    // toggle off if same
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  return (
    <div className="flex items-center gap-2">
      {TYPES.map((t) => (
        <button
          key={t.value}
          onClick={() => handleType(t.value)}
          className={clsx(
            'px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors',
            activeType === t.value ? t.active : t.inactive
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}