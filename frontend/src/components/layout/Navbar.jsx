import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils.js";
import { Home, Mic, History, Settings, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/practice", label: "Practice", icon: Mic },
  { path: "/history", label: "History", icon: History },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <Mic className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground hidden sm:block">
            SpeakUp
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {isAuthenticated && navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                location.pathname === path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="container py-4 space-y-1">
            {isAuthenticated && navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            {isAuthenticated && user && (
              <>
                <div className="px-4 py-3 border-t border-border mt-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Log out
                </button>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 px-4">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

