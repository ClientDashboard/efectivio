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
    { i: 'calculator', x: 0, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'tasks', x: 1, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'appointments', x: 2, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'financial-tip', x: 0, y: 3, w: 2, h: 3, minW: 2, minH: 3 },
    { i: 'links', x: 2, y: 3, w: 1, h: 3, minW: 1, minH: 2 },
  ],
  md: [
    { i: 'calculator', x: 0, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'tasks', x: 1, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'appointments', x: 0, y: 3, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'financial-tip', x: 1, y: 3, w: 1, h: 3, minW: 1, minH: 3 },
    { i: 'links', x: 0, y: 6, w: 2, h: 2, minW: 1, minH: 2 },
  ],
  sm: [
    { i: 'calculator', x: 0, y: 0, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'tasks', x: 0, y: 3, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'appointments', x: 0, y: 6, w: 1, h: 3, minW: 1, minH: 2 },
    { i: 'financial-tip', x: 0, y: 9, w: 1, h: 3, minW: 1, minH: 3 },
    { i: 'links', x: 0, y: 12, w: 1, h: 2, minW: 1, minH: 2 },
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
    <div className="w-full mb-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">
          {editing ? "Personalizar dashboard" : "Dashboard"}
        </h2>
        {editing ? (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetLayouts}
              className="flex items-center gap-1 h-7 px-2"
            >
              <Maximize className="h-3.5 w-3.5" />
              <span className="text-xs">Restablecer</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 h-7 px-2"
            >
              <X className="h-3.5 w-3.5" />
              <span className="text-xs">Cancelar</span>
            </Button>
            <Button 
              size="sm" 
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 h-7 px-2"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="text-xs">Guardar</span>
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 h-7 px-2"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="text-xs">Personalizar dashboard</span>
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
          rowHeight={140}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={handleBreakpointChange}
          isDraggable={editing}
          isResizable={editing}
          margin={[12, 12]}
          containerPadding={[0, 0]}
        >
          {widgets.map((widget) => (
            <div key={widget.id} className="widget-container">
              <Card className="h-full shadow-sm hover:shadow-md transition-shadow overflow-hidden border-0">
                <CardHeader className="pb-2 px-5 pt-4 border-b border-gray-50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      {widget.icon}
                      <span>{widget.title}</span>
                    </CardTitle>
                    {editing && (
                      <div className="cursor-move text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
                        <GripVertical className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  {widget.description && (
                    <CardDescription className="text-xs mt-1 text-gray-500">{widget.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="px-5 py-3 overflow-auto h-[calc(100%-70px)]" style={{maxHeight: widget.minH ? `calc(${widget.minH * 140}px - 70px)` : 'none'}}>
                  {widget.content}
                </CardContent>
                {widget.footer && (
                  <CardFooter className="pt-0 pb-3 px-5 mt-auto border-t border-gray-50">
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

