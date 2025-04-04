import { useState } from 'react';
import FinancialTipGenerator from '../financial-tip/FinancialTipGenerator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Calculator, 
  Calendar, 
  FileText, 
  Link2, 
  ExternalLink,
  Clock,
  CheckCircle2,
  CalendarClock,
  GripVertical,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function DashboardWidgets() {
  const [calculatedValue, setCalculatedValue] = useState('');
  const [calculation, setCalculation] = useState('');
  
  // Lista de tareas pendientes
  const pendingTasks = [
    { id: 1, title: 'Revisar factura #F-235', dueDate: '15/04/2025', priority: 'alta' },
    { id: 2, title: 'Preparar declaración IVA', dueDate: '20/04/2025', priority: 'media' },
    { id: 3, title: 'Actualizar registro de activos', dueDate: '25/04/2025', priority: 'baja' },
  ];
  
  // Próximas citas
  const upcomingAppointments = [
    { id: 1, title: 'Reunión con Cliente X', date: '08/04/2025', time: '10:00 AM' },
    { id: 2, title: 'Auditoría Trimestral', date: '12/04/2025', time: '2:30 PM' },
  ];

  // Función de calculadora simple
  const handleCalculatorInput = (value: string) => {
    if (value === 'C') {
      setCalculation('');
      setCalculatedValue('');
    } else if (value === '=') {
      try {
        // Evaluamos la expresión de manera segura
        const result = Function('"use strict";return (' + calculation + ')')();
        setCalculatedValue(Number(result).toLocaleString('es', { maximumFractionDigits: 2 }));
      } catch (error) {
        setCalculatedValue('Error');
      }
    } else if (value === '←') {
      setCalculation(prev => prev.slice(0, -1));
    } else {
      setCalculation(prev => prev + value);
    }
  };

  // Botones de la calculadora
  const calculatorButtons = [
    '7', '8', '9', '/', 'C',
    '4', '5', '6', '*', '←',
    '1', '2', '3', '-', '=',
    '0', '.', ',', '+', ' '
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Herramientas útiles</h2>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          <span>Personalizar dashboard</span>
        </Button>
      </div>

      {/* Grid layout para los widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Row 1: Calculadora, Tareas, Citas */}
        <div className="order-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Calculator className="mr-2 h-5 w-5 text-blue-500" />
                  Calculadora rápida
                </CardTitle>
                <div className="cursor-move text-gray-400">
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>
              <CardDescription>
                Realiza cálculos financieros simples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <div className="text-right text-sm text-gray-500 h-5">
                  {calculation}
                </div>
                <div className="text-right text-2xl font-medium h-8">
                  {calculatedValue || '0'}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {calculatorButtons.map((btn, index) => (
                  <Button
                    key={index}
                    variant={btn === '=' ? "default" : btn === 'C' ? "destructive" : "outline"}
                    className={`h-10 ${btn === ' ' ? 'opacity-0 cursor-default' : ''}`}
                    onClick={() => handleCalculatorInput(btn)}
                    disabled={btn === ' '}
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="order-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                  Tareas pendientes
                </CardTitle>
                <div className="cursor-move text-gray-400">
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>
              <CardDescription>
                Tus próximas tareas por completar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 border-b border-gray-100 pb-3">
                    <div className="h-6 w-6 mt-1 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                        <Badge variant={
                          task.priority === 'alta' ? "destructive" : 
                          task.priority === 'media' ? "default" : "outline"
                        } className="text-[10px] px-1 py-0">
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-1">
              <Button variant="ghost" size="sm" className="w-full text-blue-500 hover:text-blue-600">
                Ver todas las tareas
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="order-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CalendarClock className="mr-2 h-5 w-5 text-violet-500" />
                  Próximas citas
                </CardTitle>
                <div className="cursor-move text-gray-400">
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>
              <CardDescription>
                Reuniones programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex-shrink-0 bg-violet-100 text-violet-800 rounded-md p-2.5">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{appointment.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{appointment.date}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{appointment.time}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Unirse</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-1">
              <Button variant="ghost" size="sm" className="w-full text-violet-500 hover:text-violet-600">
                Programar nueva cita
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Row 2: Consejo financiero y Enlaces útiles */}
        <div className="md:col-span-2 order-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <FinancialTipGenerator className="h-full" />
            </div>
            
            <div>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <Link2 className="mr-2 h-5 w-5 text-blue-500" />
                      Enlaces útiles
                    </CardTitle>
                    <div className="cursor-move text-gray-400">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  </div>
                  <CardDescription>
                    Recursos y herramientas importantes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" className="justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>DGI - Portal tributario</span>
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>CSS - Portal empresarial</span>
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Legislación fiscal</span>
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Calculadora de impuestos</span>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="pt-1">
                  <Button variant="ghost" size="sm" className="w-full text-blue-500 hover:text-blue-600">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Añadir enlace personalizado
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}