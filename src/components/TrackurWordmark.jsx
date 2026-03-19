export default function TrackurWordmark({ size = 'sm' }) {
  const textSize = size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <span
      className={`${textSize} font-semibold text-zinc-950 tracking-tight dark:text-white`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      trackur.app
    </span>
  );
}
