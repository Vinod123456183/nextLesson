import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-200">404</h1>
        <p className="text-gray-500">This page doesn't exist.</p>
        <Link href="/" className="btn-primary">Go home</Link>
      </div>
    </div>
  );
}
