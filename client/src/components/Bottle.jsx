// The catalogue has no photography, so every product renders this drawn
// bottle. The cap colour is derived from the product name, which gives each
// item a stable, distinct look without any image assets.

const CAP_COLOURS = ['#D8B45A', '#B07A4A', '#7E8C6A', '#D9A0A8', '#8C7AA6', '#6E9BA8'];

export function bottleTint(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % CAP_COLOURS.length;
  }
  return CAP_COLOURS[hash];
}

export function Bottle({ seed = '', size = 120, muted = false }) {
  const tint = muted ? '#6E6353' : bottleTint(seed);

  return (
    <svg
      width={size}
      height={size * 1.33}
      viewBox="0 0 120 160"
      role="presentation"
      aria-hidden="true"
      style={muted ? { opacity: 0.45 } : undefined}
    >
      <ellipse cx="60" cy="150" rx="38" ry="4" fill="#100E0C" opacity="0.45" />
      <rect x="48" y="10" width="24" height="24" rx="3" fill={muted ? '#6E6353' : '#C9973F'} />
      <rect x="52" y="34" width="16" height="14" fill="#E4D9C6" />
      <rect x="26" y="46" width="68" height="100" rx="5" fill="#FBF8F3" stroke="#D8CCB8" />
      <path d="M26 96h68v45a5 5 0 01-5 5H31a5 5 0 01-5-5V96z" fill={tint} opacity="0.58" />
      <rect x="42" y="102" width="36" height="26" fill="#fff" opacity="0.92" />
      <rect x="47" y="110" width="26" height="2" fill="#C9973F" />
      <rect x="51" y="116" width="18" height="1.5" fill="#B6AA98" />
    </svg>
  );
}
