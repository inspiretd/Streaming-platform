import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy and content policy',
  description: 'How TOMOSHA handles viewer data, licensed content and copyright requests.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <header className="page-head">
        <h1 className="page-title">Privacy and content policy</h1>
        <p className="page-sub">Short version: we store as little as possible and only publish streams we are allowed to publish.</p>
      </header>

      <div className="panel" style={{ marginTop: 22, display: 'grid', gap: 16 }}>
        <section>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            Viewer data
          </h2>
          <p className="feature-text">
            Favorites, watch history and player settings are stored in your browser. Nothing leaves the device until you
            sign in and explicitly enable sync.
          </p>
        </section>

        <section>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            Content rights
          </h2>
          <p className="feature-text">
            Only licensed streams, public domain material, official embeds and rights holder approved playlists are
            published. Channels without a confirmed rights record stay in draft and never reach the public catalog.
          </p>
        </section>

        <section>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            Adult content
          </h2>
          <p className="feature-text">
            Adult, 18+, XXX and equivalent groups are rejected automatically during import and are never published.
          </p>
        </section>

        <section>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            Copyright requests
          </h2>
          <p className="feature-text">
            Rights holders can request removal or correction of any channel. Every import and publish action is written to
            an audit log with the acting role and timestamp.
          </p>
        </section>

        <section>
          <h2 className="section-title" style={{ fontSize: 18 }}>
            Security
          </h2>
          <p className="feature-text">
            Stream URLs, provider tokens and account identifiers are never rendered in the browser, written to logs, or
            committed to the repository.
          </p>
        </section>
      </div>
    </div>
  );
}
