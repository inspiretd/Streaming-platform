'use client';
export default function ErrorState({ reset }: { reset: () => void }) { return <main className="app-shell"><section className="simple-page"><p className="eyebrow">Something went sideways</p><h1>We lost the signal.</h1><button className="primary-button" onClick={reset}>Try again</button></section></main>; }
