import React from "react";

export default function CustomCard({
  children,
  variant = "default",
  className = "",
  onClick,
  ...rest
}) {
  const variantStyle = {
    default: "bg-white border border-neutral-200",
    gray: "bg-neutral-100 border border-neutral-200",
    elevated: "bg-white shadow-md",
    outline: "bg-white border-2 border-neutral-300",
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-[1.25rem]
        p-5
        ${variantStyle[variant]}
        ${onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}