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
import { useQuestionBankStore } from "@/store/questionBankStore";
import { addQuestionToBank } from "@/services/questionBankService";
import { Question, QuestionDifficulty, QuestionType } from "@/types/question";

interface ImportQuestionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
}

export const ImportQuestionsDialog = ({
  isOpen,
  onClose,
  bankId,
}: ImportQuestionsDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setUploading] = useState(false);
  const { fetchQuestionBankById } = useQuestionBankStore();
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
        title: "Import Error",
        message: "Please select a file to upload.",
      });
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").slice(1); // Skip header
      const questions: Omit<Question, 'id'>[] = lines
        .map((line) => {
          const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
          const matches = line.match(regex) || [];
          const [
            type,
            questionText,
            marks,
            difficulty,
            options,
            correctAnswer,
          ] = matches.map((m) => m.replace(/"/g, ""));

          const question: Partial<Question> = {
            type: type as QuestionType,
            questionText,
            marks: Number(marks),
            difficulty: difficulty as QuestionDifficulty,
            options: options ? options.split(",") : undefined,
            correctAnswer,
          };
          return question;
        })
        .filter((q) => q.questionText) as Omit<Question, 'id'>[]; // Cast here

      try {
        await addQuestionToBank(bankId, questions); // Removed the extra array wrapper
        showToast({
          type: "success",
          title: "Import Success",
          message: "Questions imported successfully!",
        });
        fetchQuestionBankById(bankId);
        onClose();
      } catch (error) {
        showToast({
          type: "error",
          title: "Import Error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to import questions.",
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
          <DialogTitle>Import Questions</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-add questions to this question bank.
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
            href="/questions_template.csv"
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
