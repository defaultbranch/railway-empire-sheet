import type { ReactNode } from 'react';
import { NavigatableHeading, type Heading } from '../navigatable-heading';

export type PageFrameProps = {
  headings: readonly Heading[];
  currentPath: string;
  description: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
};

export function PageFrame({
  headings,
  currentPath,
  description,
  onNavigate,
  children,
}: PageFrameProps) {
  return (
    <section className="page-frame">
      <NavigatableHeading
        className="page-frame__header"
        headings={headings}
        currentPath={currentPath}
        onNavigate={onNavigate}
        navigationLabel="page"
      />
      <p className="page-frame__description">{description}</p>
      <div className="page-frame__content">{children}</div>
    </section>
  );
}
