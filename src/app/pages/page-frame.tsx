import type { ReactNode } from 'react';

export type PageFrameProps = {
  index: number;
  title: string;
  description: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  children: ReactNode;
};

export function PageFrame({
  index,
  title,
  description,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  children,
}: PageFrameProps) {
  return (
    <section className="page-frame">
      <header className="page-frame__header">
        <button type="button" onClick={onPrevious} disabled={!canGoPrevious} aria-label="Previous page">
          ←
        </button>
        <h1>
          {index}. {title}
        </h1>
        <button type="button" onClick={onNext} disabled={!canGoNext} aria-label="Next page">
          →
        </button>
      </header>
      <p className="page-frame__description">{description}</p>
      <div className="page-frame__content">{children}</div>
    </section>
  );
}
