"use client";

import { useState } from "react";
import { Class, ClassSection } from "@/services/classService";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { SectionItem } from "./SectionItem";
import { EditSectionModal } from "./EditSectionModal";

interface ClassItemProps {
  classData: Class;
  onEdit: (classData: Class) => void;
  onDelete: (classId: string) => void;
}

export const ClassItem = ({ classData, onEdit, onDelete }: ClassItemProps) => {
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ClassSection | null>(null);

  const handleEditSection = (section: ClassSection) => {
    setSelectedSection(section);
    setIsEditSectionModalOpen(true);
  };

  const closeEditSectionModal = () => {
    setIsEditSectionModalOpen(false);
    setSelectedSection(null);
  };

  return (
    <div className="p-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => onEdit(classData)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Class
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(classData.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Class
        </Button>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Sections</h4>
        <div className="border rounded-md">
          {classData.sections.length > 0 ? (
            classData.sections.map((section) => (
              <SectionItem
                key={section.id}
                section={section}
                onEdit={handleEditSection}
              />
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">
              No sections found for this class.
            </p>
          )}
        </div>
      </div>
      {selectedSection && (
        <EditSectionModal
          isOpen={isEditSectionModalOpen}
          onClose={closeEditSectionModal}
          section={selectedSection}
        />
      )}
    </div>
  );
};
