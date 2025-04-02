import React from 'react';
import FinancialTipGenerator from '../financial-tip/FinancialTipGenerator';

export default function DashboardWidgets() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-6">Herramientas útiles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialTipGenerator />
        
        {/* Espacio para futuros widgets
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Widget Adicional</h3>
          <p>Contenido del widget.</p>
        </div>
        */}
      </div>
    </section>
  );
}