import { useRef } from 'react';
import { useNavigation } from './navigation';
import { useGameActions } from './game-state';
import { deserializeGameState } from './game-state/persistence';
import { pages, pathForPageIndex } from './pages/pages';

export function NavMenu() {
  const importInput = useRef<HTMLInputElement>(null);
  const { route, navigate } = useNavigation();
  const { exportGameState, replaceGameState, resetToDefault, wipeToEmpty } = useGameActions();

  const exportSave = () => {
    const blob = new Blob([exportGameState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `railway-empire-save-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
          <nav className="nav-menu__panel" aria-label="Main navigation">
            <header className="nav-menu__header">
              <h2>Pages</h2>
            </header>
            <ul className="nav-menu__list">
              {pages.map((page, index) => {
                const path = pathForPageIndex(index);
                const isActive = route.kind === 'page' && route.index === index;
                return (
                  <li key={page.slug}>
                    <a
                      href={path}
                      className={`nav-menu__link${isActive ? ' nav-menu__link--active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(path);
                      }}
                    >
                      {index + 1}. {page.title}
                    </a>
                  </li>
                );
              })}
            </ul>
            <footer className="nav-menu__footer">
              <button type="button" className="nav-menu__action" onClick={exportSave}>
                Export save
              </button>
              <button type="button" className="nav-menu__action" onClick={() => importInput.current?.click()}>
                Import save
              </button>
              <input
                ref={importInput}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={async (event) => {
                  const input = event.currentTarget;
                  const file = input.files?.[0];
                  input.value = '';
                  if (!file) return;

                  try {
                    const state = deserializeGameState(await file.text());
                    if (!state) {
                      window.alert('This file is not a valid Railway Empire save.');
                      return;
                    }
                    if (window.confirm('Import this save and replace the current game data?')) {
                      replaceGameState(state);
                    }
                  } catch {
                    window.alert('Unable to read this save file. Your current game data was not changed.');
                  }
                }}
              />
              <button
                type="button"
                className="nav-menu__action"
                onClick={() => {
                  if (window.confirm('Reset all data to the default state? This discards your current data.')) {
                    resetToDefault();
                  }
                }}
              >
                Reset to default
              </button>
              <button
                type="button"
                className="nav-menu__action"
                onClick={() => {
                  if (window.confirm('Wipe all data to an empty state? This discards your current data.')) {
                    wipeToEmpty();
                  }
                }}
              >
                Wipe to empty
              </button>
            </footer>
          </nav>
  );
}
