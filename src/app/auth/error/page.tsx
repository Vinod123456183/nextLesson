import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card w-full max-w-sm text-center space-y-4">
        <h1 className="text-lg font-semibold text-gray-900">Sign-in failed</h1>
        <p className="text-sm text-gray-500">
          Something went wrong during sign-in. Please try again.
        </p>
        <Link href="/auth/signin" className="btn-primary">
          Try again
        </Link>
      </div>
    </div>
  );
}
