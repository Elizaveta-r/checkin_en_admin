import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { Toaster } from "sonner";
import { ScrollToTop } from "./components/ScrollToTop";
import { store } from "./store/store";
import AppRoutes from "./routes/AppRoutes";
import "driver.js/dist/driver.css";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-center" />
        <ScrollToTop />

        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
