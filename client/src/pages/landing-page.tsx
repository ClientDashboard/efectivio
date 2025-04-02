import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CircleDollarSign,
  FileText,
  BarChart4,
  Menu,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800 antialiased">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-auto text-primary-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">Efectivio</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-10 items-center">
              <a href="#features" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Características
              </a>
              <a href="#pricing" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Precios
              </a>
              <a href="#testimonials" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Testimonios
              </a>
              <a href="#contact" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Contacto
              </a>
            </nav>
            <div className="flex items-center">
              <Link href="/auth/sign-in">
                <Button className="hidden md:inline-flex ml-8 whitespace-nowrap">
                  Iniciar sesión
                </Button>
              </Link>
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on mobile menu state */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <a href="#features" className="block pl-3 pr-4 py-2 border-l-4 border-primary-500 text-base font-medium text-primary-700 bg-primary-50">
                Características
              </a>
              <a href="#pricing" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                Precios
              </a>
              <a href="#testimonials" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                Testimonios
              </a>
              <a href="#contact" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                Contacto
              </a>
              <Link href="/auth/sign-in" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                Iniciar sesión
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Gestión contable</span>
                  <span className="block text-primary-500">simplificada y potente</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Efectivio te ayuda a mantener el control de tus finanzas con herramientas profesionales de contabilidad, facturación y gestión empresarial.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/auth/sign-up">
                      <Button size="lg" className="w-full flex items-center justify-center px-8 py-3 md:py-4 md:text-lg md:px-10">
                        Prueba gratuita
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a href="#features">
                      <Button variant="outline" size="lg" className="w-full flex items-center justify-center px-8 py-3 md:py-4 md:text-lg md:px-10">
                        Conoce más
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"
            alt="Dashboard financiero"
          />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Características</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Solución contable completa
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Todas las herramientas que necesitas para administrar tus finanzas en un solo lugar.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <CircleDollarSign className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Contabilidad Completa</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Sistema de partida doble, plan de cuentas personalizable, generación automática de asientos y estados financieros.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Facturación Electrónica</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Emisión de facturas profesionales, seguimiento de pagos y gestión de clientes en un solo lugar.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <BarChart4 className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Reportes Financieros</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Generación de informes detallados: balance general, estado de resultados, flujo de caja y más.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <CircleDollarSign className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Control de Gastos</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Seguimiento detallado de gastos con categorización y adjuntos de comprobantes.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Precios</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Planes flexibles para tu negocio
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Elige el plan que mejor se adapte a tus necesidades.
            </p>
          </div>

          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
            {/* Plan Básico */}
            <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Básico</h2>
                <p className="mt-4 text-sm text-gray-500">Ideal para autónomos y pequeños negocios.</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">$29</span>
                  <span className="text-base font-medium text-gray-500">/mes</span>
                </p>
                <Link href="/auth/sign-up">
                  <Button variant="outline" className="mt-8 block w-full">
                    Comenzar prueba gratuita
                  </Button>
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">Incluye:</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Hasta 50 clientes</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Facturación básica</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Control de gastos</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Reportes básicos</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Plan Negocios */}
            <div className="border border-primary-500 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Negocios</h2>
                <p className="mt-4 text-sm text-gray-500">Para pequeñas y medianas empresas.</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">$79</span>
                  <span className="text-base font-medium text-gray-500">/mes</span>
                </p>
                <Link href="/auth/sign-up">
                  <Button className="mt-8 block w-full">
                    Comenzar prueba gratuita
                  </Button>
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">Incluye:</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Clientes ilimitados</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Facturación avanzada</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Contabilidad completa</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Reportes avanzados</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Múltiples usuarios (5)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Plan Empresarial */}
            <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Empresarial</h2>
                <p className="mt-4 text-sm text-gray-500">Para empresas en crecimiento con necesidades avanzadas.</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">$149</span>
                  <span className="text-base font-medium text-gray-500">/mes</span>
                </p>
                <Link href="#contact">
                  <Button variant="outline" className="mt-8 block w-full">
                    Contactar ventas
                  </Button>
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">Incluye:</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Todo lo del plan Negocios</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Usuarios ilimitados</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">API para integraciones</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Soporte prioritario</span>
                  </li>
                  <li className="flex space-x-3">
                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Personalización avanzada</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Testimonios</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Lo que dicen nuestros clientes
            </p>
          </div>

          <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
            <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-500">Consultoría</p>
                  <div className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900">Ramírez & Asociados</p>
                    <p className="mt-3 text-base text-gray-500">
                      "Efectivio ha transformado nuestra gestión contable. Ahora todo está organizado y accesible, lo que nos permite enfocarnos en lo que realmente importa: nuestros clientes."
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="sr-only">María Ramírez</span>
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">MR</div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">María Ramírez</p>
                    <p className="text-sm text-gray-500">Directora Financiera</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-500">Comercio</p>
                  <div className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900">Tecnova S.A.</p>
                    <p className="mt-3 text-base text-gray-500">
                      "La facturación electrónica y el control de inventario de Efectivio nos han ahorrado horas de trabajo manual. Una herramienta indispensable para nuestro negocio."
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="sr-only">Carlos Mendoza</span>
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">CM</div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Carlos Mendoza</p>
                    <p className="text-sm text-gray-500">Gerente General</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-500">Servicios</p>
                  <div className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900">Impulso Digital</p>
                    <p className="mt-3 text-base text-gray-500">
                      "Como agencia pequeña, necesitábamos una solución que creciera con nosotros. Efectivio no solo ha simplificado nuestra contabilidad, sino que nos da insights valiosos para tomar decisiones."
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="sr-only">Laura Soto</span>
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">LS</div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Laura Soto</p>
                    <p className="text-sm text-gray-500">Fundadora</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Contacto</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              ¿Necesitas más información?
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Estamos aquí para ayudarte. Completa el formulario y nos pondremos en contacto contigo.
            </p>
          </div>

          <div className="mt-12 max-w-lg mx-auto">
            <form action="#" method="POST" className="grid grid-cols-1 gap-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
                <div className="mt-1">
                  <Input id="name" name="name" required className="py-3 px-4 block w-full shadow-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                  <Input type="email" name="email" id="email" required className="py-3 px-4 block w-full shadow-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                <div className="mt-1">
                  <Input type="text" name="phone" id="phone" className="py-3 px-4 block w-full shadow-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje</label>
                <div className="mt-1">
                  <Textarea id="message" name="message" rows={4} required className="py-3 px-4 block w-full shadow-sm" />
                </div>
              </div>
              <div>
                <Button type="submit" className="w-full flex items-center justify-center">
                  Enviar mensaje
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <svg className="h-8 w-auto text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-white">Efectivio</span>
              </div>
              <p className="mt-4 text-base text-gray-300">
                Sistema de gestión contable completo para empresas de todos los tamaños.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Producto</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#features" className="text-base text-gray-300 hover:text-white">Características</a>
                </li>
                <li>
                  <a href="#pricing" className="text-base text-gray-300 hover:text-white">Precios</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Recursos</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Empresa</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Sobre nosotros</a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">Blog</a>
                </li>
                <li>
                  <a href="#contact" className="text-base text-gray-300 hover:text-white">Contacto</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between">
            <p className="text-base text-gray-400">
              &copy; 2023 Efectivio. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
