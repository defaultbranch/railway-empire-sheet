import { useEffect } from 'react';
import { GameStateProvider } from './game-state';
import { ThemeProvider, useTheme } from './theme';
import { NavigationProvider, useNavigation } from './navigation';
import { NavMenu } from './nav-menu';
import { PageFrame } from './pages/page-frame';
import { pages, pathForPageIndex } from './pages/pages';
import { CityPage } from './entities/city-page';
import { StationPage } from './entities/station-page';
import { WarehousePage } from './entities/warehouse-page';
import { RuralBusinessPage } from './entities/rural-business-page';
import { RuralBusinessTypePage } from './entities/rural-business-type-page';
import { TrainLinePage } from './entities/train-line-page';
import { GoodPage } from './entities/good-page';

const pageHeadings = pages.map((page, index) => ({
  title: `${index + 1}. ${page.title}`,
  path: pathForPageIndex(index),
}));

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

  return (
    <PageFrame
      headings={pageHeadings}
      currentPath={pathForPageIndex(pageIndex)}
      description={page.description}
      onNavigate={navigate}
    >
      <page.Component />
    </PageFrame>
  );
}

function AppRoutes() {
  const { route } = useNavigation();

  if (route.kind === 'good') {
    return <GoodPage slug={route.slug} />;
  }

  if (route.kind === 'city') {
    return <CityPage slug={route.slug} />;
  }

  if (route.kind === 'station') {
    return <StationPage slug={route.slug} />;
  }

  if (route.kind === 'warehouse') {
    return <WarehousePage slug={route.slug} />;
  }

  if (route.kind === 'ruralBusiness') {
    return <RuralBusinessPage slug={route.slug} />;
  }

  if (route.kind === 'ruralBusinessType') {
    return <RuralBusinessTypePage slug={route.slug} />;
  }

  if (route.kind === 'trainLine') {
    return <TrainLinePage slug={route.slug} />;
  }

  return <PagesRoute pageIndex={route.index} />;
}

export function App() {
  return (
    <ThemeProvider>
      <GameStateProvider>
        <NavigationProvider>
          <div className="app-shell">
            <NavMenu />
            <main className="app-shell__content">
              <ThemeToggle />
              <AppRoutes />
            </main>
          </div>
        </NavigationProvider>
      </GameStateProvider>
    </ThemeProvider>
  );
}
