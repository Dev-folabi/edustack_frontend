import { Button } from "./button";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface CustomButtonProps {
  onClick: () => void;
  children: ReactNode;
  icon?: React.ElementType;
  className?: string;
}

export function CustomButton({ onClick, children, icon: Icon, className }: CustomButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-500 
        hover:from-blue-600 hover:via-indigo-600 hover:to-indigo-600 
        text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold shadow-lg 
        hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${className}`}
    >
      {Icon && <Icon className="mr-2 h-5 w-5" />}
      {children}
    </Button>
  );
}