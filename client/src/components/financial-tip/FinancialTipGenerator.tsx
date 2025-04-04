import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, RefreshCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Lista de consejos financieros predefinidos
const FINANCIAL_TIPS = [
  {
    text: "Asegúrate de separar al menos el 20% de tus ingresos para ahorros e inversiones.",
    category: "ahorro"
  },
  {
    text: "Revisa tus gastos fijos mensualmente y busca oportunidades para reducirlos.",
    category: "gastos"
  },
  {
    text: "Considera automatizar tus pagos recurrentes para evitar cargos por pagos tardíos.",
    category: "organización"
  },
  {
    text: "Mantén un fondo de emergencia equivalente a 3-6 meses de gastos.",
    category: "planificación"
  },
  {
    text: "Diversifica tus inversiones para minimizar riesgos.",
    category: "inversión"
  },
  {
    text: "Revisa tu informe de crédito al menos una vez al año.",
    category: "crédito"
  },
  {
    text: "Antes de hacer una compra importante, espera 24 horas para evitar decisiones impulsivas.",
    category: "compras"
  },
  {
    text: "Establece metas financieras específicas y medibles, tanto a corto como a largo plazo.",
    category: "planificación"
  },
  {
    text: "Programa un 'día de no gastar' cada semana para mejorar tus hábitos de ahorro.",
    category: "ahorro"
  },
  {
    text: "Utiliza la regla 50/30/20: 50% para necesidades, 30% para deseos y 20% para ahorro.",
    category: "presupuesto"
  },
  {
    text: "Considera abrir una cuenta de ahorro separada para objetivos específicos.",
    category: "ahorro"
  },
  {
    text: "Revisa tus suscripciones y cancela aquellas que no utilizas con regularidad.",
    category: "gastos"
  },
  {
    text: "Mantén un seguimiento detallado de tus gastos para identificar patrones de consumo.",
    category: "organización"
  },
  {
    text: "Aprende sobre inversiones y finanzas personales a través de libros, podcasts y cursos en línea.",
    category: "educación"
  },
  {
    text: "Establece recordatorios para pagar tus facturas a tiempo y evitar recargos.",
    category: "organización"
  },
  {
    text: "Antes de contratar un servicio o hacer una compra, compara precios y opciones.",
    category: "compras"
  },
  {
    text: "Considera la posibilidad de refinanciar tus deudas para obtener tasas de interés más bajas.",
    category: "deudas"
  },
  {
    text: "Aprende a distinguir entre necesidades y deseos para tomar mejores decisiones financieras.",
    category: "presupuesto"
  },
  {
    text: "Planifica tus comidas para reducir gastos en restaurantes y comida para llevar.",
    category: "gastos"
  },
  {
    text: "Reserva tiempo mensualmente para revisar tu situación financiera y ajustar tu presupuesto.",
    category: "organización"
  }
];

// Colores para las categorías
const CATEGORY_COLORS: Record<string, { bg: string, text: string }> = {
  ahorro: { bg: 'bg-blue-50', text: 'text-blue-600' },
  gastos: { bg: 'bg-red-50', text: 'text-red-600' },
  organización: { bg: 'bg-purple-50', text: 'text-purple-600' },
  planificación: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  inversión: { bg: 'bg-amber-50', text: 'text-amber-600' },
  crédito: { bg: 'bg-teal-50', text: 'text-teal-600' },
  compras: { bg: 'bg-orange-50', text: 'text-orange-600' },
  presupuesto: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  deudas: { bg: 'bg-rose-50', text: 'text-rose-600' },
  educación: { bg: 'bg-cyan-50', text: 'text-cyan-600' }
};

// Componente para la mascota animada
const AnimatedMascot = ({ state }: { state: string }) => {
  // Variantes para las animaciones con Framer Motion
  const bodyVariants = {
    normal: { 
      y: [0, -5, 0], 
      transition: { 
        repeat: Infinity, 
        duration: 2 
      } 
    },
    thinking: { 
      rotate: [-3, 3, -3],
      transition: { 
        repeat: Infinity, 
        duration: 1.5 
      } 
    },
    excited: { 
      scale: [1, 1.05, 1],
      transition: { 
        repeat: Infinity, 
        duration: 0.5 
      } 
    }
  };

  const eyeVariants = {
    normal: { 
      scaleY: [1, 0.1, 1, 1, 1, 1, 1, 1],
      transition: { 
        repeat: Infinity, 
        duration: 4, 
        times: [0, 0.1, 0.2, 0.3, 0.7, 0.75, 0.8, 1] 
      } 
    },
    thinking: { 
      scaleY: [1, 0.1, 1],
      transition: { 
        repeat: Infinity, 
        duration: 2
      } 
    },
    excited: { 
      scaleY: [1, 0.1, 1, 1, 0.1, 1],
      transition: { 
        repeat: Infinity, 
        duration: 2 
      } 
    }
  };

  return (
    <div className="relative w-20 h-20 mx-auto">
      <motion.div 
        className="absolute bottom-0 left-1.5 w-16 h-16 bg-[#39FFBD] rounded-full flex justify-center items-center overflow-hidden shadow-lg"
        variants={bodyVariants}
        animate={state}
      >
        <motion.div 
          className="absolute top-5 left-4 w-3 h-3 bg-[#062644] rounded-full"
          variants={eyeVariants}
          animate={state}
        />
        <motion.div 
          className="absolute top-5 right-4 w-3 h-3 bg-[#062644] rounded-full"
          variants={eyeVariants}
          animate={state}
        />
        <div className="absolute bottom-4 left-5 w-6 h-3 rounded-b-xl border-2 border-t-0 border-[#062644]" />
      </motion.div>
    </div>
  );
};

export interface FinancialTipProps {
  className?: string;
}

const FinancialTipGenerator = ({ className }: FinancialTipProps) => {
  const [currentTip, setCurrentTip] = useState<typeof FINANCIAL_TIPS[number] | null>(null);
  const [animationState, setAnimationState] = useState<string>("normal");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generar un nuevo consejo financiero
  const generateNewTip = () => {
    setIsGenerating(true);
    setAnimationState("thinking");
    
    // Simulamos una llamada a IA con un timeout
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * FINANCIAL_TIPS.length);
      setCurrentTip(FINANCIAL_TIPS[randomIndex]);
      setAnimationState("excited");
      
      // Volvemos al estado normal después de mostrar entusiasmo
      setTimeout(() => {
        setAnimationState("normal");
        setIsGenerating(false);
      }, 2000);
    }, 1500);
  };

  // Generar un consejo inicial al cargar el componente
  useEffect(() => {
    generateNewTip();
  }, []);

  // Obtener el estilo de color según la categoría
  const getCategoryStyle = (category: string) => {
    return CATEGORY_COLORS[category] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  };

  return (
    <Card className={`w-full h-full overflow-hidden ${className}`}>
      <div className="flex flex-col h-full">
        <CardHeader className="pb-0 flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
              Consejo Financiero
            </CardTitle>
            <div className="px-2 py-1 bg-amber-50 rounded-full flex items-center text-xs text-amber-600">
              <Sparkles className="h-3 w-3 mr-1" />
              <span>Efectivio IA</span>
            </div>
          </div>
          <CardDescription>
            Consejos personalizados para mejorar tus finanzas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex-grow flex flex-col items-center justify-center overflow-hidden">
          <div className="w-full flex justify-center" style={{ maxHeight: '120px' }}>
            <AnimatedMascot state={animationState} />
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentTip?.text}
            className="w-full flex flex-col items-center justify-center space-y-3 overflow-hidden"
            style={{ minHeight: '80px', maxHeight: '120px' }}
          >
            {currentTip && (
              <>
                <div className={`px-2 py-1 rounded-full text-xs ${getCategoryStyle(currentTip.category).bg} ${getCategoryStyle(currentTip.category).text}`}>
                  {currentTip.category.charAt(0).toUpperCase() + currentTip.category.slice(1)}
                </div>
                <p className="text-center text-sm px-2 line-clamp-3">{currentTip.text}</p>
              </>
            )}
          </motion.div>
        </CardContent>
        <CardFooter className="pt-0 mt-auto flex-shrink-0">
          <Button 
            onClick={generateNewTip} 
            disabled={isGenerating}
            className="w-full"
            variant="outline"
            size="sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Nuevo consejo
              </>
            )}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default FinancialTipGenerator;