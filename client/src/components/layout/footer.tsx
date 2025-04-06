import { Link } from "wouter";
import { Heart, Code, Github } from "lucide-react";
import primaryLogo from '@/assets/primary-logo.png';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img src={primaryLogo} alt="Efectivio" className="h-6" />
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Efectivio. Todos los derechos reservados.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center">
            <Link href="/terms" className="text-sm text-gray-600 hover:text-primary">
              Términos de servicio
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary">
              Política de privacidad
            </Link>
            <Link href="/help" className="text-sm text-gray-600 hover:text-primary">
              Centro de ayuda
            </Link>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>Hecho con</span>
              <Heart className="h-3 w-3 text-red-500" />
              <span>por Efectivio</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}