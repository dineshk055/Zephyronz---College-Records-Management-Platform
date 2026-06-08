import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Navbar />
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}

export default App;