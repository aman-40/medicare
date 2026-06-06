import { Link } from "react-router";
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--healthcare-blue)] to-[var(--healthcare-teal)] flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">New Manoj Medical Hall</span>
                <span className="text-xs text-muted-foreground -mt-1">Pharmacy & Optical</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your trusted healthcare partner for medicines, eye checkups, and premium eyewear.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-[var(--healthcare-blue)] text-white flex items-center justify-center hover:bg-[var(--healthcare-cyan)] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[var(--healthcare-blue)] text-white flex items-center justify-center hover:bg-[var(--healthcare-cyan)] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[var(--healthcare-blue)] text-white flex items-center justify-center hover:bg-[var(--healthcare-cyan)] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[var(--healthcare-blue)] text-white flex items-center justify-center hover:bg-[var(--healthcare-cyan)] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>



          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Prescription Medicines</li>
              <li className="text-muted-foreground">Eye Examinations</li>
              <li className="text-muted-foreground">Contact Lenses</li>
              <li className="text-muted-foreground">Premium Eyeglasses</li>
              <li className="text-muted-foreground">Digital Prescriptions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--healthcare-blue)]" />
                <span>Makhdumpur Dih, Makhdumpur, Jehanabad, Bihar 804422</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0 text-[var(--healthcare-blue)]" />
                <span>+91 8340508210</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0 text-[var(--healthcare-blue)]" />
                <span>support@newmanojmedical.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0 text-[var(--healthcare-blue)]" />
                <span>Daily: 6 AM - 8 PM</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0 text-[var(--healthcare-blue)]" />
                <span>Eye Doctor: Sundays 10 AM - 4 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2026 New Manoj Medical Hall. All rights reserved.</p>
          <p>
            Engineered with ❤️ by <a href="https://aman-40.github.io/pro/" target="_blank" rel="noopener noreferrer" className="text-[var(--healthcare-blue)] hover:underline font-semibold">Aman</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
