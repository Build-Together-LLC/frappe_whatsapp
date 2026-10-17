import type { SVGProps } from 'react';

const SvgChatSendIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} {...props}>
    <path
      fill={props.fill || '#54656f'}
      d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"
    />
  </svg>
);
export default SvgChatSendIcon;
