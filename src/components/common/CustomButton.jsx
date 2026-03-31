export default function CustomButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}) {
  const variantStyle = {
    primary: "bg-primary-3 hover:bg-primary-4 border-[0.125rem] rounded-md",
    white: "bg-neutral-1 border-neutral-2 hover:bg-green-light hover:border-primary-3 border-[0.125rem] rounded-md",
    yellow: "bg-yellow-1 border-yellow-2 border-[0.125rem] hover:bg-yellow-2 hover:bg-yellow-2 rounded-[1.25rem]",
    red: "bg-red-1 border-red-2 border-[0.125rem] hover:bg-red-2 hover:bg-red-2 rounded-[1.25rem]",
    green: "bg-green-light border-primary-2 border-[0.125rem] hover:bg-primary-2 rounded-[1.25rem]",
    pin: "bg-primary-2 border-white border-[0.125rem] text-white rounded-full hover:bg-primary-4 p-12",
  };

  return (
    <button
      className={`flex items-center justify-center
      ${variantStyle[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}