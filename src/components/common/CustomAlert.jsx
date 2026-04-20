import { useEffect } from "react";
import { useAlertStore } from "../../stores/useAlertStore";
import { PiWarningCircleBold } from "react-icons/pi";
import { PiCheckCircleBold } from "react-icons/pi";
import { PiXCircleBold } from "react-icons/pi";
import { PiInfoBold } from "react-icons/pi";

export default function CustomAlert({ alert }) {
  const removeAlert = useAlertStore((s) => s.removeAlert);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeAlert(alert.id);
    }, alert.duration);

    return () => clearTimeout(timer); 
  }, [alert, removeAlert]);

  const getStyle = () => {
    switch (alert.type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-amber-50 text-amber-300";
      default:
        return "bg-blue-500";
    }
  };

  const getIcon = () => {
  const common = "w-10 h-10"; // 👈 여기서 한 번에 관리

  switch (alert.type) {
    case "success":
      return <PiCheckCircleBold className={common} />;
    case "error":
      return <PiXCircleBold className={common} />;
    case "warning":
      return <PiWarningCircleBold className={common} />;
    default:
      return <PiInfoBold className={common} />;
  }
};

  return (
    <div
      className={`relative min-w-30 min-h-25  rounded-md shadow-lg  ${getStyle()} flex justify-between items-center`}
    >
    <button className="absolute top-2 right-2 bg-transparent!" onClick={() => removeAlert(alert.id)}>✕</button>
  
  <div className="flex flex-col items-center justify-center">
        {getIcon()}
          <span className="py-2! mx-4!">{alert.message}</span>
  </div>
    
    
    </div>
  );
}