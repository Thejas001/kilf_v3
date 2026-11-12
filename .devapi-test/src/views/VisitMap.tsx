/** A venue's Google Maps embed, loaded lazily as it nears the viewport. */
export function VisitMap({ embed, title }: { embed: string; title: string }) {
  return (
    <div className="relative aspect-[4/3] bg-sky">
      <iframe src={embed} title={title} loading="lazy" className="absolute inset-0 h-full w-full border-0" referrerPolicy="no-referrer-when-downgrade" />
    </div>
  );
}
