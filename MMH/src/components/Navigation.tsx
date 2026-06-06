import { Link } from "react-router";
import { Button } from "./ui/button";
import { Menu, X, Phone, Clock } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--healthcare-blue)] to-[var(--healthcare-teal)] flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">VisionCare</span>
              <span className="text-xs text-muted-foreground -mt-1">Pharmacy & Optical</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Home
              </Button>
            </Link>
            <Link to="/medicines">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Medicines
              </Button>
            </Link>
            <Link to="/appointments">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Eye Checkup
              </Button>
            </Link>
            <Link to="/optical-store">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Optical Store
              </Button>
            </Link>
            <Link to="/patient-dashboard">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                My Account
              </Button>
            </Link>
          </div>

          {/* Contact Info & Auth */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-r border-border pr-4">
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>+1 234 567 8900</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>9 AM - 9 PM</span>
              </div>
            </div>
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-[var(--healthcare-blue)] hover:bg-[var(--healthcare-cyan)]">
                Register
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Home
                </Button>
              </Link>
              <Link to="/medicines" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Medicines
                </Button>
              </Link>
              <Link to="/appointments" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Eye Checkup
                </Button>
              </Link>
              <Link to="/optical-store" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Optical Store
                </Button>
              </Link>
              <Link to="/patient-dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  My Account
                </Button>
              </Link>
              <div className="border-t border-border pt-2 mt-2 flex gap-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[var(--healthcare-blue)]">
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
