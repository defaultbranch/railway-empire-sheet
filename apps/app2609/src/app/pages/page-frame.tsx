import type { ReactNode } from 'react';

export type PageFrameProps = {
  index: number;
  title: string;
  description: string;
  onPrevious: () => void;
  onNext: () => void;
  children: ReactNode;
};

export function PageFrame({
  index,
  title,
  description,
  onPrevious,
  onNext,
  children,
}: PageFrameProps) {
  return (
    <section className="page-frame">
      <header className="page-frame__header entity-page__heading">
        <button className="entity-page__navigate" type="button" onClick={onPrevious} aria-label="Previous page" title="Previous page">
          <span aria-hidden="true">←</span>
        </button>
        <h1>
          {index}. {title}
        </h1>
        <button className="entity-page__navigate" type="button" onClick={onNext} aria-label="Next page" title="Next page">
          <span aria-hidden="true">→</span>
        </button>
      </header>
      <p className="page-frame__description">{description}</p>
      <div className="page-frame__content">{children}</div>
    </section>
  );
}
