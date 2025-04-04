import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, Area, AreaChart, ComposedChart } from 'recharts';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowDown, ArrowUp, Maximize2, BarChart3, Table as TableIcon, Info, CreditCard, WalletCards, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface CashFlowAnalysisProps {
  realColor?: string;
  projectedColor?: string;
  optimisticColor?: string;
  pessimisticColor?: string;
}

export default function CashFlowAnalysis({
  realColor = "#0062ff",
  projectedColor = "#00C875",
  optimisticColor = "#8884d8",
  pessimisticColor = "#d88884"
}: CashFlowAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForecast, setShowForecast] = useState(true);
  const [viewMode, setViewMode] = useState<'line' | 'area' | 'composed'>('area');
  const [selectedTab, setSelectedTab] = useState("chart");
  const [period, setPeriod] = useState<'fiscal' | 'year' | 'custom'>('fiscal');

  // Datos iniciales para el flujo de efectivo
  const data = [
    { name: 'Ene', real: 0, proyectado: 0, optimista: 0, pesimista: 0, ingresos: 0, gastos: 0, balance: 0, variacion: 0 },
    { name: 'Feb', real: 100, proyectado: 90, optimista: 110, pesimista: 80, ingresos: 120, gastos: 20, balance: 100, variacion: 100 },
    { name: 'Mar', real: 100, proyectado: 95, optimista: 115, pesimista: 85, ingresos: 120, gastos: 20, balance: 100, variacion: 0 },
    { name: 'Abr', real: 100, proyectado: 100, optimista: 120, pesimista: 90, ingresos: 120, gastos: 20, balance: 100, variacion: 0 },
    { name: 'May', real: 100, proyectado: 105, optimista: 125, pesimista: 95, ingresos: 120, gastos: 20, balance: 100, variacion: 0 },
    { name: 'Jun', real: 100, proyectado: 110, optimista: 130, pesimista: 100, ingresos: 120, gastos: 20, balance: 100, variacion: 0 },
    { name: 'Jul', real: 100, proyectado: 115, optimista: 135, pesimista: 105, ingresos: 120, gastos: 20, balance: 100, variacion: 0 },
    { name: 'Ago', real: 100, proyectado: 115, optimista: 135, pesimista: 105, ingresos: 120, gastos: 20, balance: 100, variacion: 0 },
    { name: 'Sep', real: 100, proyectado: 115, optimista: 135, pesimista: 105, ingresos: 120, gastos: 20, balance: 100, variacion: 0 },
    { name: 'Oct', real: 100, proyectado: 115, optimista: 135, pesimista: 105, ingresos: 120, gastos: 20, balance: 100, variacion: 0 },
    { name: 'Nov', real: 100, proyectado: 115, optimista: 135, pesimista: 105, ingresos: 120, gastos: 20, balance: 100, variacion: 0 },
    { name: 'Dic', real: 100, proyectado: 115, optimista: 135, pesimista: 105, ingresos: 120, gastos: 20, balance: 100, variacion: 0 },
  ];
  
  // Estadísticas calculadas
  const efectivoInicial = 0;
  const entradas = 100;
  const salidas = 0;
  const efectivoFinal = 100;
  
  // Índice donde comienza la proyección (para este ejemplo, después de agosto)
  const forecastStartIndex = 8;
  
  useEffect(() => {
    setIsLoading(true);
    // Simulamos carga de análisis AI
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  const renderChart = (): React.ReactElement => {
    switch (viewMode) {
      case 'line':
        return (
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value) => [`$${value ? value.toLocaleString() : 'N/A'}`, null]}
              labelFormatter={(name) => `Mes: ${name}`}
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                border: 'none', 
                padding: '10px 14px'
              }}
            />
            <Legend 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingTop: 15
              }}
            />
            
            {showForecast && forecastStartIndex > 0 && (
              <ReferenceArea 
                x1={data[forecastStartIndex-1].name} 
                x2={data[data.length-1].name} 
                fill="#f8f9fa" 
                fillOpacity={0.6} 
                strokeOpacity={0}
              />
            )}
            
            <Line 
              type="monotone" 
              dataKey="real" 
              name="Real" 
              stroke={realColor} 
              strokeWidth={3} 
              dot={{ r: 5, fill: realColor, strokeWidth: 0 }} 
              activeDot={{ r: 7, strokeWidth: 1, stroke: 'white' }}
              isAnimationActive={true}
              animationDuration={1500}
            />
            
            {showForecast && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="proyectado" 
                  name="Proyectado" 
                  stroke={projectedColor} 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: projectedColor, strokeWidth: 0 }} 
                  strokeDasharray="5 5" 
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationBegin={300}
                />
                <Line 
                  type="monotone" 
                  dataKey="optimista" 
                  name="Optimista" 
                  stroke={optimisticColor} 
                  strokeWidth={1.5} 
                  dot={{ r: 3, fill: optimisticColor, strokeWidth: 0 }} 
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationBegin={600}
                />
                <Line 
                  type="monotone" 
                  dataKey="pesimista" 
                  name="Pesimista" 
                  stroke={pessimisticColor} 
                  strokeWidth={1.5} 
                  dot={{ r: 3, fill: pessimisticColor, strokeWidth: 0 }} 
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationBegin={900}
                />
              </>
            )}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={realColor} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={realColor} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProyectado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={projectedColor} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={projectedColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value) => [`$${value ? value.toLocaleString() : 'N/A'}`, null]}
              labelFormatter={(name) => `Mes: ${name}`}
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                border: 'none', 
                padding: '10px 14px'
              }}
            />
            
            {showForecast && forecastStartIndex > 0 && (
              <ReferenceArea 
                x1={data[forecastStartIndex-1].name} 
                x2={data[data.length-1].name} 
                fill="#f8f9fa" 
                fillOpacity={0.6} 
                strokeOpacity={0}
              />
            )}
            
            <Area 
              type="monotone" 
              dataKey="real" 
              name="Real" 
              stroke={realColor} 
              fillOpacity={1}
              fill="url(#colorReal)"
              strokeWidth={2} 
              dot={{ r: 4, fill: realColor, strokeWidth: 0 }} 
              activeDot={{ r: 6, strokeWidth: 1, stroke: 'white' }}
              isAnimationActive={true}
              animationDuration={1500}
            />
            
            {showForecast && (
              <Area 
                type="monotone" 
                dataKey="proyectado" 
                name="Proyectado" 
                stroke={projectedColor} 
                fillOpacity={1}
                fill="url(#colorProyectado)"
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 3, fill: projectedColor, strokeWidth: 0 }} 
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={300}
              />
            )}
          </AreaChart>
        );
      case 'composed':
        return (
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
              domain={[-15, 15]}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === "variacion") return [`${value}%`, "Variación"];
                return [`$${value ? value.toLocaleString() : 'N/A'}`, name === "ingresos" ? "Ingresos" : name === "gastos" ? "Gastos" : "Balance"];
              }}
              labelFormatter={(name) => `Mes: ${name}`}
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                border: 'none', 
                padding: '10px 14px'
              }}
            />
            
            {showForecast && forecastStartIndex > 0 && (
              <ReferenceArea 
                x1={data[forecastStartIndex-1].name} 
                x2={data[data.length-1].name} 
                fill="#f8f9fa" 
                fillOpacity={0.6} 
                strokeOpacity={0}
              />
            )}
            
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="ingresos" 
              name="Ingresos" 
              fill="#38bdf8"
              fillOpacity={0.1}
              stroke="#38bdf8" 
              strokeWidth={1} 
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="gastos" 
              name="Gastos" 
              fill="#fb7185"
              fillOpacity={0.1}
              stroke="#fb7185" 
              strokeWidth={1} 
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="balance" 
              name="Balance" 
              stroke={realColor} 
              strokeWidth={2.5} 
              dot={{ r: 4, fill: realColor, strokeWidth: 0 }} 
              isAnimationActive={true}
              animationDuration={1500}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="variacion" 
              name="variacion" 
              stroke="#a855f7" 
              strokeWidth={1.5} 
              dot={{ r: 3, fill: "#a855f7", strokeWidth: 0 }} 
              isAnimationActive={true}
              animationDuration={1500}
            />
          </ComposedChart>
        );
      default:
        return (
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="real" name="Real" stroke={realColor} />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-6 pt-6 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Flujo de efectivo</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md px-3 py-1.5">
              {period === 'fiscal' ? 'Este año fiscal' : period === 'year' ? 'Año calendario' : 'Periodo personalizado'}
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 px-6 pb-6">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 text-xs mb-1">Efectivo a 01 ene 2025</p>
          <p className="text-2xl font-bold">${efectivoInicial.toLocaleString()}</p>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex flex-col justify-center">
          <p className="text-blue-600 text-xs mb-1">Entrante</p>
          <p className="text-2xl font-bold text-blue-700">${entradas.toLocaleString()} <span className="text-blue-500 text-sm font-normal">+</span></p>
        </div>
        
        <div className="bg-red-50 rounded-xl p-3 border border-red-100 flex flex-col justify-center">
          <p className="text-red-600 text-xs mb-1">Saliente</p>
          <p className="text-2xl font-bold text-red-700">${salidas.toLocaleString()} <span className="text-red-500 text-sm font-normal">-</span></p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 text-xs mb-1">Efectivo a 31 dic 2025</p>
          <p className="text-2xl font-bold">${efectivoFinal.toLocaleString()} <span className="text-gray-500 text-sm font-normal">=</span></p>
        </div>
      </div>
      
      <div className="flex items-center px-6 mb-3">
        <div className="flex items-center rounded-lg bg-gray-100 p-1">
          <Button 
            variant={viewMode === 'line' ? 'default' : 'ghost'} 
            size="sm" 
            className="h-8"
            onClick={() => setViewMode('line')}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            <span className="text-xs">Líneas</span>
          </Button>
          <Button 
            variant={viewMode === 'area' ? 'default' : 'ghost'} 
            size="sm"
            className="h-8"
            onClick={() => setViewMode('area')}
          >
            <Maximize2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Área</span>
          </Button>
          <Button 
            variant={viewMode === 'composed' ? 'default' : 'ghost'} 
            size="sm"
            className="h-8"
            onClick={() => setViewMode('composed')}
          >
            <TableIcon className="h-4 w-4 mr-1" />
            <span className="text-xs">Detallado</span>
          </Button>
        </div>
        
        <div className="ml-auto">
          <label className="flex items-center cursor-pointer">
            <span className="text-sm mr-2 text-gray-600">Proyección</span>
            <div className="relative">
              <input 
                type="checkbox" 
                checked={showForecast}
                onChange={() => setShowForecast(!showForecast)}
                className="sr-only"
              />
              <div className={`block ${showForecast ? 'bg-blue-500' : 'bg-gray-300'} w-10 h-5 rounded-full transition-colors`}></div>
              <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform transform ${showForecast ? 'translate-x-5' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>
      
      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-80 w-full flex items-center justify-center px-6 pb-6"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-sm text-gray-500">Generando análisis avanzado...</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-80 w-full px-4 pb-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}