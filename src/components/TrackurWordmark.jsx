export default function TrackurWordmark({ size = 'sm' }) {
  const textSize = size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center gap-2">
      <img className="w-10" src="/Trackur Logo.svg" width="40" height="40" alt="Trackur logo" />
    <span
      className={`${textSize} font-semibold text-zinc-950 tracking-tight dark:text-white`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      trackur.app
    </span>
    </div>
  );
}
