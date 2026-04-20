import {useAlertStore} from "../../stores/useAlertStore";
import CustomAlert from "./CustomAlert";

export default function AlertContainer() {
  const alerts = useAlertStore((s) => s.alerts);

  return (
    <div className="fixed z-50 flex flex-col gap-2 -translate-x-1/2 top-[70px] left-1/2 ">
      {alerts.map((alert) => (
        <CustomAlert key={alert.id} alert={alert} />
      ))}
    </div>
  );
}