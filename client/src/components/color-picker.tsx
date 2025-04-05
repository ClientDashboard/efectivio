import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  // Mantiene una copia interna del color para mostrar en la vista previa
  const [internalColor, setInternalColor] = useState(color);
  
  // Actualiza el color interno cuando la prop color cambia
  useEffect(() => {
    setInternalColor(color);
  }, [color]);
  
  // Maneja cambios en el color
  const handleColorChange = (newColor: string) => {
    setInternalColor(newColor);
  };
  
  // Aplica el cambio al cerrar el popover
  const handleColorChangeComplete = () => {
    onChange(internalColor);
  };
  
  // Colores preestablecidos
  const presetColors = [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Ámbar
    '#EF4444', // Rojo
    '#8B5CF6', // Violeta
    '#EC4899', // Rosa
    '#6B7280', // Gris
    '#000000', // Negro
  ];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between min-h-10 h-auto py-2"
        >
          <div className="flex items-center space-x-2">
            <div
              className="h-5 w-5 rounded-md border"
              style={{ backgroundColor: color }}
            />
            <span>{color}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          <HexColorPicker
            color={internalColor}
            onChange={handleColorChange}
          />
          
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md border" style={{ backgroundColor: internalColor }} />
            <HexColorInput
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              color={internalColor}
              onChange={handleColorChange}
              prefixed
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                className="h-6 w-6 rounded-md border border-gray-200 flex items-center justify-center"
                style={{ backgroundColor: presetColor }}
                onClick={() => handleColorChange(presetColor)}
                aria-label={`Color ${presetColor}`}
              >
                {internalColor.toLowerCase() === presetColor.toLowerCase() && 
                  <Check className="h-4 w-4 text-white" />
                }
              </button>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button 
              size="sm"
              onClick={handleColorChangeComplete}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}