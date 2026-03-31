import React from 'react'

export default function CustomInput({
  children,
  variant = "white",
  className = "",
  ...rest
}) {
  const variantStyle = {
    white: "bg-neutral-1 border-neutral-2 border-[0.125rem] focus:outline-none focus:ring-2 focus:ring-primary-2 focus:border-transparent",
  };

  return (
    <input
      className={`rounded-[20px] flex items-center justify-center px-5 py-2.5
      ${variantStyle[variant]} ${className}`}
      {...rest}
    >
      {children}
    </input>
  );
}
