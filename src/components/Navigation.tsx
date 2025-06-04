import { Link, useLocation } from "react-router-dom";
import { Home, Settings, List, Joystick } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/assets/logo.png";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Hjem", icon: Home },
    { path: "/game", label: "Spill", icon: Joystick },
    { path: "/leaderboard", label: "Toppliste", icon: List },
    { path: "/settings", label: "Innstillinger", icon: Settings },
  ];

  const formatLabel = (label: string) => {
    if (document.documentElement.clientWidth < 768) {
      return label.length > 5 ? label.slice(0, 5) + "." : label;
    }
    return label;
  };

  return (
    <nav
      className="
        container mx-auto px-4
        bg-gray-700/20 backdrop-blur-md border-t
        fixed bottom-0 left-0 right-0 z-50
        md:sticky md:top-5 md:rounded-lg md:border-b md:border-t-0
        
      "
    >
      <div className="container mx-auto px-4">
        <div className="flex md:items-center md:justify-between h-16">
          <Link
            to="/"
            className="hidden md:block text-xl font-bold text-primary font-mono tracking-wider"
          >
            <img src={Logo} alt="Sigurd Startup" width={150} />
          </Link>
          <div className="flex justify-between w-full md:justify-end md:space-x-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center px-2 py-2 md:rounded-md text-xs font-medium font-mono tracking-wide transition-all duration-200 md:flex-row md:space-x-2 md:text-sm",
                  location.pathname === path
                    ? "md:bg-primary md:text-primary-foreground md:border md:border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                )}
              >
                {Icon && <Icon className="w-5 h-5 mb-1 md:mb-0" />}
                <span>{formatLabel(label)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
