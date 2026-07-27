import type { Metadata } from 'next';
import Link from 'next/link';
import { ProfileView } from '@/components/user/UserViews';

export const metadata: Metadata = {
  title: 'Profile and settings',
  description: 'Playback, language and privacy settings for your TOMOSHA profile.',
  alternates: { canonical: '/profile' },
};

export default function ProfilePage() {
  return (
    <div className="container">
      <header className="page-head">
        <h1 className="page-title">Profile</h1>
        <p className="page-sub">
          You are browsing as a guest. Sign in with a magic link to sync favorites, history and settings.
        </p>
        <div className="pill-row">
          <Link href="/auth" className="btn btn-primary btn-sm">
            Sign in
          </Link>
          <Link href="/history" className="btn btn-ghost btn-sm">
            Watch history
          </Link>
        </div>
      </header>

      <ProfileView />
    </div>
  );
}
