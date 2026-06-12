import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import ScreenshotGuard from "./components/ScreenshotGuard";

function App() {
  return (
    <>
      <ScreenshotGuard />
      <Navbar />
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}

export default App;