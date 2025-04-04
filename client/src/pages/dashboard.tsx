
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { DashboardGridLayout } from '@/components/dashboard/DashboardGridLayout';
import { dashboardWidgets } from '@/components/dashboard/widgets';
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Briefcase, TrendingUp, Calendar, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [greeting, setGreeting] = useState("Buenas tardes");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Establecer el saludo según la hora del día
  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) {
        setGreeting("Buenos días");
      } else if (currentHour >= 12 && currentHour < 19) {
        setGreeting("Buenas tardes");
      } else {
        setGreeting("Buenas noches");
      }
    };

    updateGreeting();
    // Actualizar cada hora
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
      updateGreeting();
    }, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Opciones rápidas para el dashboard
  const quickActions = [
    { icon: <PlusCircle size={18} />, label: "Nueva Factura", action: () => setLocation("/invoices/create") },
    { icon: <Calendar size={18} />, label: "Registrar Gasto", action: () => setLocation("/expenses/create") },
    { icon: <TrendingUp size={18} />, label: "Ver Reportes", action: () => setLocation("/accounting/balance-sheet") },
    { icon: <Briefcase size={18} />, label: "Gestionar Clientes", action: () => setLocation("/clients") },
  ];

  // Animación para los elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-3 py-5"
    >
      {/* Cabecera con saludo y fecha */}
      <motion.div variants={itemVariants} className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, Usuario</h1>
        <p className="text-gray-600 mt-1 text-sm">{formatDate(currentTime)}</p>
      </motion.div>

      {/* Acciones rápidas */}
      <motion.div variants={itemVariants} className="mb-5">
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={action.action}
              className="flex items-center gap-2 bg-white/80 hover:bg-white text-gray-800 border-gray-200/50 shadow-sm transition-all backdrop-blur-sm"
              size="sm"
            >
              {action.icon}
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Métricas y gráficos */}
      <motion.div variants={itemVariants}>
        <DashboardOverview />
      </motion.div>

      {/* Contenido principal y widgets */}
      <motion.div variants={itemVariants} className="mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <DashboardGridLayout widgets={dashboardWidgets} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
