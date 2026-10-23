export function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="10" cy="6" r="3.5" fill="currentColor" />
      <path
        d="M2.5 18C2.5 13.8579 5.85786 10.5 10 10.5C14.1421 10.5 17.5 13.8579 17.5 18H2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
