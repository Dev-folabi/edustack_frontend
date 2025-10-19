"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import TermReport from "@/components/dashboard/reports/TermReport";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  studentName: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  studentName,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `${studentName}_Report_${new Date().toISOString().split("T")[0]}`,
  });

  if (!reportData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              Term Report - {studentName}
            </DialogTitle>
            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="default" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <Button onClick={onClose} variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div ref={reportRef}>
            <TermReport reportData={reportData} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};