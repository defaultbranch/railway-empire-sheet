import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { pageIndexForPath } from './pages/pages';

export type Route =
  | { kind: 'page'; index: number }
  | { kind: 'city'; slug: string }
  | { kind: 'station'; slug: string }
  | { kind: 'warehouse'; slug: string }
  | { kind: 'ruralBusiness'; slug: string };

export function routeForPath(pathname: string): Route {
  const cityMatch = /^\/cities\/([^/]+)\/?$/.exec(pathname);
  if (cityMatch) return { kind: 'city', slug: cityMatch[1] };
  const stationMatch = /^\/stations\/([^/]+)\/?$/.exec(pathname);
  if (stationMatch) return { kind: 'station', slug: stationMatch[1] };
  const warehouseMatch = /^\/warehouses\/([^/]+)\/?$/.exec(pathname);
  if (warehouseMatch) return { kind: 'warehouse', slug: warehouseMatch[1] };
  const ruralBusinessMatch = /^\/rural-businesses\/([^/]+)\/?$/.exec(pathname);
  if (ruralBusinessMatch) return { kind: 'ruralBusiness', slug: ruralBusinessMatch[1] };
  return { kind: 'page', index: pageIndexForPath(pathname) };
}

export type NavigationState = {
  route: Route;
  navigate: (path: string) => void;
};

const NavigationContext = createContext<NavigationState | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => routeForPath(window.location.pathname));

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setRoute(routeForPath(path));
  };

  useEffect(() => {
    const onPopState = () => setRoute(routeForPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return <NavigationContext.Provider value={{ route, navigate }}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
