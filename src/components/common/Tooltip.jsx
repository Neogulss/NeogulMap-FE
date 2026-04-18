import { useState, useRef } from "react";

function Tooltip({ text }) {
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);

  const handleClick = () => {
    if (pos) {
      setPos(null);
      return;
    }
    const r = btnRef.current.getBoundingClientRect();
    const maxW = 300;
    const margin = 12;
    let left = r.left + r.width / 2;
    let transformX = "-50%";

    if (left - maxW / 2 < margin) {
      left = Math.max(margin, r.left);
      transformX = "0%";
    } else if (left + maxW / 2 > window.innerWidth - margin) {
      left = Math.min(window.innerWidth - margin, r.right);
      transformX = "-100%";
    }

    setPos({ top: r.top - 8, left, transformX });
  };

  return (
    <span className="tooltip-wrap">
      <button
        ref={btnRef}
        className="tooltip-btn"
        onClick={handleClick}
        onBlur={() => setPos(null)}
        type="button"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 10a3.001 3.001 0 01-2 2.83V13a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {pos && (
        <div
          className="tooltip-popup"
          style={{
            top: pos.top,
            left: pos.left,
            transform: `translate(${pos.transformX}, -100%)`,
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
}

export default Tooltip;