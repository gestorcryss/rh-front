import React from "react";

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
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
        d="M16.2929 2.29289C16.6834 1.90237 17.3166 1.90237 17.7071 2.29289L21.7071 6.29289C22.0976 6.68342 22.0976 7.31658 21.7071 7.70711L7.70711 21.7071C7.51957 21.8946 7.26522 22 7 22H3C2.44772 22 2 21.5523 2 21V17C2 16.7348 2.10536 16.4804 2.29289 16.2929L16.2929 2.29289ZM16 5.41421L18.5858 8L20 6.58579L17.4142 4L16 5.41421ZM17.4142 9L15 6.58579L4 17.5858V20H6.41421L17.4142 9Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default PencilIcon;