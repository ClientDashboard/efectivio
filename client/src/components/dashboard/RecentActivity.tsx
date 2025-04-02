import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

type ActivityTab = 'facturas' | 'gastos' | 'asientos';

interface Invoice {
  id: string;
  number: string;
  client: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
}

export default function RecentActivity() {
  const [activeTab, setActiveTab] = useState<ActivityTab>('facturas');
  
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['/api/facturas/recent'],
    enabled: false, // Disabled until we have a real endpoint
  });

  // Sample static data
  const invoiceData: Invoice[] = [
    {
      id: '1',
      number: 'F-2023-0456',
      client: 'Constructora Panamá S.A.',
      date: '12/06/2023',
      amount: 'B/. 4,500.00',
      status: 'paid'
    },
    {
      id: '2',
      number: 'F-2023-0455',
      client: 'Hotel Centroamericano',
      date: '10/06/2023',
      amount: 'B/. 12,800.00',
      status: 'pending'
    },
    {
      id: '3',
      number: 'F-2023-0454',
      client: 'Distribuidora Global',
      date: '08/06/2023',
      amount: 'B/. 3,250.00',
      status: 'overdue'
    },
    {
      id: '4',
      number: 'F-2023-0453',
      client: 'Panamá Logistics Inc.',
      date: '05/06/2023',
      amount: 'B/. 7,320.00',
      status: 'paid'
    }
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
        <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">Ver todo</button>
      </div>
      
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'facturas' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('facturas')}
          >
            Facturas
          </button>
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'gastos' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('gastos')}
          >
            Gastos
          </button>
          <button 
            className={`px-4 py-3 font-medium ${activeTab === 'asientos' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('asientos')}
          >
            Asientos
          </button>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoiceData.map(invoice => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{invoice.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="financial-figure text-sm text-gray-900">{invoice.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : invoice.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status === 'paid' ? 'Pagada' : invoice.status === 'pending' ? 'Pendiente' : 'Vencida'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-500 hover:text-primary-700 mr-3">Ver</button>
                    <button className="text-gray-500 hover:text-gray-700">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">4</span> de <span className="font-medium">24</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <i className="ri-arrow-left-s-line"></i>
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-50 text-sm font-medium text-primary-500 hover:bg-primary-100">
                  1
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </a>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  6
                </a>
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <i className="ri-arrow-right-s-line"></i>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
