import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import CursorEffect from "./components/CursorEffect";
export default function Layout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text)" }}>
      <CursorEffect />
      <Navbar />
      <div>
        <Outlet />
      </div>
    </div>
  );
}
