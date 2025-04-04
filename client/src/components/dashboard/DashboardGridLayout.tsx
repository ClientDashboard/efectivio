import { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Save, X, GripVertical, Maximize, Minimize } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Configuración de React-Grid-Layout
const ResponsiveGridLayout = WidthProvider(Responsive);

// Definición de tipos para los widgets
export interface Widget {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  description?: string;
  minH?: number;
  minW?: number;
}

// Configuración de layouts predeterminados
const defaultLayouts = {
  lg: [
    { i: 'calculator', x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'tasks', x: 1, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'appointments', x: 2, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'financial-tip', x: 0, y: 2, w: 2, h: 2, minW: 1, minH: 2 },
    { i: 'links', x: 2, y: 2, w: 1, h: 2, minW: 1, minH: 1 },
  ],
  md: [
    { i: 'calculator', x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'tasks', x: 1, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'appointments', x: 0, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'financial-tip', x: 0, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'links', x: 1, y: 2, w: 1, h: 2, minW: 1, minH: 1 },
  ],
  sm: [
    { i: 'calculator', x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'tasks', x: 0, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'appointments', x: 0, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'financial-tip', x: 0, y: 6, w: 1, h: 2, minW: 1, minH: 2 },
    { i: 'links', x: 0, y: 8, w: 1, h: 2, minW: 1, minH: 1 },
  ],
};

// Componente principal
export function DashboardGridLayout({ widgets }: { widgets: Widget[] }) {
  const [layouts, setLayouts] = useLocalStorage('dashboard-layouts', defaultLayouts);
  const [editing, setEditing] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [mounted, setMounted] = useState(false);

  // Establecer mounted a true después de que el componente se monte
  useEffect(() => {
    setMounted(true);
  }, []);

  // Manejar cambios en el layout
  const handleLayoutChange = (_layout: any, _allLayouts: any) => {
    if (mounted && editing) {
      setLayouts(_allLayouts);
    }
  };

  // Manejar cambios en el breakpoint
  const handleBreakpointChange = (breakpoint: string) => {
    setCurrentBreakpoint(breakpoint);
  };

  // Restaurar layouts a los valores predeterminados
  const resetLayouts = () => {
    setLayouts(defaultLayouts);
  };

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {editing ? "Personalizar dashboard" : "Dashboard"}
        </h2>
        {editing ? (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetLayouts}
              className="flex items-center gap-1"
            >
              <Maximize className="h-4 w-4" />
              <span>Restablecer</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditing(false)}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </Button>
            <Button 
              size="sm" 
              onClick={() => setEditing(false)}
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              <span>Guardar</span>
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setEditing(true)}
            className="flex items-center gap-1"
          >
            <Settings className="h-4 w-4" />
            <span>Personalizar dashboard</span>
          </Button>
        )}
      </div>

      {/* Solo renderizamos el GridLayout si el componente está montado */}
      {mounted && (
        <ResponsiveGridLayout
          className={`layout ${editing ? 'editing' : ''}`}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 768, sm: 480 }}
          cols={{ lg: 3, md: 2, sm: 1 }}
          rowHeight={150}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={handleBreakpointChange}
          isDraggable={editing}
          isResizable={editing}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {widgets.map((widget) => (
            <div key={widget.id} className="widget-container">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium flex items-center">
                      {widget.icon}
                      {widget.title}
                    </CardTitle>
                    {editing && (
                      <div className="cursor-move text-gray-400">
                        <GripVertical className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  {widget.description && (
                    <CardDescription>{widget.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {widget.content}
                </CardContent>
                {widget.footer && (
                  <CardFooter className="pt-1">
                    {widget.footer}
                  </CardFooter>
                )}
              </Card>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}

      {/* Estilos para el modo de edición */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .layout.editing .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top;
          border: 2px dashed rgba(59, 130, 246, 0.3);
        }
        
        .layout.editing .react-grid-item.react-grid-placeholder {
          background: rgba(59, 130, 246, 0.15);
          border: 2px dashed rgba(59, 130, 246, 0.6);
          transition-duration: 100ms;
          z-index: 2;
          border-radius: 0.5rem;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -o-user-select: none;
          user-select: none;
        }

        .layout.editing .react-grid-item:hover {
          border: 2px dashed rgba(59, 130, 246, 0.8);
        }

        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 3;
        }
        
        .react-grid-item.react-grid-placeholder {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 0.5rem;
          transition-duration: 100ms;
          z-index: 2;
          user-select: none;
        }
        `
      }} />
    </div>
  );
}

