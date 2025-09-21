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
import { toast } from "sonner";
import { useQuestionBankStore } from "@/store/questionBankStore";
import { bulkAddQuestionsToBank } from "@/services/questionBankService";
import { Question } from "@/types/question";

interface ImportQuestionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
}

export const ImportQuestionsDialog = ({ isOpen, onClose, bankId }: ImportQuestionsDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setUploading] = useState(false);
  const { fetchQuestionBankById } = useQuestionBankStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header
      const questions: Partial<Question>[] = lines.map(line => {
        const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
        const matches = line.match(regex) || [];
        const [type, questionText, marks, difficulty, options, correctAnswer] = matches.map(m => m.replace(/"/g, ''));

        const question: Partial<Question> = {
          type: type as any,
          questionText,
          marks: Number(marks),
          difficulty: difficulty as any,
          options: options ? options.split(',') : undefined,
          correctAnswer,
        };
        return question;
      }).filter(q => q.questionText);

      try {
        await bulkAddQuestionsToBank(bankId, questions);
        toast.success("Questions imported successfully!");
        fetchQuestionBankById(bankId);
        onClose();
      } catch (error) {
        toast.error("Failed to import questions.");
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
          <DialogTitle>Import Questions</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-add questions to this question bank.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
          </div>
          <a href="/questions_template.csv" download className="text-sm text-blue-600 hover:underline">
            Download sample CSV template
          </a>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Upload and Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
