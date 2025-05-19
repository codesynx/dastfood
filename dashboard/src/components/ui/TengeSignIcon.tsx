import React from 'react';

interface TengeSignIconProps extends React.SVGProps<SVGSVGElement> {}

const TengeSignIcon: React.FC<TengeSignIconProps> = (props) => (
  <svg
    width="24" // Default width, can be overridden by props
    height="24" // Default height, can be overridden by props
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props} // Spread any additional props (like className)
  >
    <path
      d="M12 19V9M6 9H18M6 5H18"
      stroke="currentColor" // Use currentColor to inherit color from parent
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TengeSignIcon;
