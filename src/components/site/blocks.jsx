import { useEffect } from 'react';

export function useScrollTop() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
}

export function PageHero({ eyebrow, title, intro, children }) {
  return (
    <section className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">{eyebrow}</p>
        )}
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {intro && <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-3xl">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function Prose({ children }) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 space-y-12 text-gray-700 leading-relaxed">
      {children}
    </div>
  );
}

export function Section({ title, children, id }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function Clause({ title, children }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <div className="mt-1.5 space-y-3 text-[15px]">{children}</div>
    </div>
  );
}

export function Bullet({ children }) {
  return (
    <div className="flex gap-3">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Numbered list used for policy clauses that must stay in order. */
export function Numbered({ items }) {
  return (
    <ol className="space-y-4">
      {items.map(({ title, children }, index) => (
        <li key={title} className="flex gap-4">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <div className="mt-1.5 space-y-3 text-[15px]">{children}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}