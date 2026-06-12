import { useEffect } from "react"
import AOS from "aos";
import "aos/dist/aos.css";
import AppRoutes from "./routes/AppRoutes";
import { DateRangeProvider, ToastProvider } from "./shared/ui";
import { AuthProvider } from "./shared/auth/AuthProvider";
import { NotificationsRealtimeBridge } from "./features/notifications/components/NotificationsRealtimeBridge";

function App() {
  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationsRealtimeBridge />
        <DateRangeProvider>
          <AppRoutes />
        </DateRangeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App
