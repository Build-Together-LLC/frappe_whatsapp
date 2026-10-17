import type { SVGProps } from 'react';
const SvgCloseArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} {...props}>
    <path
      fill="currentColor"
      d="m12 4 1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"
    />
  </svg>
);
export default SvgCloseArrow;
