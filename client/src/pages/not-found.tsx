import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-extrabold text-gray-900">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mt-2">Página no encontrada</h2>
            <p className="mt-4 text-gray-600">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 pb-6">
          <Button variant="outline" asChild>
            <Link href="/">
              <div className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </div>
            </Link>
          </Button>
          <Button onClick={() => window.history.back()}>
            <div className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </div>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
