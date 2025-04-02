import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

export default function Contabilidad() {
  const [activeTab, setActiveTab] = useState("balance");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contabilidad</h1>
        <div className="flex space-x-2">
          <select className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
            <option>Junio 2023</option>
            <option>Mayo 2023</option>
            <option>Abril 2023</option>
            <option>Marzo 2023</option>
          </select>
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md flex items-center">
            <i className="ri-download-line mr-2"></i> Exportar
          </button>
        </div>
      </div>

      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="bg-white border border-gray-200 rounded-t-lg overflow-hidden">
          <TabsTrigger 
            value="balance" 
            className="py-3 px-5 border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500"
            onClick={() => setActiveTab("balance")}
          >
            Balance General
          </TabsTrigger>
          <TabsTrigger 
            value="resultados" 
            className="py-3 px-5 border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500"
            onClick={() => setActiveTab("resultados")}
          >
            Estado de Resultados
          </TabsTrigger>
          <TabsTrigger 
            value="flujo" 
            className="py-3 px-5 border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500"
            onClick={() => setActiveTab("flujo")}
          >
            Flujo de Efectivo
          </TabsTrigger>
          <TabsTrigger 
            value="cuentas" 
            className="py-3 px-5 border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500"
            onClick={() => setActiveTab("cuentas")}
          >
            Plan de Cuentas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="balance" className="bg-white rounded-b-lg shadow border border-t-0 border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Balance General</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="bg-gray-50 font-medium">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ACTIVOS</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900"></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pl-10">Efectivo y Equivalentes</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 financial-figure">B/. 45,250.00</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pl-10">Cuentas por Cobrar</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 financial-figure">B/. 67,800.00</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pl-10">Inventario</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 financial-figure">B/. 23,500.00</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Activos Corrientes</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 financial-figure">B/. 136,550.00</td>
                </tr>
                
                {/* More balance sheet items would go here */}
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="resultados" className="bg-white rounded-b-lg shadow border border-t-0 border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Estado de Resultados</h2>
          {/* Estado de Resultados content */}
        </TabsContent>
        
        <TabsContent value="flujo" className="bg-white rounded-b-lg shadow border border-t-0 border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Flujo de Efectivo</h2>
          {/* Flujo de Efectivo content */}
        </TabsContent>
        
        <TabsContent value="cuentas" className="bg-white rounded-b-lg shadow border border-t-0 border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Plan de Cuentas</h2>
          {/* Plan de Cuentas content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
