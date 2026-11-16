import type { ReactNode } from "react";

// Íconos SVG inline (trazo de 1.5px, color = currentColor).
// Para agregar uno nuevo, sumalo a este objeto con el contenido del <svg> (viewBox 0 0 24 24).
const ICON_SHAPES = {
  "gift": <>
    <path d="M4 11v4c0 3.3 0 4.95 1.025 5.975S7.7 22 11 22h2c3.3 0 4.95 0 5.975-1.025S20 18.3 20 15v-4" />
    <path d="M3 9c0-.748 0-1.122.201-1.4a1.4 1.4 0 0 1 .549-.44C4.098 7 4.565 7 5.5 7h13c.935 0 1.402 0 1.75.16.228.106.417.258.549.44C21 7.878 21 8.252 21 9s0 1.121-.201 1.4a1.4 1.4 0 0 1-.549.44c-.348.16-.815.16-1.75.16h-13c-.935 0-1.402 0-1.75-.16a1.4 1.4 0 0 1-.549-.44C3 10.121 3 9.748 3 9Zm3-5.214C6 2.799 6.8 2 7.786 2h.357A3.857 3.857 0 0 1 12 5.857V7H9.214A3.214 3.214 0 0 1 6 3.786Zm12 0C18 2.799 17.2 2 16.214 2h-.357A3.857 3.857 0 0 0 12 5.857V7h2.786A3.214 3.214 0 0 0 18 3.786Z" />
    <path d="M12 11v11" />
  </>,
  "tick-02": <path d="m5 14 3.5 3.5L19 6.5" />,
  "cancel-01": <path d="m18 6-12 12m12 0L6 6" />,
  "arrow-right-02": <path d="M18.5 12H5m8 6s6-4.419 6-6-6-6-6-6" />,
  "arrow-left-02": <path d="M5.5 12H19m-8 6s-6-4.419-6-6 6-6 6-6" />,
  "arrow-down-01": <path d="M18 9s-4.419 6-6 6-6-6-6-6" />,
  "filter-horizontal": <>
    <path d="M3 7h3M3 17h6m9 0h3M15 7h6" />
    <rect x="6" y="4" width="6" height="6" rx="2" />
    <rect x="12" y="14" width="6" height="6" rx="2" />
  </>,
  "search-01": <><circle cx="10" cy="10" r="7" /><path d="m15 15 6 6" /></>,
  "calendar-03": <><path d="M16 2v4M8 2v4M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="4" /></>,
  "mail-01": <><rect x="2" y="4" width="20" height="16" rx="4" /><path d="m3 6 7.9 6a2 2 0 0 0 2.2 0L21 6" /></>,
  "smile": <><circle cx="12" cy="12" r="10" /><path d="M8 15a5 5 0 0 0 8 0m-8-5h.01M16 10h.01" /></>,
  "help-circle": <><circle cx="12" cy="12" r="10" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.9 2c-.7.5-1.4 1.1-1.4 2m.1 3.2h.01" /></>,
  "menu-01": <path d="M4 5h16M4 12h16M4 19h16" />,
  "add-01": <path d="M12 5v14m7-7H5" />,
  "minus-sign": <path d="M20 12H4" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICON_SHAPES;

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICON_SHAPES[name]}
    </svg>
  );
}
