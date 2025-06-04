import { Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";



const Layout = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div className="max-w-6xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
      <Navigation />
      <Outlet />
    </div>
  </div>
);

export default Layout;
