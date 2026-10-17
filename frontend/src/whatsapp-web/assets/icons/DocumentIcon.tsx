import type { SVGProps } from 'react';
const SvgDocumentIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={20}
    fill="none"
    viewBox="0 0 16 20"
    {...props}
  >
    <path
      fill="#7f66ff"
      fillRule="evenodd"
      d="M2 0C.9 0 .01.9.01 2L0 18c0 1.1.89 2 1.99 2H14c1.1 0 2-.9 2-2V6.83c0-.53-.21-1.04-.59-1.41L10.58.59C10.21.21 9.7 0 9.17 0H2Zm7 6V1.5L14.5 7H10c-.55 0-1-.45-1-1Zm-5 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H4Zm6 5a1 1 0 0 0-1-1H4a1 1 0 1 0 0 2h5a1 1 0 0 0 1-1Z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgDocumentIcon;
