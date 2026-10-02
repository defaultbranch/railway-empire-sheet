import { useEffect, useState } from 'react';
import { useNavigation } from './navigation';
import { pages, pathForPageIndex } from './pages/pages';

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const { route, navigate } = useNavigation();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const goTo = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="nav-menu__toggle"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        ☰
      </button>
      {open && (
        <div className="nav-menu__overlay" onClick={() => setOpen(false)}>
          <nav className="nav-menu__panel" onClick={(event) => event.stopPropagation()}>
            <header className="nav-menu__header">
              <h2>Pages</h2>
              <button
                type="button"
                className="nav-menu__close"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
              >
                ×
              </button>
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
                      onClick={(event) => {
                        event.preventDefault();
                        goTo(path);
                      }}
                    >
                      {index + 1}. {page.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
