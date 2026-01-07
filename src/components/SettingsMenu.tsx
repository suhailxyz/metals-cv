import React from 'react';
import { Settings, Save, FolderOpen, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

interface SettingsMenuProps {
  onExport: () => void;
  onImport: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onExport, onImport }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', color: 'bg-slate-200' },
    { value: 'dark', label: 'Dark', color: 'bg-slate-800' },
    { value: 'ocean', label: 'Ocean', color: 'bg-cyan-500' },
    { value: 'forest', label: 'Forest', color: 'bg-emerald-500' },
    { value: 'sunset', label: 'Sunset', color: 'bg-orange-500' },
  ];

  React.useEffect(() => {
    // Apply theme to document root
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
      // Also add/remove dark class for compatibility
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // For named themes, keep dark class for dark backgrounds
        document.documentElement.classList.add('dark');
      }
    }
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme || 'dark'} onValueChange={setTheme}>
              {themes.map((themeOption) => (
                <DropdownMenuRadioItem key={themeOption.value} value={themeOption.value} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${themeOption.color} border border-border`} />
                  {themeOption.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onExport}>
          <Save className="h-4 w-4 mr-2" />
          Backup
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onImport}>
          <FolderOpen className="h-4 w-4 mr-2" />
          Restore
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsMenu;

