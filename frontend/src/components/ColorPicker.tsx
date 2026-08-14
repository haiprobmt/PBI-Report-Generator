import { useState, useEffect } from 'react';
import { Pencil } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { isValidHexColor, normalizeHexColor } from '@/lib/themeUtils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    const normalized = normalizeHexColor(newValue);
    if (isValidHexColor(normalized)) {
      onChange(normalized);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value.toUpperCase();
    setInputValue(color);
    onChange(color);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              className="relative w-14 h-10 rounded-md border-2 border-border hover:border-accent transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group overflow-hidden"
              style={{ backgroundColor: value }}
              aria-label={`Pick color for ${label}`}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                <Pencil className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={18} weight="bold" />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`color-${label}`} className="text-xs">Pick Color</Label>
                <input
                  id={`color-${label}`}
                  type="color"
                  value={value}
                  onChange={handleColorChange}
                  className="w-full h-32 rounded-md cursor-pointer mt-2"
                />
              </div>
              <div>
                <Label htmlFor={`hex-${label}`} className="text-xs">Hex Value</Label>
                <Input
                  id={`hex-${label}`}
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="mt-1 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
