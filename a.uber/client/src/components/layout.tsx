import { Link, useLocation } from "wouter";
import { useApp } from "@/lib/context";
import { Moon, Sun, LogOut, User, Shield, Car, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useApp();
  const [location, setLocation] = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl tracking-tight group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Transporte Inteligente
              </span>
              <span className="sm:hidden font-bold text-primary">Transporte</span>
            </a>
          </Link>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-primary/10">
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            {currentUser ? (
              <>
                <div className="hidden md:flex items-center gap-4 ml-4">
                  <div className="text-sm text-right">
                    <p className="font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>

                <div className="md:hidden ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="font-bold">
                        {currentUser.name} ({currentUser.role})
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="rounded-full">Entrar</Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" className="rounded-full shadow-md shadow-primary/20">Cadastrar</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
