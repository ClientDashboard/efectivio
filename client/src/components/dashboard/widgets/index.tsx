import { Calculator, Calendar, Clock, CheckCircle2, CalendarClock, Lightbulb, BarChart3, Plus, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import FinancialTipGenerator from '../../financial-tip/FinancialTipGenerator';
import IncomeExpenseChart from "../../charts/IncomeExpenseChart";
import { Widget } from "../DashboardGridLayout";

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

// Componente de Calculadora
export const CalculatorWidget = () => {
  const [calculatedValue, setCalculatedValue] = useState('');
  const [calculation, setCalculation] = useState('');

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
    <>
      <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100 shadow-sm">
        <div className="text-right text-sm text-gray-500 h-5 font-mono">
          {calculation}
        </div>
        <div className="text-right text-2xl font-semibold h-8 text-gray-900 font-mono">
          {calculatedValue || '0'}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {calculatorButtons.map((btn, index) => {
          let buttonStyle = "";
          
          if (btn === '=') {
            buttonStyle = "bg-blue-500 hover:bg-blue-600 text-white";
          } else if (btn === 'C') {
            buttonStyle = "bg-red-500 hover:bg-red-600 text-white";
          } else if (btn === '←') {
            buttonStyle = "bg-amber-500 hover:bg-amber-600 text-white";
          } else if (['+', '-', '*', '/'].includes(btn)) {
            buttonStyle = "bg-purple-100 hover:bg-purple-200 text-purple-700";
          } else {
            buttonStyle = "bg-gray-100 hover:bg-gray-200 text-gray-900";
          }
          
          return (
            <Button
              key={index}
              variant="ghost"
              className={`h-11 font-medium transition-all ${buttonStyle} ${btn === ' ' ? 'opacity-0 cursor-default' : ''}`}
              onClick={() => handleCalculatorInput(btn)}
              disabled={btn === ' '}
            >
              {btn}
            </Button>
          );
        })}
      </div>
    </>
  );
};

// Componente de Tareas Pendientes
export const TasksWidget = () => {
  return (
    <div className="space-y-4">
      {pendingTasks.map(task => (
        <div key={task.id} className="flex items-start gap-3 border-b border-gray-100 pb-4 last:border-0">
          <div className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 ${
            task.priority === 'alta' ? 'border-red-500' : 
            task.priority === 'media' ? 'border-blue-500' : 'border-gray-300'
          }`}></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{task.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                {task.dueDate}
              </div>
              <Badge variant={
                task.priority === 'alta' ? "destructive" : 
                task.priority === 'media' ? "default" : "outline"
              } className="text-[10px] px-1.5 py-0.5 font-medium">
                {task.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Footer para el widget de tareas
export const TasksFooter = () => {
  return (
    <Button variant="ghost" size="sm" className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium">
      <Plus className="h-4 w-4 mr-2" />
      Ver todas las tareas
    </Button>
  );
};

// Componente de Citas
export const AppointmentsWidget = () => {
  return (
    <div className="space-y-4">
      {upcomingAppointments.map(appointment => (
        <div key={appointment.id} className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0">
          <div className="flex-shrink-0 bg-violet-50 text-violet-700 rounded-xl border border-violet-100 p-2.5">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{appointment.title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-violet-50 text-violet-700">
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                <span>{appointment.time}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="flex-shrink-0 bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 mt-1">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Unirse</span>
          </Button>
        </div>
      ))}
    </div>
  );
};

// Footer para el widget de citas
export const AppointmentsFooter = () => {
  return (
    <Button variant="ghost" size="sm" className="w-full text-violet-600 hover:text-violet-700 hover:bg-violet-50 font-medium">
      <PlusCircle className="h-4 w-4 mr-2" />
      Programar nueva cita
    </Button>
  );
};



// Componente de consejo financiero
export const FinancialTipWidget = () => {
  return <FinancialTipGenerator />;
};

// Componente de Ingresos vs Gastos
export const IncomeExpenseWidget = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="w-full h-full">
        <IncomeExpenseChart 
          incomeColor="#0062ff"
          expenseColor="#F48E21"
        />
      </div>
    </div>
  );
};

// Widget definitions
export const dashboardWidgets: Widget[] = [
  {
    id: 'calculator',
    title: 'Calculadora rápida',
    icon: <Calculator className="mr-2 h-5 w-5 text-blue-500" />,
    content: <CalculatorWidget />,
    description: 'Realiza cálculos financieros simples',
    minH: 3,
    minW: 1
  },
  {
    id: 'tasks',
    title: 'Tareas pendientes',
    icon: <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />,
    content: <TasksWidget />,
    footer: <TasksFooter />,
    description: 'Tus próximas tareas por completar',
    minH: 3,
    minW: 1
  },
  {
    id: 'appointments',
    title: 'Próximas citas',
    icon: <CalendarClock className="mr-2 h-5 w-5 text-violet-500" />,
    content: <AppointmentsWidget />,
    footer: <AppointmentsFooter />,
    description: 'Reuniones programadas',
    minH: 3,
    minW: 1
  },
  {
    id: 'financial-tip',
    title: 'Consejo Financiero',
    icon: <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />,
    content: <FinancialTipWidget />,
    description: 'Consejos personalizados para mejorar tus finanzas',
    minH: 3,
    minW: 2
  },

  {
    id: 'income-expense',
    title: 'Ingresos vs Gastos',
    icon: <BarChart3 className="mr-2 h-5 w-5 text-orange-500" />,
    content: <IncomeExpenseWidget />,
    description: 'Comparativa de ingresos y gastos por periodo',
    minH: 10,
    minW: 3
  },
];