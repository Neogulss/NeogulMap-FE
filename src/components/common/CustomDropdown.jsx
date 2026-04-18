import React, { useState, useRef, useEffect } from "react";

export default function CustomDropdown({
  options = [],
  placeholder = "선택",
  variant = "white",
  className = "",
  onChange,
  ...rest
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const dropdownRef = useRef(null);

  const variantStyle = {
    white:
      "bg-white border-neutral-2 border-[0.125rem] hover:bg-blue-light hover:border-primary-3 rounded-[1.25rem]",
  };

  const handleSelect = (option) => {
    setSelected(option);
    setOpen(false);
    onChange && onChange(option);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`} {...rest}>
      <div
        onClick={() => setOpen(!open)}
        className={`
          px-4 py-3
          flex items-center justify-between
          cursor-pointer
          ${variantStyle[variant]}
        `}
      >
        <span>{selected || placeholder}</span>
        <span
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </div>
      {open && (
        <div className="absolute left-0 mt-2 w-full shadow-md z-10 bg-white border-neutral-2 border-[0.125rem] rounded-[1.25rem] p-1">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)}
              className="
          px-4 py-3 cursor-pointer
          hover:bg-blue-light
          rounded-xl
          transition-colors duration-150
        "
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
