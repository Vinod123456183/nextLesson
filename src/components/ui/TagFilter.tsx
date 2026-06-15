'use client';

import { TAGS } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

export function TagFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag');

  function handleTag(tag: string) {
    if (tag === activeTag) {
      router.push('/');
    } else {
      router.push(`/?tag=${encodeURIComponent(tag)}`);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTag(tag)}
          className={clsx(
            'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
            activeTag === tag
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
