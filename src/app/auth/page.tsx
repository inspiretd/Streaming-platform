import type { Metadata } from 'next';
import { SignInForm } from '@/components/user/SignInForm';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to TOMOSHA with a passwordless magic link.',
  alternates: { canonical: '/auth' },
};

export default function AuthPage() {
  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <header className="page-head">
        <h1 className="page-title">Sign in</h1>
        <p className="page-sub">
          TOMOSHA uses passwordless magic links. No password is stored and no third party tracker is loaded on this page.
        </p>
      </header>
      <SignInForm />
    </div>
  );
}
