import { Illustration } from '@/components/Illustration';

/**
 * Khasakkinte Ithihasam as a book that opens into a stage. The cover swings
 * open around the spine, a few pages turn after it, and the spread shows the
 * title page and the stage. How far it is open comes from `--p` (0 closed,
 * 1 open) on an ancestor: the home page ties it to scrolling. Without that
 * (no script, reduced motion) the book is shown open.
 */
interface Props {
  novel: string;
  staged: string;
  when: string;
  className?: string;
}

export function KhasakBook({ novel, staged, when, className = '' }: Props) {
  return (
    <div className={['book', className].filter(Boolean).join(' ')} data-book>
      <div className="book-shadow" aria-hidden="true"></div>
      <div className="book-3d">
        {/* The right-hand page: the stage */}
        <div className="page page-right">
          <div className="plate">
            <Illustration src="illustrations/p4_stage.jpg" alt="" sizes="(min-width: 1024px) 24vw, 70vw" className="absolute inset-0 h-full w-full object-cover object-[64%_center]" />
            <div className="plate-light" aria-hidden="true"></div>
          </div>
          <p className="plate-caption">{when}</p>
        </div>

        {/* Pages that turn after the cover; the last one carries the title page */}
        <div className="leaf" style={{ '--i': 3 } as React.CSSProperties}>
          <div className="face face-front lines" aria-hidden="true"></div>
          <div className="face face-back title-page">
            <p className="tp-kicker">{novel}</p>
            <p className="tp-ml" lang="ml">
              ഖസാക്കിന്റെ
              <br />
              ഇതിഹാസം
            </p>
            <p className="tp-en">Khasakkinte Ithihasam</p>
            <span className="tp-rule" aria-hidden="true"></span>
            <p className="tp-staged">{staged}</p>
          </div>
        </div>
        <div className="leaf" style={{ '--i': 2 } as React.CSSProperties} aria-hidden="true">
          <div className="face face-front lines"></div>
          <div className="face face-back lines"></div>
        </div>
        <div className="leaf" style={{ '--i': 1 } as React.CSSProperties} aria-hidden="true">
          <div className="face face-front lines"></div>
          <div className="face face-back lines"></div>
        </div>

        {/* The cover */}
        <div className="leaf cover" style={{ '--i': 0 } as React.CSSProperties}>
          <div className="face face-front cover-front">
            <div className="cover-frame">
              <p className="cv-author">O. V. VIJAYAN</p>
              <svg className="cv-emblem" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="50" r="30" fill="#ff8870" />
                <g fill="#f7cf97">
                  <path d="M58 108c2-22 3-40 2-58h3c1 18 0 36-2 58z" />
                  <path d="M61 50c-10-8-24-9-34-3 10-1 22 1 34 5zM61 50c-6-11-18-17-30-16 10 3 20 9 30 16zM61 50c1-12-4-24-12-30 5 9 8 19 12 30zM61 50c7-10 19-14 31-12-10 2-21 6-31 12zM61 50c11-5 25-4 34 3-10-2-22-2-34-3zM61 50c9 3 18 11 21 21-6-8-13-14-21-21zM61 50c-9 4-16 12-18 22 5-8 11-15 18-22z" />
                </g>
              </svg>
              <p className="cv-ml" lang="ml">
                ഖസാക്കിന്റെ
                <br />
                ഇതിഹാസം
              </p>
              <p className="cv-en">Khasakkinte Ithihasam</p>
              <p className="cv-foot">KILF 2027 · On stage</p>
            </div>
          </div>
          <div className="face face-back endpaper" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
}
