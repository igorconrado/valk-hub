// Minimal stroke icon set — 16px default, 1.5 stroke
const Icon = ({ d, size = 16, stroke = 1.5, fill, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

const I = {
  dashboard: (p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>} />,
  projects: (p) => <Icon {...p} d={<><path d="M12 3 3 7.5l9 4.5 9-4.5L12 3z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/></>} />,
  tasks: (p) => <Icon {...p} d={<><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></>} />,
  docs: (p) => <Icon {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></>} />,
  meetings: (p) => <Icon {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>} />,
  reports: (p) => <Icon {...p} d={<><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 6-6"/></>} />,
  people: (p) => <Icon {...p} d={<><circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1"/><circle cx="17" cy="6" r="3"/><path d="M22 18v-1a4 4 0 0 0-4-4"/></>} />,
  settings: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} />,
  search: (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>} />,
  bell: (p) => <Icon {...p} d={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>} />,
  plus: (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  chevronR: (p) => <Icon {...p} d="m9 6 6 6-6 6" />,
  chevronD: (p) => <Icon {...p} d="m6 9 6 6 6-6" />,
  chevronL: (p) => <Icon {...p} d="m15 6-6 6 6 6" />,
  check: (p) => <Icon {...p} d="M5 12l5 5L20 7" />,
  x: (p) => <Icon {...p} d="M18 6 6 18M6 6l12 12" />,
  filter: (p) => <Icon {...p} d="M3 6h18M7 12h10M11 18h2" />,
  grid: (p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>} />,
  list: (p) => <Icon {...p} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  calendar: (p) => <Icon {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>} />,
  clock: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>} />,
  link: (p) => <Icon {...p} d={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>} />,
  sparkle: (p) => <Icon {...p} d={<><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></>} />,
  arrowR: (p) => <Icon {...p} d="M5 12h14M13 5l7 7-7 7" />,
  arrowUpRight: (p) => <Icon {...p} d="M7 17 17 7M7 7h10v10" />,
  more: (p) => <Icon {...p} d={<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>} />,
  edit: (p) => <Icon {...p} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />,
  trash: (p) => <Icon {...p} d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />,
  menu: (p) => <Icon {...p} d="M3 6h18M3 12h18M3 18h18" />,
  bold: (p) => <Icon {...p} d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />,
  italic: (p) => <Icon {...p} d="M19 4h-9M14 20H5M15 4 9 20" />,
  h1: (p) => <Icon {...p} d="M4 12h8M4 18V6M12 18V6M17 12l3-2v8" />,
  h2: (p) => <Icon {...p} d="M4 12h8M4 18V6M12 18V6M21 18h-4c0-4 4-3 4-6a2 2 0 0 0-4 0" />,
  code: (p) => <Icon {...p} d="m16 18 6-6-6-6M8 6l-6 6 6 6" />,
  quote: (p) => <Icon {...p} d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h2v1c0 1-.5 2-2 2zM14 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h2v1c0 1-.5 2-2 2z" />,
  phone: (p) => <Icon {...p} d={<><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></>} />,
  desktop: (p) => <Icon {...p} d={<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>} />,
  logout: (p) => <Icon {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  target: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>} />,
  history: (p) => <Icon {...p} d={<><path d="M3 3v5h5"/><path d="M3.05 13a9 9 0 1 0 .5-4.5L3 8"/><path d="M12 7v5l4 2"/></>} />,
  flame: (p) => <Icon {...p} d="M8.5 14.5A2.5 2.5 0 0 0 11 17a2.5 2.5 0 0 0 2.5-2.5c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  bolt: (p) => <Icon {...p} d="M13 2 3 14h9l-1 8 10-12h-9z" />,
};

window.I = I;
