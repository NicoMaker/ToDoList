// Icone SVG dell'app: piccole, senza dipendenze esterne.

export const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconEdit = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width="16"
    height="16"
    aria-hidden="true"
  >
    <path
      d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconTrash = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width="16"
    height="16"
    aria-hidden="true"
  >
    <path
      d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconSearch = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width="17"
    height="17"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path
      d="M21 21l-4.3-4.3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const IconPlus = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width="18"
    height="18"
    aria-hidden="true"
  >
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const IconPin = ({ width = 14, height = 14 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={width}
    height={height}
    aria-hidden="true"
  >
    <path
      d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const IconCalendar = ({ width = 16, height = 16 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={width}
    height={height}
    aria-hidden="true"
  >
    <rect
      x="3.5"
      y="5"
      width="17"
      height="16"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M3.5 9.5h17M8 3v4M16 3v4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true">
    <path
      d="M15 6l-6 6 6 6"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true">
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
