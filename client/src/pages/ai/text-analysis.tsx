import React from 'react';
import { TextAnalyzer } from '@/components/ai/text-analyzer';

export default function TextAnalysisPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Análisis de Texto con IA
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Obtén insights valiosos, resúmenes y acciones recomendadas a partir de cualquier texto con nuestra herramienta de análisis impulsada por inteligencia artificial.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-8 md:py-12 lg:py-16">
          <TextAnalyzer />
        </section>
      </main>
    </div>
  );
}