import { asset } from '@/lib/images';

/**
 * Responsive illustration from kilf-assets/ (or its generated stand-in).
 * Originally served as AVIF/WebP via <picture srcset>; simplified to a plain
 * <img> (no next/image, no width-based srcset filtering) since asset() now
 * returns a plain public URL string with no width metadata.
 */
interface Props {
  src: string; // path inside kilf-assets, e.g. "illustrations/cover.jpg"
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export function Illustration({ src, alt, sizes = '100vw', className = '', priority = false }: Props) {
  const { src: img } = asset(src);
  return (
    <img
      src={img}
      alt={alt}
      sizes={sizes}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
    />
  );
}
