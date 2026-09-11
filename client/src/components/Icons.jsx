// Inline stroke icons, sized by the `size` prop. Kept inline rather than
// pulling in an icon package for six shapes.

const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
});

export const SearchIcon = ({ size = 20 }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5L21 21" />
  </svg>
);

export const UserIcon = ({ size = 20 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
  </svg>
);

export const BagIcon = ({ size = 20 }) => (
  <svg {...base(size)}>
    <path d="M4 7h16l-1.4 13H5.4L4 7z" />
    <path d="M8.5 7V5.5a3.5 3.5 0 017 0V7" />
  </svg>
);

export const MenuIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const CloseIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const LockIcon = ({ size = 16 }) => (
  <svg {...base(size)}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 018 0v3" />
  </svg>
);

export const ShieldIcon = ({ size = 28 }) => (
  <svg {...base(size)}>
    <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const TruckIcon = ({ size = 28 }) => (
  <svg {...base(size)}>
    <rect x="2" y="7" width="13" height="10" rx="1" />
    <path d="M15 10h4l3 3v4h-7z" />
    <circle cx="6.5" cy="18.5" r="1.8" />
    <circle cx="17.5" cy="18.5" r="1.8" />
  </svg>
);

export const ReturnIcon = ({ size = 28 }) => (
  <svg {...base(size)}>
    <path d="M3 12a9 9 0 103-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);

export const CheckIcon = ({ size = 28 }) => (
  <svg {...base(size)} strokeWidth={1.6}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
