import { useEffect, useState } from 'react';
import { GameStateProvider } from './game-state';
import { ThemeProvider, useTheme } from './theme';
import { PageFrame } from './pages/page-frame';
import { pageIndexForPath, pages, pathForPageIndex } from './pages/pages';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

export function App() {
  const [pageIndex, setPageIndex] = useState(() => pageIndexForPath(window.location.pathname));
  const page = pages[pageIndex];

  useEffect(() => {
    const currentPath = pathForPageIndex(pageIndex);
    if (window.location.pathname !== currentPath) {
      window.history.replaceState(null, '', currentPath);
    }
  }, [pageIndex]);

  useEffect(() => {
    const onPopState = () => setPageIndex(pageIndexForPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const goToPage = (index: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, index));
    window.history.pushState(null, '', pathForPageIndex(clamped));
    setPageIndex(clamped);
  };

  return (
    <ThemeProvider>
      <GameStateProvider>
        <main className="app-shell">
          <ThemeToggle />
          <PageFrame
            index={pageIndex + 1}
            title={page.title}
            description={page.description}
            canGoPrevious={pageIndex > 0}
            canGoNext={pageIndex < pages.length - 1}
            onPrevious={() => goToPage(pageIndex - 1)}
            onNext={() => goToPage(pageIndex + 1)}
          >
            <page.Component />
          </PageFrame>
        </main>
      </GameStateProvider>
    </ThemeProvider>
  );
}
