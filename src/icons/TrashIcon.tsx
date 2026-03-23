import React from "react";

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 7H18V19C18 20.1046 17.1046 21 16 21H8C6.89543 21 6 20.1046 6 19V7Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 7H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 11V16"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 11L9 16"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 11L15 16"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default TrashIcon;