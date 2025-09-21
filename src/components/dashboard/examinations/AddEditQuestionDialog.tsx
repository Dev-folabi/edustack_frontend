"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Question } from "@/types/question";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { addQuestionToBank, updateQuestion } from "@/services/questionBankService";
import { useQuestionBankStore } from "@/store/questionBankStore";
import { PlusCircle, Trash2 } from "lucide-react";

const questionSchema = z.object({
  type: z.enum(["MCQ", "ESSAY", "FILL_IN_BLANKS"]),
  questionText: z.string().min(1, "Question text is required"),
  marks: z.coerce.number().min(1, "Marks are required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  options: z.array(z.object({ value: z.string().min(1, "Option cannot be empty") })).optional(),
  correctAnswer: z.any().optional(),
}).refine(data => {
    if (data.type === 'MCQ') {
        return !!data.options && data.options.length >= 2 && data.correctAnswer !== undefined;
    }
    return true;
}, {
    message: "MCQ questions must have at least 2 options and a correct answer.",
    path: ["options"],
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface AddEditQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
  question?: Question;
}

export const AddEditQuestionDialog = ({ isOpen, onClose, bankId, question }: AddEditQuestionDialogProps) => {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: question || {
      type: "MCQ",
      questionText: "",
      marks: 1,
      difficulty: "MEDIUM",
      options: [{ value: "" }, { value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const questionType = form.watch("type");

  const { fetchQuestionBankById } = useQuestionBankStore();

  const onSubmit = async (values: QuestionFormValues) => {
    try {
      const response = question
        ? await updateQuestion(bankId, question.id, values)
        : await addQuestionToBank(bankId, values);

      if (response.success) {
        toast.success(`Question ${question ? 'updated' : 'added'} successfully!`);
        fetchQuestionBankById(bankId);
        onClose();
      } else {
        toast.error(response.message || "Failed to save question");
      }
    } catch (error) {
      toast.error("An error occurred while saving the question.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{question ? "Edit" : "Add"} Question</DialogTitle>
          <DialogDescription>
            Fill in the details for the question.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                      <SelectItem value="ESSAY">Essay</SelectItem>
                      <SelectItem value="FILL_IN_BLANKS">Fill in the Blanks</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the question text here" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {questionType === 'MCQ' && (
              <div className="space-y-4 p-4 border rounded-md">
                <FormLabel>Options</FormLabel>
                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                          {fields.map((item, index) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name={`options.${index}.value`}
                              render={({ field: optionField }) => (
                                <FormItem className="flex items-center space-x-3">
                                  <FormControl>
                                    <RadioGroupItem value={String(index)} />
                                  </FormControl>
                                  <Input {...optionField} placeholder={`Option ${index + 1}`} />
                                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </FormItem>
                              )}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            )}

            {questionType === 'FILL_IN_BLANKS' && (
              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the correct answer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Question"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
