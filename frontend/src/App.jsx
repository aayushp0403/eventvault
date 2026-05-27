import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppShell   from "./components/layout/AppShell";
import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Dashboard  from "./pages/Dashboard";
import Events     from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Upload     from "./pages/Upload";
import AISearch   from "./pages/AISearch";
import Notifications from "./pages/Notifications";

function Guard({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#13131f", color: "#e8e8f0", border: "1px solid rgba(200,255,0,0.2)" },
          }}
        />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Guard><AppShell /></Guard>}>
            <Route index                      element={<Dashboard />} />
            <Route path="events"              element={<Events />} />
            <Route path="events/:id"          element={<EventDetail />} />
            <Route path="upload"              element={<Upload />} />
            <Route path="ai-search"           element={<AISearch />} />
            <Route path="notifications"       element={<Notifications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}