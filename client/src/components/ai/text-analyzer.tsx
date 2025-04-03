import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  keyPoints?: string[];
  summary?: string;
  actions?: string[];
  raw?: string;
  error?: string;
}

export function TextAnalyzer() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const analyzeText = async () => {
    if (!text.trim()) {
      toast({
        title: "Texto vacío",
        description: "Por favor, ingresa algún texto para analizar.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Usar el endpoint de prueba que no requiere autenticación
      const response = await fetch('/api/test/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.error) {
        toast({
          title: "Error en el análisis",
          description: "No se pudo analizar el texto correctamente. Se mostrará el resultado en bruto.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Análisis completado",
          description: "El texto ha sido analizado correctamente.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error al analizar texto:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al analizar el texto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analizador de Texto con IA</CardTitle>
          <CardDescription>
            Ingresa texto para analizarlo y obtener puntos clave, resumen y acciones recomendadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ingresa texto para analizar..."
            value={text}
            onChange={handleTextChange}
            rows={8}
            className="resize-y min-h-[200px]"
          />
        </CardContent>
        <CardFooter>
          <Button 
            onClick={analyzeText} 
            disabled={isAnalyzing || !text.trim()}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analizar Texto
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              {result.error ? (
                <>
                  <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
                  Resultado del Análisis (Parcial)
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Resultado del Análisis
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.summary && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Resumen</h3>
                <p className="text-muted-foreground">{result.summary}</p>
              </div>
            )}
            
            {result.keyPoints && result.keyPoints.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Puntos Clave</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {result.keyPoints.map((point, index) => (
                    <li key={index} className="text-muted-foreground">{point}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.actions && result.actions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Acciones Recomendadas</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {result.actions.map((action, index) => (
                    <li key={index} className="text-muted-foreground">{action}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.raw && result.error && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-destructive">Resultado en Bruto</h3>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-xs">{result.raw}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}