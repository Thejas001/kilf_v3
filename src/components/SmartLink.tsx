import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

/** Internal paths go through next/link (client-side nav + prefetch); everything else stays a plain <a>. */
export function SmartLink({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const internal = href.startsWith('/') && !href.startsWith('//') && !/\.[a-z0-9]+$/i.test(href.split(/[?#]/)[0]) && !rest.target && !('download' in rest);
  return internal ? <Link href={href} {...rest} /> : <a href={href} {...rest} />;
}
