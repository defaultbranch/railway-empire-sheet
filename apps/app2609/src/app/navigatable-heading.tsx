export type Heading = {
  title: string;
  path: string;
};

export type NavigatableHeadingProps = {
  headings: readonly Heading[];
  currentPath: string;
  onNavigate: (path: string) => void;
  navigationLabel: string;
  className?: string;
};

export function NavigatableHeading({
  headings,
  currentPath,
  onNavigate,
  navigationLabel,
  className,
}: NavigatableHeadingProps) {
  const index = headings.findIndex((heading) => heading.path === currentPath);
  if (index < 0) return undefined;

  const current = headings[index];
  const previous = headings[(index + headings.length - 1) % headings.length];
  const next = headings[(index + 1) % headings.length];
  const previousLabel = `Previous ${navigationLabel}: ${previous.title}`;
  const nextLabel = `Next ${navigationLabel}: ${next.title}`;

  return (
    <header className={['entity-page__heading', className].filter(Boolean).join(' ')}>
      {headings.length > 1 && (
        <button
          className="entity-page__navigate"
          type="button"
          onClick={() => onNavigate(previous.path)}
          aria-label={previousLabel}
          title={previousLabel}
        >
          <span aria-hidden="true">←</span>
        </button>
      )}
      <h1 className="navigatable-heading__title">
        <span>{current.title}</span>
        {headings.map((heading) => (
          <span key={heading.path} className="navigatable-heading__measure" aria-hidden="true">
            {heading.title}
          </span>
        ))}
      </h1>
      {headings.length > 1 && (
        <button
          className="entity-page__navigate"
          type="button"
          onClick={() => onNavigate(next.path)}
          aria-label={nextLabel}
          title={nextLabel}
        >
          <span aria-hidden="true">→</span>
        </button>
      )}
    </header>
  );
}
