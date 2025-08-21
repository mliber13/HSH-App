import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NavigationDropdown = ({ 
  label, 
  icon: Icon, 
  items, 
  currentView, 
  onSelect,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    onSelect(value);
    setIsOpen(false);
  };

  const isActive = items.some(item => item.value === currentView);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={`w-24 md:w-36 h-12 md:h-16 text-xs md:text-sm leading-tight flex items-center justify-between ${isActive ? 'bg-white text-brandPrimary' : 'text-white hover:bg-white/20'} ${className}`}
        >
          <div className="flex items-center">
            <Icon className="h-5 w-5 md:h-8 md:w-8 mr-1 md:mr-3 flex-shrink-0" />
            <div className="text-center">
              {label}
            </div>
          </div>
          <ChevronDown className="h-2 w-2 md:h-3 md:w-3 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => handleSelect(item.value)}
            className={`flex items-center space-x-2 cursor-pointer ${
              currentView === item.value ? 'bg-brandPrimary/10 text-brandPrimary' : ''
            }`}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavigationDropdown;
