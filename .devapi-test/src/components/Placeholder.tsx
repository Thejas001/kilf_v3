/**
 * Renders a [PLACEHOLDER] value. In dev it is highlighted so it is not
 * missed; every placeholder is listed in TODO.md.
 */
export function Placeholder({ value }: { value: string }) {
  const dev = process.env.NODE_ENV !== 'production';
  return <span className={dev ? 'ph-dev' : undefined} data-placeholder>{value}</span>;
}
