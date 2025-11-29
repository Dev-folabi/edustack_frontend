"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/Toast";
import { saveManualResults } from "@/services/examService";
import { useStudentStore } from "@/store/studentStore";

interface ImportResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paperId: string;
}

export const ImportResultsDialog = ({
  isOpen,
  onClose,
  paperId,
}: ImportResultsDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setUploading] = useState(false);
  const { students } = useStudentStore();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please select a file to upload.",
      });
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").slice(1); // Skip header

      const results = lines
        .map((line) => {
          const [admissionNumber, marks] = line.split(",");
          const student = students.find(
            (s) => s.admissionNumber === Number(admissionNumber)
          );
          if (student) {
            return { studentId: student.id, marks: Number(marks) };
          }
          return null;
        })
        .filter((r) => r !== null) as { studentId: string; marks: number }[];

      try {
        await saveManualResults(paperId, results);
        showToast({
          type: "success",
          title: "Success",
          message: "Results imported successfully!",
        });
        onClose();
      } catch (error) {
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to import results.",
        });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Results</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-add results for this exam paper.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
          <a
            href="/results_template.csv"
            download
            className="text-sm text-blue-600 hover:underline"
          >
            Download sample CSV template
          </a>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Upload and Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
