import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart2,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Facebook,
  FileText,
  Instagram,
  Linkedin,
  Menu,
  ShieldCheck,
  Twitter,
  X,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="./images/primary-logo.png" alt="Efectivio Logo" className="h-10" />
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="text-foreground">
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
              <Button className="bg-[#39FFBD] hover:bg-[#39FFBD]/90 text-[#062644] text-sm font-medium">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="./images/primary-logo.png" alt="Efectivio Logo" className="h-8" />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-foreground">
                <X className="h-6 w-6" />
                <span className="sr-only">Cerrar menú</span>
              </Button>
            </div>
            <nav className="container grid gap-6 py-8">
              <a
                href="#caracteristicas"
                className="flex items-center justify-center rounded-md px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Características
              </a>
              <a
                href="#portal-cliente"
                className="flex items-center justify-center rounded-md px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Portal de Cliente
              </a>
              <a
                href="#testimonios"
                className="flex items-center justify-center rounded-md px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonios
              </a>
              <a
                href="#precios"
                className="flex items-center justify-center rounded-md px-4 py-2 text-lg font-medium hover:bg-accent"
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
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-[#062644] to-[#071C2B] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[#39FFBD]/10 blur-3xl"></div>
          <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#39FFBD]/5 blur-3xl"></div>

          {/* Animated elements */}
          <div
            className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-[#39FFBD]/30 animate-ping"
            style={{ animationDuration: "3s", animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/3 w-6 h-6 rounded-full bg-[#39FFBD]/20 animate-ping"
            style={{ animationDuration: "4s", animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-5 h-5 rounded-full bg-[#39FFBD]/40 animate-ping"
            style={{ animationDuration: "5s", animationDelay: "1.5s" }}
          ></div>
        </div>
        
        <div className="container max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="inline-flex items-center space-x-2 rounded-full bg-[#39FFBD]/10 px-3 py-1 text-sm text-[#39FFBD] mb-4 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FFBD] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FFBD]"></span>
                </span>
                <span>Software de Contabilidad #1 en Panamá</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-heading font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Simplifica tu Contabilidad con{" "}
                  <span className="text-[#39FFBD] relative">
                    Efectivio
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#39FFBD]/30"></span>
                  </span>
                </h1>
                <p className="max-w-[600px] text-gray-300 md:text-xl leading-relaxed">
                  Efectivio es una plataforma contable integral potenciada por IA que automatiza la gestión financiera
                  de tu empresa, ahorrándote tiempo y recursos mientras maximiza la precisión.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <BrainCircuit className="h-5 w-5 text-[#39FFBD]" />
                  <span className="text-sm">Inteligencia Artificial</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Zap className="h-5 w-5 text-[#39FFBD]" />
                  <span className="text-sm">Automatización Avanzada</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Clock className="h-5 w-5 text-[#39FFBD]" />
                  <span className="text-sm">Ahorro de Tiempo</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Link href="/auth/sign-up">
                  <Button className="bg-[#39FFBD] hover:bg-[#39FFBD]/90 text-[#062644] font-medium text-base px-6 py-6 h-auto group relative overflow-hidden">
                    <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></span>
                    <span className="relative">Prueba Gratis</span>
                    <ArrowRight className="ml-2 h-4 w-4 relative group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-medium text-base px-6 py-6 h-auto"
                >
                  Solicitar Demo
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm mt-4">
                <div className="flex items-center">
                  <CheckCircle2 className="mr-1 h-4 w-4 text-[#39FFBD]" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="mr-1 h-4 w-4 text-[#39FFBD]" />
                  <span>14 días de prueba</span>
                </div>
              </div>
            </div>
            <div className="relative lg:order-last mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#39FFBD]/20 to-transparent rounded-2xl blur-xl -z-10 transform rotate-3"></div>
              <div className="relative">
                <div
                  className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-[#39FFBD]/20 animate-bounce"
                  style={{ animationDuration: "3s" }}
                ></div>
                <div
                  className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full bg-[#39FFBD]/20 animate-bounce"
                  style={{ animationDuration: "4s", animationDelay: "1s" }}
                ></div>
                <img
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Dashboard Preview"
                  className="mx-auto rounded-2xl shadow-2xl border border-white/10 transform -rotate-1 transition-transform hover:rotate-0 duration-500 max-w-full h-auto"
                  width="550"
                  height="550"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-flex items-center rounded-full bg-[#39FFBD]/10 px-3 py-1 text-sm text-[#062644]">
              <span className="font-medium">Características Inteligentes</span>
            </div>
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-3xl font-heading font-bold tracking-tighter md:text-5xl text-[#062644]">
                Potencia tu gestión financiera con IA
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed">
                Nuestra plataforma combina inteligencia artificial y automatización para ofrecerte una experiencia
                contable sin precedentes, reduciendo errores y maximizando la eficiencia.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl items-center gap-8 py-12 md:grid-cols-3 lg:gap-16">
            {[
              {
                icon: BarChart2,
                title: "Gestión Integral",
                description:
                  "Controla clientes, facturación, gastos, inventario y más en un solo sistema. Nuestra plataforma centraliza todas tus operaciones financieras.",
              },
              {
                icon: BarChart2,
                title: "Reportes y Análisis",
                description:
                  "Accede a dashboards interactivos, gráficos y reportes en tiempo real para tomar decisiones informadas con datos precisos.",
              },
              {
                icon: Zap,
                title: "Integración y Automatización",
                description:
                  "Conecta con CRM, APIs, y automatiza procesos. Elimina tareas repetitivas y reduce errores humanos con flujos de trabajo inteligentes.",
              },
              {
                icon: BrainCircuit,
                title: "Inteligencia Artificial",
                description:
                  "Aprovecha el poder de la IA para predecir flujos de caja, detectar anomalías y recibir recomendaciones personalizadas para optimizar tus finanzas.",
              },
              {
                icon: ShieldCheck,
                title: "Seguridad Avanzada",
                description:
                  "Protege tus datos financieros con encriptación de nivel bancario, autenticación de dos factores y cumplimiento con normativas de seguridad.",
              },
              {
                icon: FileText,
                title: "Documentación Digital",
                description:
                  "Digitaliza y organiza automáticamente facturas, recibos y documentos contables con reconocimiento inteligente de texto (OCR).",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group flex flex-col items-center space-y-4 rounded-2xl border border-[#39FFBD]/20 bg-white p-8 shadow-lg transition-all hover:border-[#39FFBD]/50 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="rounded-full bg-gradient-to-br from-[#39FFBD]/20 to-[#39FFBD]/10 p-3 transition-colors group-hover:from-[#39FFBD]/30 group-hover:to-[#39FFBD]/20">
                  <feature.icon className="h-6 w-6 text-[#062644]" />
                </div>
                <h3 className="text-xl font-bold text-[#062644]">{feature.title}</h3>
                <p className="text-center text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-12">
            <Link href="/auth/sign-up">
              <Button className="bg-[#39FFBD] hover:bg-[#39FFBD]/90 text-[#062644] px-8 py-6 h-auto">
                Comenzar ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-[#062644] to-[#071C2B] text-white">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold tracking-tighter md:text-4xl/tight">
                ¿Listo para transformar la contabilidad de tu empresa?
              </h2>
              <p className="mt-4 text-gray-300 md:text-xl/relaxed max-w-[600px]">
                Únete a miles de empresas que ya confían en Efectivio para su gestión contable diaria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/auth/sign-up">
                  <Button className="bg-[#39FFBD] hover:bg-[#39FFBD]/90 text-[#062644] w-full sm:w-auto font-medium px-6 py-6 h-auto">
                    Comenzar prueba gratuita
                  </Button>
                </Link>
                <Link href="/auth/sign-in">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto font-medium px-6 py-6 h-auto">
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                <CheckCircle2 className="h-6 w-6 text-[#39FFBD]" />
                <div>
                  <h3 className="font-medium">Configuración sencilla</h3>
                  <p className="text-sm text-gray-300">Comienza a usar el sistema en minutos, no semanas.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                <CheckCircle2 className="h-6 w-6 text-[#39FFBD]" />
                <div>
                  <h3 className="font-medium">Soporte personalizado</h3>
                  <p className="text-sm text-gray-300">Un equipo dedicado para ayudarte en cada paso.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                <CheckCircle2 className="h-6 w-6 text-[#39FFBD]" />
                <div>
                  <h3 className="font-medium">Actualizaciones constantes</h3>
                  <p className="text-sm text-gray-300">Nuevas funciones y mejoras cada mes.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
                <CheckCircle2 className="h-6 w-6 text-[#39FFBD]" />
                <div>
                  <h3 className="font-medium">Confiabilidad</h3>
                  <p className="text-sm text-gray-300">Disponibilidad 24/7 y backups automáticos de tus datos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="flex flex-col col-span-2 lg:col-span-2">
              <img src="/images/dark-logo.png" alt="Efectivio Logo" className="h-10 mb-2" />
              <p className="text-muted-foreground mt-2 text-sm">
                Simplificando la contabilidad de empresas en toda Latinoamérica desde 2024.
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <a 
                  href="#" 
                  className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-medium mb-4">Producto</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#caracteristicas" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#precios" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#testimonios" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Testimonios
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Guías
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-medium mb-4">Empresa</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Sobre nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Empleo
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-medium mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Términos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Cookies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-[#39FFBD] transition-colors">
                    Licencias
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Efectivio. Todos los derechos reservados.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-xs text-muted-foreground">
                Hecho con 💚 en Panamá
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}