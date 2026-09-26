import { useEffect } from 'react';
import { GameStateProvider } from './game-state';
import { ThemeProvider, useTheme } from './theme';
import { NavigationProvider, useNavigation } from './navigation';
import { PageFrame } from './pages/page-frame';
import { pages, pathForPageIndex } from './pages/pages';
import { CityPage } from './entities/city-page';
import { StationPage } from './entities/station-page';

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

function PagesRoute({ pageIndex }: { pageIndex: number }) {
  const { navigate } = useNavigation();
  const page = pages[pageIndex];

  useEffect(() => {
    const currentPath = pathForPageIndex(pageIndex);
    if (window.location.pathname !== currentPath) {
      window.history.replaceState(null, '', currentPath);
    }
  }, [pageIndex]);

  const goToPage = (index: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, index));
    navigate(pathForPageIndex(clamped));
  };

  return (
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
  );
}

function AppRoutes() {
  const { route } = useNavigation();

  if (route.kind === 'city') {
    return <CityPage slug={route.slug} />;
  }

  if (route.kind === 'station') {
    return <StationPage slug={route.slug} />;
  }

  return <PagesRoute pageIndex={route.index} />;
}

export function App() {
  return (
    <ThemeProvider>
      <GameStateProvider>
        <NavigationProvider>
          <main className="app-shell">
            <ThemeToggle />
            <AppRoutes />
          </main>
        </NavigationProvider>
      </GameStateProvider>
    </ThemeProvider>
  );
}
