/** Section label in the print style: "01 / THE CITY OPENS ITS PAGES". */
interface Props {
  n: number;
  label: string;
  tone?: 'light' | 'dark' | 'lime' | 'coral';
  className?: string;
}

const colors = { light: 'text-navy', dark: 'text-white/85', lime: 'text-navy', coral: 'text-navy' };

export function ChapterLabel({ n, label, tone = 'light', className = '' }: Props) {
  const num = String(n).padStart(2, '0');
  const color = colors[tone];
  return (
    <p className={['eyebrow', color, className].filter(Boolean).join(' ')}>
      <span lang="en">{num}</span> <span aria-hidden="true">/</span> {label}
    </p>
  );
}
