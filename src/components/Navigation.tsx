
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, List, Joystick } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Hjem', icon: Home },
    { path: '/game', label: 'Spill', icon: Joystick },
    { path: '/leaderboard', label: 'Toppliste', icon: List },
    { path: '/settings', label: 'Innstillinger', icon: Settings },
  ];

  return (
    <nav className="container mx-auto mt-4 rounded-lg bg-gray-700/20 backdrop-blur-md border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary font-mono tracking-wider">
            SIGURD STARTUP
          </Link>
          <div className="flex space-x-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium font-mono tracking-wide transition-all duration-200",
                  location.pathname === path
                    ? "bg-primary text-primary-foreground border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
