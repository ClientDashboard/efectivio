import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, RefreshCw } from "lucide-react";

// Lista de consejos financieros predefinidos
const FINANCIAL_TIPS = [
  "Asegúrate de separar al menos el 20% de tus ingresos para ahorros e inversiones.",
  "Revisa tus gastos fijos mensualmente y busca oportunidades para reducirlos.",
  "Considera automatizar tus pagos recurrentes para evitar cargos por pagos tardíos.",
  "Mantén un fondo de emergencia equivalente a 3-6 meses de gastos.",
  "Diversifica tus inversiones para minimizar riesgos.",
  "Revisa tu informe de crédito al menos una vez al año.",
  "Antes de hacer una compra importante, espera 24 horas para evitar decisiones impulsivas.",
  "Establece metas financieras específicas y medibles, tanto a corto como a largo plazo.",
  "Programa un 'día de no gastar' cada semana para mejorar tus hábitos de ahorro.",
  "Utiliza la regla 50/30/20: 50% para necesidades, 30% para deseos y 20% para ahorro.",
  "Considera abrir una cuenta de ahorro separada para objetivos específicos.",
  "Revisa tus suscripciones y cancela aquellas que no utilizas con regularidad.",
  "Mantén un seguimiento detallado de tus gastos para identificar patrones de consumo.",
  "Aprende sobre inversiones y finanzas personales a través de libros, podcasts y cursos en línea.",
  "Establece recordatorios para pagar tus facturas a tiempo y evitar recargos.",
  "Antes de contratar un servicio o hacer una compra, compara precios y opciones.",
  "Considera la posibilidad de refinanciar tus deudas para obtener tasas de interés más bajas.",
  "Aprende a distinguir entre necesidades y deseos para tomar mejores decisiones financieras.",
  "Planifica tus comidas para reducir gastos en restaurantes y comida para llevar.",
  "Reserva tiempo mensualmente para revisar tu situación financiera y ajustar tu presupuesto."
];

// Estilos para las animaciones de la mascota
const mascotStyles = {
  container: {
    position: 'relative',
    width: '120px',
    height: '120px',
    marginLeft: 'auto',
    marginRight: 'auto',
  } as React.CSSProperties,
  body: {
    width: '100px',
    height: '100px',
    backgroundColor: '#39FFBD',
    borderRadius: '50%',
    position: 'absolute',
    bottom: '0',
    left: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    animation: 'bodyBounce 2s infinite ease-in-out',
  } as React.CSSProperties,
  eye: {
    width: '20px',
    height: '20px',
    backgroundColor: '#062644',
    borderRadius: '50%',
    position: 'absolute',
    top: '30px',
  } as React.CSSProperties,
  leftEye: {
    left: '25px',
  } as React.CSSProperties,
  rightEye: {
    right: '25px',
  } as React.CSSProperties,
  mouth: {
    width: '40px',
    height: '20px',
    borderRadius: '0 0 20px 20px',
    border: '4px solid #062644',
    borderTop: 'none',
    position: 'absolute',
    bottom: '25px',
    left: '30px',
  } as React.CSSProperties,
};

// Animaciones CSS para la mascota
const mascotAnimations = `
@keyframes bodyBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes blink {
  0%, 10%, 25%, 75%, 100% { transform: scaleY(1); }
  20%, 70% { transform: scaleY(0.1); }
}

@keyframes thinking {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

@keyframes excited {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
`;

export interface FinancialTipProps {
  className?: string;
}

const FinancialTipGenerator: React.FC<FinancialTipProps> = ({ className }) => {
  const [currentTip, setCurrentTip] = useState<string>("");
  const [animationState, setAnimationState] = useState<string>("normal");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Estilo para los ojos según el estado de animación
  const getEyeStyle = () => {
    let style = { ...mascotStyles.eye };
    
    if (animationState === "thinking") {
      style.animation = 'thinking 1s infinite ease-in-out';
    } else if (animationState === "excited") {
      style.animation = 'blink 3s infinite';
    } else {
      style.animation = 'blink 4s infinite';
    }
    
    return style;
  };

  // Estilo para el cuerpo según el estado de animación
  const getBodyStyle = () => {
    let style = { ...mascotStyles.body };
    
    if (animationState === "excited") {
      style.animation = 'excited 0.5s infinite ease-in-out';
    }
    
    return style;
  };

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

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <Lightbulb className="mr-2 h-5 w-5 text-[#39FFBD]" />
          Consejo Financiero del Día
        </CardTitle>
        <CardDescription>
          Consejos personalizados para mejorar tus finanzas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <style>
          {mascotAnimations}
        </style>
        <div style={mascotStyles.container}>
          <div style={getBodyStyle()}>
            <div style={{ ...getEyeStyle(), ...mascotStyles.leftEye }} />
            <div style={{ ...getEyeStyle(), ...mascotStyles.rightEye }} />
            <div style={mascotStyles.mouth} />
          </div>
        </div>
        <div className="mt-4 min-h-[80px] flex items-center justify-center">
          <p className="text-center">{currentTip}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button 
          onClick={generateNewTip} 
          disabled={isGenerating}
          className="w-full bg-[#39FFBD] hover:bg-[#39FFBD]/90 text-[#062644]"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generando consejo...
            </>
          ) : (
            "Nuevo consejo"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FinancialTipGenerator;