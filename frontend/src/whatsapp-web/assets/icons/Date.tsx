import type { SVGProps } from 'react';
const SvgDate = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={11}
    fill="none"
    {...props}
  >
    <path stroke="#64748B" strokeLinecap="round" d="M1 1h13M1 4h10M1 7h8" />
    <path
      stroke="#64748B"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14 4v6M17 7l-3 3-3-3"
    />
  </svg>
);
export default SvgDate;
