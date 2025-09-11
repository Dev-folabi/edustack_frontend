"use client";

import { ClassSection } from "@/services/classService";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface SectionItemProps {
  section: ClassSection;
  onEdit: (section: ClassSection) => void;
}

export const SectionItem = ({ section, onEdit }: SectionItemProps) => {
  return (
    <div className="flex justify-between items-center p-3 border-b last:border-b-0">
      <div>
        <span className="font-medium">{section.name}</span>
        <p className="text-sm text-muted-foreground">
          Class Teacher: {section.class_teacher?.name || "Not Assigned"}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onEdit(section)}>
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
};
