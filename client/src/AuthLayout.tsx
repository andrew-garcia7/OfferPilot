import { Outlet, Link } from "react-router-dom";
import AuthBrandLogo from "./components/auth/AuthBrandLogo";
import ThemeToggle from "./components/common/ThemeToggle";

export default function AuthLayout() {
  return (
    <div className="op-auth-layout flex min-h-screen flex-col transition-colors duration-500">
      <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b px-6 transition-colors duration-500 border-zinc-200/80 bg-white/75 backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(6,8,18,0.66)]">
        <Link to="/" className="group inline-flex">
          <AuthBrandLogo size={32} idPrefix="authNav" />
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium text-zinc-500 transition-colors duration-500 sm:inline dark:text-white/50">
            Secure Authentication
          </span>
          <ThemeToggle variant="auth" />
        </div>
      </nav>

      <div className="flex-1 pt-16">
        <Outlet />
      </div>
    </div>
  );
}
