import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart2,
  BrainCircuit,
  CheckCircle2,
  Clock,
  FileText,
  Menu,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold">
              <span className="text-[#062644]">Efectiv</span>
              <span className="text-[#39FFBD]">io</span>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <a href="#caracteristicas" className="text-sm font-medium hover:text-[#39FFBD] transition-colors">
              Características
            </a>
            <a href="#portal-cliente" className="text-sm font-medium hover:text-[#39FFBD] transition-colors">
              Portal de Cliente
            </a>
            <a href="#testimonios" className="text-sm font-medium hover:text-[#39FFBD] transition-colors">
              Testimonios
            </a>
            <a href="#precios" className="text-sm font-medium hover:text-[#39FFBD] transition-colors">
              Precios
            </a>
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/sign-in">
              <Button variant="ghost" className="text-sm font-medium hover:text-[#39FFBD]">
                Dashboard
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-[#39FFBD] hover:bg-[#39FFBD]/90 text-[#062644]">Registrarse</Button>
            </Link>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold">
                  <span className="text-[#062644]">Efectiv</span>
                  <span className="text-[#39FFBD]">io</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
                <span className="sr-only">Cerrar menú</span>
              </Button>
            </div>
            <nav className="container grid gap-6 py-8">
              <a
                href="#caracteristicas"
                className="flex items-center justify-center px-4 py-2 text-lg font-medium hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Características
              </a>
              <a
                href="#portal-cliente"
                className="flex items-center justify-center px-4 py-2 text-lg font-medium hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Portal de Cliente
              </a>
              <a
                href="#testimonios"
                className="flex items-center justify-center px-4 py-2 text-lg font-medium hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonios
              </a>
              <a
                href="#precios"
                className="flex items-center justify-center px-4 py-2 text-lg font-medium hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Precios
              </a>
              <div className="flex flex-col gap-2 mt-4">
                <Link href="/auth/sign-up">
                  <Button className="w-full bg-[#39FFBD] hover:bg-[#39FFBD]/90 text-[#062644]">Registrarse</Button>
                </Link>
                <Link href="/auth/sign-in">
                  <Button variant="outline" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#062644] to-[#071C2B] text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Simplifica tu contabilidad con <span className="text-[#39FFBD]">Efectivio</span>
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Plataforma contable integral potenciada por IA que automatiza la gestión financiera
                de tu empresa, ahorrándote tiempo y recursos.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
                  <BrainCircuit className="h-5 w-5 text-[#39FFBD] mr-2" />
                  <span>Inteligencia Artificial</span>
                </div>
                <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
                  <Zap className="h-5 w-5 text-[#39FFBD] mr-2" />
                  <span>Automatización</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/sign-up">
                  <Button className="bg-[#39FFBD] hover:bg-[#39FFBD]/90 text-[#062644] font-medium px-6 py-2">
                    Prueba Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Solicitar Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#39FFBD]/20 to-transparent rounded-2xl blur-xl -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Dashboard Preview"
                className="rounded-lg shadow-lg border border-white/10 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#062644]">
              Potencia tu gestión financiera con IA
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma combina inteligencia artificial y automatización para ofrecerte una experiencia
              contable sin precedentes, reduciendo errores y maximizando la eficiencia.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart2,
                title: "Gestión Integral",
                description:
                  "Controla clientes, facturación, gastos, inventario y más en un solo sistema."
              },
              {
                icon: BarChart2,
                title: "Reportes y Análisis",
                description:
                  "Accede a dashboards interactivos y reportes en tiempo real para tomar decisiones informadas."
              },
              {
                icon: Zap,
                title: "Automatización",
                description:
                  "Elimina tareas repetitivas y reduce errores humanos con flujos de trabajo inteligentes."
              },
              {
                icon: BrainCircuit,
                title: "Inteligencia Artificial",
                description:
                  "Predice flujos de caja y recibe recomendaciones personalizadas para optimizar tus finanzas."
              },
              {
                icon: ShieldCheck,
                title: "Seguridad Avanzada",
                description:
                  "Protege tus datos financieros con encriptación de nivel bancario y autenticación segura."
              },
              {
                icon: FileText,
                title: "Documentación Digital",
                description:
                  "Digitaliza facturas y documentos contables con reconocimiento inteligente de texto."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="rounded-full bg-[#39FFBD]/10 p-3 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-[#062644]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#062644]">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/auth/sign-up">
              <Button className="bg-[#39FFBD] hover:bg-[#39FFBD]/90 text-[#062644] px-6 py-2">
                Comenzar ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-[#062644] to-[#071C2B] text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                ¿Listo para transformar la contabilidad de tu empresa?
              </h2>
              <p className="text-gray-300 mb-8">
                Únete a miles de empresas que ya confían en Efectivio para su gestión contable diaria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/sign-up">
                  <Button className="bg-[#39FFBD] hover:bg-[#39FFBD]/90 text-[#062644]">
                    Comenzar prueba gratuita
                  </Button>
                </Link>
                <Link href="/auth/sign-in">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 border border-white/10 bg-white/5 p-4 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-[#39FFBD]" />
                <div>
                  <h3 className="font-medium">Configuración sencilla</h3>
                  <p className="text-sm text-gray-300">Comienza a usar el sistema en minutos, no semanas.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 border border-white/10 bg-white/5 p-4 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-[#39FFBD]" />
                <div>
                  <h3 className="font-medium">Soporte personalizado</h3>
                  <p className="text-sm text-gray-300">Un equipo dedicado para ayudarte en cada paso.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 border border-white/10 bg-white/5 p-4 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-[#39FFBD]" />
                <div>
                  <h3 className="font-medium">Actualizaciones constantes</h3>
                  <p className="text-sm text-gray-300">Nuevas funciones y mejoras cada mes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Efectivio</h3>
              <p className="text-gray-600 text-sm">
                Simplificando la contabilidad de empresas en toda Latinoamérica desde 2024.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#caracteristicas" className="text-gray-600 hover:text-[#39FFBD] transition-colors">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#precios" className="text-gray-600 hover:text-[#39FFBD] transition-colors">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#testimonios" className="text-gray-600 hover:text-[#39FFBD] transition-colors">
                    Testimonios
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#39FFBD] transition-colors">
                    Sobre nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#39FFBD] transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#39FFBD] transition-colors">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#39FFBD] transition-colors">
                    Términos
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-gray-600 text-sm">
            <p>© 2024 Efectivio. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}