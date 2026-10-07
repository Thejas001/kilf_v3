/**
 * KILF logo. Drop the real file at public/kilf-assets/logos/kilf-logo.svg (and
 * kilf-logo-white.svg for dark backgrounds) and it replaces this stand-in:
 * a lowercase "kilf" wordmark with "2027" set vertically beside it.
 * The stand-in draws in currentColor, so it follows the header's colour.
 *
 * The real-file check (`logoUrl()` in `@/lib/images`, which reads
 * public/kilf-assets/logos/ off disk) can only run in a Server Component —
 * it isn't safe to bundle for the browser. Server Component call sites
 * (Footer, Partners) resolve it themselves and pass the result as `src`;
 * Header renders Logo from a Client Component and always gets the stand-in
 * (a deliberate simplification — see Header.tsx).
 */
interface Props {
  tone?: 'light' | 'dark';
  className?: string;
  /** Hide from AT when the parent link supplies the name. */
  decorative?: boolean;
  /** Pre-resolved logo file URL, from `logoUrl()` — see note above. */
  src?: string;
}

export function Logo({ tone = 'light', className = '', decorative = false, src }: Props) {
  if (src) {
    return <img src={src} alt={decorative ? '' : 'KILF 2027'} className={`h-10 w-auto ${className}`} width={96} height={44} />;
  }
  return (
    <svg
      viewBox="0 0 92 44"
      className={`h-10 w-auto ${className}`}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : 'KILF 2027, Kollam International Literature Festival'}
    >
      <text
        x="-1"
        y="36"
        fontFamily="Plus Jakarta Sans Variable, Plus Jakarta Sans, sans-serif"
        fontWeight="800"
        fontSize="46"
        letterSpacing="-2.6"
        textLength="70"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
      >
        kilf
      </text>
      <text
        transform="translate(76.5 3.5) rotate(90)"
        fontFamily="Manrope Variable, Manrope, sans-serif"
        fontWeight="800"
        fontSize="11.5"
        letterSpacing="0.9"
        textLength="33"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        className="logo-year"
      >
        2027
      </text>
    </svg>
  );
}
