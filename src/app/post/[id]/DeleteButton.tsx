'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/24/outline';

export function DeleteButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? 'Failed to delete');
        return;
      }
      toast.success('Post deleted');
      router.push('/');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
        confirming
          ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200'
      }`}
    >
      <TrashIcon className="w-3.5 h-3.5" />
      {confirming ? 'Confirm delete' : 'Delete'}
    </button>
  );
}
