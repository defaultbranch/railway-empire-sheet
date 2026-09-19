import { useState } from 'react';
import { GameStateProvider } from './game-state';
import { PageFrame } from './pages/page-frame';
import { pages } from './pages/pages';

export function App() {
  const [pageIndex, setPageIndex] = useState(0);
  const page = pages[pageIndex];

  return (
    <GameStateProvider>
      <main className="app-shell">
        <PageFrame
          index={pageIndex + 1}
          title={page.title}
          description={page.description}
          canGoPrevious={pageIndex > 0}
          canGoNext={pageIndex < pages.length - 1}
          onPrevious={() => setPageIndex((current) => Math.max(0, current - 1))}
          onNext={() => setPageIndex((current) => Math.min(pages.length - 1, current + 1))}
        >
          <page.Component />
        </PageFrame>
      </main>
    </GameStateProvider>
  );
}
