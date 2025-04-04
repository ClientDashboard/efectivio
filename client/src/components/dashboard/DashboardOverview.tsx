import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import IncomeExpenseChart from "../charts/IncomeExpenseChart";
import CashFlowAnalysis from "../charts/CashFlowAnalysis";
import { Palette, LayoutDashboard, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { HexColorPicker } from "react-colorful";

// Tipos para las opciones de color
interface ChartColorScheme {
  incomeColor: string;
  expenseColor: string;
  realColor: string;
  projectedColor: string;
  optimisticColor: string;
  pessimisticColor: string;
}

export default function DashboardOverview() {
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: true,
  });

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [chartRefresh, setChartRefresh] = useState<number>(0);
  
  // Configuración de colores para las gráficas
  const [chartColors, setChartColors] = useState<ChartColorScheme>({
    incomeColor: "#0062ff",
    expenseColor: "#F48E21",
    realColor: "#0062ff",
    projectedColor: "#00C875",
    optimisticColor: "#8884d8",
    pessimisticColor: "#d88884"
  });
  
  // Estado para el color que se está editando actualmente
  const [activeColor, setActiveColor] = useState<keyof ChartColorScheme | null>(null);
  
  // Actualizar un color específico
  const updateColor = (color: string) => {
    if (activeColor) {
      setChartColors(prev => ({
        ...prev,
        [activeColor]: color
      }));
    }
  };

  // Función para refrescar los datos del dashboard
  const refreshDashboardData = () => {
    refetch();
    setChartRefresh(prev => prev + 1);
  };

  // Presets de colores predefinidos
  const colorPresets = [
    {
      name: "Efectivio",
      scheme: {
        incomeColor: "#0062ff",
        expenseColor: "#F48E21",
        realColor: "#0062ff",
        projectedColor: "#00C875",
        optimisticColor: "#8884d8",
        pessimisticColor: "#d88884"
      }
    },
    {
      name: "Corporativo",
      scheme: {
        incomeColor: "#2563eb",
        expenseColor: "#e11d48",
        realColor: "#2563eb",
        projectedColor: "#16a34a",
        optimisticColor: "#6366f1",
        pessimisticColor: "#f43f5e"
      }
    },
    {
      name: "Suave",
      scheme: {
        incomeColor: "#38bdf8",
        expenseColor: "#fb923c",
        realColor: "#38bdf8",
        projectedColor: "#4ade80",
        optimisticColor: "#a5b4fc",
        pessimisticColor: "#fda4af"
      }
    },
    {
      name: "Oscuro",
      scheme: {
        incomeColor: "#1e40af",
        expenseColor: "#9f1239",
        realColor: "#1e40af",
        projectedColor: "#15803d",
        optimisticColor: "#4338ca",
        pessimisticColor: "#be123c"
      }
    }
  ];

  const stats = [
    {
      id: 1,
      title: "Ingresos Mensuales",
      amount: dashboardData?.ingresos || "B/. 0.00",
      change: dashboardData?.ingresosChange || 0,
      isPositive: true,
      icon: <LayoutDashboard className="h-5 w-5" />,
      iconBgClass: "bg-blue-50",
      iconClass: "text-blue-500",
      description: "Total de ingresos del mes actual",
    },
    {
      id: 2,
      title: "Gastos Mensuales",
      amount: dashboardData?.gastos || "B/. 0.00",
      change: dashboardData?.gastosChange || 0,
      isPositive: false,
      icon: <Download className="h-5 w-5" />,
      iconBgClass: "bg-red-50",
      iconClass: "text-red-500",
      description: "Total de gastos del mes actual",
    },
    {
      id: 3,
      title: "Facturas Pendientes",
      amount: dashboardData?.facturasPendientes || "B/. 0.00",
      change: dashboardData?.facturasPendientesChange || 0,
      isPositive: null,
      icon: <Download className="h-5 w-5" />,
      iconBgClass: "bg-blue-50",
      iconClass: "text-blue-500",
      description: "Facturas por cobrar",
    },
    {
      id: 4,
      title: "ITBMS por Pagar",
      amount: dashboardData?.itbms || "B/. 0.00",
      change: null,
      isPositive: null,
      icon: <Download className="h-5 w-5" />,
      iconBgClass: "bg-purple-50",
      iconClass: "text-purple-500",
      description: "Impuesto pendiente por pagar",
    },
  ];

  return (
    <section className="mb-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Vista General</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={refreshDashboardData}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 
              transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg
              ${hoveredCard === stat.id ? "ring-2 ring-blue-500 ring-opacity-50" : ""}`}
            onMouseEnter={() => setHoveredCard(stat.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${stat.iconBgClass} flex items-center justify-center 
                transition-transform duration-300 ${hoveredCard === stat.id ? "scale-110" : ""}`}
              >
                {stat.icon}
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold text-gray-900">
                {stat.amount}
              </span>
              {stat.change !== null && (
                <span
                  className={`ml-2 ${stat.isPositive ? "text-emerald-500" : "text-red-500"} 
                  flex items-center text-sm font-medium`}
                >
                  <i
                    className={`${stat.isPositive ? "ri-arrow-up-line" : "ri-arrow-down-line"} mr-1`}
                  ></i>
                  {Math.abs(stat.change)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <i className="ri-line-chart-line mr-2 text-blue-500"></i>
              Ingresos vs Gastos
            </h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Colores</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Personalizar colores del gráfico</h4>
                  
                  <Tabs defaultValue="income-expense">
                    <TabsList className="w-full">
                      <TabsTrigger value="income-expense" className="flex-1">Ing/Gastos</TabsTrigger>
                      <TabsTrigger value="presets" className="flex-1">Presets</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="income-expense">
                      <div className="space-y-4 py-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: chartColors.incomeColor }}
                            />
                            <span className="text-sm">Ingresos</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveColor('incomeColor')}
                          >
                            Editar
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: chartColors.expenseColor }}
                            />
                            <span className="text-sm">Gastos</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveColor('expenseColor')}
                          >
                            Editar
                          </Button>
                        </div>
                        
                        {activeColor && (
                          <div className="mt-4 border rounded-md p-3">
                            <div className="mb-2 flex justify-between items-center">
                              <span className="text-sm font-medium">Selecciona un color</span>
                              <Badge variant="outline">{chartColors[activeColor]}</Badge>
                            </div>
                            <HexColorPicker 
                              color={chartColors[activeColor]} 
                              onChange={updateColor}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="presets">
                      <div className="grid grid-cols-1 gap-2 py-2">
                        {colorPresets.map((preset, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="justify-start"
                            onClick={() => setChartColors(preset.scheme)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Object.values(preset.scheme).slice(0, 4).map((color, i) => (
                                  <div
                                    key={i}
                                    className="w-3 h-3 rounded-full border border-gray-200"
                                    style={{ backgroundColor: color, marginLeft: i > 0 ? '-3px' : '0' }}
                                  />
                                ))}
                              </div>
                              <span>{preset.name}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="pt-2 flex justify-end">
                    <Button 
                      size="sm" 
                      onClick={() => setChartRefresh(prev => prev + 1)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <IncomeExpenseChart 
            key={`income-expense-${chartRefresh}`}
            incomeColor={chartColors.incomeColor}
            expenseColor={chartColors.expenseColor}
          />
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <i className="ri-funds-line mr-2 text-blue-500"></i>
              Flujo de Efectivo
            </h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Colores</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Personalizar colores del gráfico</h4>
                  
                  <Tabs defaultValue="cashflow">
                    <TabsList className="w-full">
                      <TabsTrigger value="cashflow" className="flex-1">Flujo Caja</TabsTrigger>
                      <TabsTrigger value="presets" className="flex-1">Presets</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="cashflow">
                      <div className="space-y-4 py-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: chartColors.realColor }}
                            />
                            <span className="text-sm">Real</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveColor('realColor')}
                          >
                            Editar
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: chartColors.projectedColor }}
                            />
                            <span className="text-sm">Proyectado</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveColor('projectedColor')}
                          >
                            Editar
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: chartColors.optimisticColor }}
                            />
                            <span className="text-sm">Optimista</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveColor('optimisticColor')}
                          >
                            Editar
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: chartColors.pessimisticColor }}
                            />
                            <span className="text-sm">Pesimista</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveColor('pessimisticColor')}
                          >
                            Editar
                          </Button>
                        </div>
                        
                        {activeColor && (
                          <div className="mt-4 border rounded-md p-3">
                            <div className="mb-2 flex justify-between items-center">
                              <span className="text-sm font-medium">Selecciona un color</span>
                              <Badge variant="outline">{chartColors[activeColor]}</Badge>
                            </div>
                            <HexColorPicker 
                              color={chartColors[activeColor]} 
                              onChange={updateColor}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="presets">
                      <div className="grid grid-cols-1 gap-2 py-2">
                        {colorPresets.map((preset, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="justify-start"
                            onClick={() => setChartColors(preset.scheme)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Object.values(preset.scheme).slice(0, 4).map((color, i) => (
                                  <div
                                    key={i}
                                    className="w-3 h-3 rounded-full border border-gray-200"
                                    style={{ backgroundColor: color, marginLeft: i > 0 ? '-3px' : '0' }}
                                  />
                                ))}
                              </div>
                              <span>{preset.name}</span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="pt-2 flex justify-end">
                    <Button 
                      size="sm" 
                      onClick={() => setChartRefresh(prev => prev + 1)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <CashFlowAnalysis 
            key={`cashflow-${chartRefresh}`}
            realColor={chartColors.realColor}
            projectedColor={chartColors.projectedColor}
            optimisticColor={chartColors.optimisticColor}
            pessimisticColor={chartColors.pessimisticColor}
          />
        </div>
      </div>
    </section>
  );
}
