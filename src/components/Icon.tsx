/** Thin-stroke line icons (24×24, 1.5px stroke). Decorative by default. */
interface Props {
  name: string;
  size?: number;
  className?: string;
  label?: string;
}

const paths: Record<string, string> = {
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Zm0 0v13"/>',
  film: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M7.5 4.5v15M16.5 4.5v15M3.5 9h4M3.5 15h4M16.5 9h4M16.5 15h4"/>',
  music: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  mask: '<path d="M4 5c5 1.5 11 1.5 16 0v6a8 8 0 0 1-16 0V5Z"/><path d="M8.5 10.5h1.5M14 10.5h1.5M9 15c2 1.3 4 1.3 6 0"/>',
  palette:
    '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.8-1 1.3-2-.7-1.3.2-2.7 1.7-2.7h1.8a3.7 3.7 0 0 0 3.7-3.7C20.5 7.2 16.7 3.5 12 3.5Z"/><circle cx="7.8" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="8" r="1"/>',
  bulb: '<path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17.5h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5Z"/>',
  kite: '<path d="M12 3 19 10l-7 11-7-11 7-7Z"/><path d="M5 10h14M12 3v18"/>',
  books: '<rect x="4" y="4" width="4" height="16" rx="1"/><rect x="9.5" y="6" width="4" height="14" rx="1"/><path d="m15.3 7.2 3.7-1 3 12.7-3.8 1Z"/>',
  bowl: '<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0Z"/><path d="M9 8c0-1.5 1-1.5 1-3M13 8c0-1.5 1-1.5 1-3M8 20.5h8"/>',
  mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.1a4.3 4.3 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20Z"/>',
  store:
    '<path d="M4 9.5 5.5 4h13L20 9.5M4 9.5v10h16v-10M4 9.5c0 1.4 1.1 2.5 2.7 2.5s2.6-1.1 2.6-2.5c0 1.4 1.2 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1.1 2.5 2.6 2.5S20 10.9 20 9.5M10 19.5v-4h4v4"/>',
  handshake:
    '<path d="m3 11 4-4 4 1.5L14 7l7 4M3 11l5 5c.8.8 2 .8 2.8 0M21 11l-4.5 4.5c-.8.8-2 .8-2.8 0L10 12l2-2"/><path d="m10.8 16 1.2 1.2c.8.8 2 .8 2.8 0"/>',
  ticket:
    '<path d="M3.5 7.5a1.5 1.5 0 0 1 1.5-1.5h14a1.5 1.5 0 0 1 1.5 1.5V10a2 2 0 0 0 0 4v2.5A1.5 1.5 0 0 1 19 18H5a1.5 1.5 0 0 1-1.5-1.5V14a2 2 0 0 0 0-4Z"/><path d="M14.5 6v12" stroke-dasharray="2 2"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/>',
  sparkle: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  wave: '<path d="M2.5 9c2.4-2 4.8-2 7.2 0s4.8 2 7.1 0 4.8-2 4.8 0M2.5 15c2.4-2 4.8-2 7.2 0s4.8 2 7.1 0 4.8-2 4.8 0"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  phone:
    '<path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"/>',
  chat: '<path d="M4.5 19.5 5.6 16A8 8 0 1 1 8 18.4Z"/><path d="M9 11h.01M12 11h.01M15 11h.01"/>',
  at: '<circle cx="12" cy="12" r="3.5"/><path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.3 6.7"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5c.7-4 3.7-6 7.5-6s6.8 2 7.5 6"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
  'eye-off': '<path d="M3.5 3.5l17 17M10 5.7c.6-.1 1.3-.2 2-.2 6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.7M6.5 7.3A15.6 15.6 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"/>',
  camera: '<rect x="3.5" y="6.5" width="17" height="13" rx="2.5"/><path d="M8.5 6.5 10 4h4l1.5 2.5"/><circle cx="12" cy="13" r="3.5"/>',
  graduation:
    '<path d="M2.5 9.5 12 5l9.5 4.5L12 14Z"/><path d="M6.5 11.5V16c1.5 1.5 3.5 2.2 5.5 2.2s4-.7 5.5-2.2v-4.5M21.5 9.5v5"/>',
  pen: '<path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5Z"/><path d="m13.5 7 3 3"/>',
  anchor: '<circle cx="12" cy="5.5" r="2"/><path d="M12 7.5v13M8 11h8M4.5 13.5a7.5 7.5 0 0 0 15 0"/>',
  leaf: '<path d="M5 19c0-8.5 5.5-14 15-14 0 9.5-5.5 15-14 15"/><path d="M5 19 13 11"/>',
  scroll:
    '<path d="M7 4.5h11a2 2 0 0 1 2 2V8h-4M7 4.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8"/><path d="M8.5 10h6M8.5 13.5h6M8.5 17h3.5"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5Z"/>',
  briefcase: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V5.5h6v2M3.5 12.5h17"/>',
  megaphone: '<path d="M4 10v4h3l8 4.5v-13L7 10Z"/><path d="M7 14v4.5M18 9.5a3.5 3.5 0 0 1 0 5"/>',
  bus: '<rect x="5" y="3.5" width="14" height="14" rx="2.5"/><path d="M5 11h14M8 20.5v-3M16 20.5v-3"/><circle cx="8.5" cy="14.2" r=".8"/><circle cx="15.5" cy="14.2" r=".8"/>',
  train: '<rect x="6" y="3.5" width="12" height="13" rx="3"/><path d="M6 10.5h12M8.5 20.5l2-4M15.5 20.5l-2-4"/>',
  plane:
    '<path d="M10.5 13.5 3.5 11l1.5-1.5 7 1 4-4.5c1-1 2.5-1.3 3-.8s.2 2-.8 3l-4.5 4 1 7L13.5 20.5 11 13.5"/>',
  bed: '<path d="M3.5 18.5v-11M3.5 14.5h17v4M20.5 14.5V12a2.5 2.5 0 0 0-2.5-2.5h-7.5v5"/><circle cx="7" cy="11.5" r="1.8"/>',
  accessibility: '<circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5 12 10l7-1.5M12 10v4.5l-3 6M12 14.5l3 6"/>',
  shield: '<path d="M12 3.5 19.5 6v5.5c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
};

export function Icon({ name, size = 24, className = '', label }: Props) {
  const body = paths[name] ?? paths.sparkle;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
