import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <Navbar />
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;