import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, Area, AreaChart, ComposedChart } from 'recharts';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowDown, ArrowUp, Maximize2, BarChart3, Table as TableIcon, Info, CreditCard, WalletCards } from 'lucide-react';
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

  // Sample data
  const data = [
    { name: 'Ene', real: 12000, proyectado: 11500, optimista: 13000, pesimista: 10000, ingresos: 18500, gastos: 6500, balance: 12000, variacion: 0 },
    { name: 'Feb', real: 13200, proyectado: 12500, optimista: 14000, pesimista: 11000, ingresos: 19300, gastos: 6100, balance: 13200, variacion: 10 },
    { name: 'Mar', real: 14500, proyectado: 13500, optimista: 15000, pesimista: 12000, ingresos: 20500, gastos: 6000, balance: 14500, variacion: 9.8 },
    { name: 'Abr', real: 13800, proyectado: 14000, optimista: 15500, pesimista: 12500, ingresos: 19800, gastos: 6000, balance: 13800, variacion: -4.8 },
    { name: 'May', real: 15000, proyectado: 14500, optimista: 16000, pesimista: 13000, ingresos: 21600, gastos: 6600, balance: 15000, variacion: 8.7 },
    { name: 'Jun', real: null, proyectado: 15000, optimista: 16500, pesimista: 13500, ingresos: 22000, gastos: 7000, balance: 15000, variacion: 0 },
    { name: 'Jul', real: null, proyectado: 15500, optimista: 17000, pesimista: 14000, ingresos: 22500, gastos: 7000, balance: 15500, variacion: 3.3 },
    { name: 'Ago', real: null, proyectado: 16000, optimista: 17500, pesimista: 14500, ingresos: 23000, gastos: 7000, balance: 16000, variacion: 3.2 },
  ];
  
  // Calcular tendencia y estadísticas
  const lastRealIndex = data.findIndex(item => item.real === null) - 1;
  const lastRealMonth = lastRealIndex >= 0 ? data[lastRealIndex] : null;
  const previousMonth = lastRealIndex > 0 ? data[lastRealIndex - 1] : null;
  
  const trend = (lastRealMonth && previousMonth && lastRealMonth.real !== null && previousMonth.real !== null)
    ? ((lastRealMonth.real - previousMonth.real) / previousMonth.real) * 100 
    : 0;
    
  const totalIngresos = lastRealMonth?.ingresos || 0;
  const totalGastos = lastRealMonth?.gastos || 0;
  
  // Índice donde comienza la proyección
  const forecastStartIndex = data.findIndex(item => item.real === null);
  
  useEffect(() => {
    setIsLoading(true);
    // Simulate AI analysis loading
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
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
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
              tickFormatter={(value) => `B/.${value / 1000}k`}
            />
            <Tooltip 
              formatter={(value) => [`B/. ${value ? value.toLocaleString() : 'N/A'}`, null]}
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
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={realColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={realColor} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorProyectado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={projectedColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={projectedColor} stopOpacity={0.1}/>
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
              tickFormatter={(value) => `B/.${value / 1000}k`}
            />
            <Tooltip 
              formatter={(value) => [`B/. ${value ? value.toLocaleString() : 'N/A'}`, null]}
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
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
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
              tickFormatter={(value) => `B/.${value / 1000}k`}
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
                return [`B/. ${value ? value.toLocaleString() : 'N/A'}`, name === "ingresos" ? "Ingresos" : name === "gastos" ? "Gastos" : "Balance"];
              }}
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
            
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="ingresos" 
              name="Ingresos" 
              fill="#38bdf8"
              fillOpacity={0.6}
              stroke="#38bdf8" 
              strokeWidth={1} 
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="gastos" 
              name="Gastos" 
              fill="#fb7185"
              fillOpacity={0.6}
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
        // Fallback para asegurar que siempre retorne un elemento React
        return (
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
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
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-base font-medium text-gray-900">Análisis Financiero</h3>
            <div className="ml-2 px-2 py-1 bg-blue-50 rounded-full flex items-center text-xs text-blue-600">
              <Sparkles className="h-3 w-3 mr-1" />
              <span>AI-Powered</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md bg-gray-100 p-1">
              <Button 
                variant={viewMode === 'line' ? 'default' : 'ghost'} 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setViewMode('line')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'area' ? 'default' : 'ghost'} 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setViewMode('area')}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'composed' ? 'default' : 'ghost'} 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setViewMode('composed')}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
            
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
        
        {!isLoading && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-gradient-to-tr from-blue-50 to-blue-100 rounded-lg p-2 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 mr-2">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Ingresos</div>
                <div className="text-sm font-semibold">B/. {totalIngresos?.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-tr from-red-50 to-red-100 rounded-lg p-2 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-600 mr-2">
                <WalletCards className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Gastos</div>
                <div className="text-sm font-semibold">B/. {totalGastos?.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-tr from-green-50 to-green-100 rounded-lg p-2 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-600 mr-2">
                {trend >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </div>
              <div>
                <div className="text-xs text-gray-500">Tendencia</div>
                <div className="text-sm font-semibold flex items-center">
                  {trend.toFixed(1)}%
                  <Badge className={`ml-1 text-[10px] px-1 py-0 ${trend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {trend >= 0 ? 'Alza' : 'Baja'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="border-b border-gray-100">
          <TabsList className="mx-4 my-1 h-10">
            <TabsTrigger value="chart" className="data-[state=active]:bg-primary/10">Vista Gráfica</TabsTrigger>
            <TabsTrigger value="table" className="data-[state=active]:bg-primary/10">Tabla Detallada</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chart">
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-80 w-full flex items-center justify-center"
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
              className="h-80 w-full px-4 pt-2"
            >
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </motion.div>
          )}
        </TabsContent>
        
        <TabsContent value="table">
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-80 w-full flex items-center justify-center"
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
              className="w-full overflow-x-auto"
            >
              <div className="min-w-full p-4">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="sticky top-0 border-b border-gray-200 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mes
                      </th>
                      <th className="sticky top-0 border-b border-gray-200 bg-gray-50 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-end">
                          <span>Ingresos</span>
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs w-40">Total de entradas en la cuenta durante el período</p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        </div>
                      </th>
                      <th className="sticky top-0 border-b border-gray-200 bg-gray-50 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-end">
                          <span>Gastos</span>
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs w-40">Total de salidas en la cuenta durante el período</p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        </div>
                      </th>
                      <th className="sticky top-0 border-b border-gray-200 bg-gray-50 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-end">
                          <span>Balance</span>
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs w-40">Saldo final después de ingresos y gastos</p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        </div>
                      </th>
                      <th className="sticky top-0 border-b border-gray-200 bg-gray-50 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-end">
                          <span>Variación</span>
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs w-40">Cambio porcentual respecto al mes anterior</p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((month, index) => {
                      const isPredicted = index >= forecastStartIndex;
                      return (
                        <tr key={month.name} className={isPredicted ? 'bg-blue-50/30' : ''}>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {month.name}
                            {isPredicted && <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-[10px]">Proyectado</Badge>}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900 tabular-nums">
                            B/. {month.ingresos.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-900 tabular-nums">
                            B/. {month.gastos.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 tabular-nums">
                            B/. {month.balance.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-sm tabular-nums">
                            <div className="flex items-center justify-end">
                              {index > 0 ? (
                                <>
                                  <span className={month.variacion >= 0 ? "text-green-600" : "text-red-600"}>
                                    {month.variacion >= 0 ? "+" : ""}{month.variacion}%
                                  </span>
                                  {month.variacion > 0 ? (
                                    <ArrowUp className="h-3 w-3 ml-1 text-green-600" />
                                  ) : month.variacion < 0 ? (
                                    <ArrowDown className="h-3 w-3 ml-1 text-red-600" />
                                  ) : (
                                    <ArrowRight className="h-3 w-3 ml-1 text-gray-400" />
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
