const SRC = {
  gdrive: '/Google_Drive_icon_(2020).svg',
  trackur: '/Trackur Logo.svg',
};

export default function ResumeSourceIcon({ source = 'trackur', className = 'size-4 shrink-0' }) {
  return <img src={SRC[source] || SRC.trackur} alt="" aria-hidden="true" className={className} />;
}
