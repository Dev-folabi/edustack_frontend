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
import { useToast } from "@/components/ui/Toast";
import { Question } from "@/types/question";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  addQuestionToBank,
  updateQuestion,
} from "@/services/questionBankService";
import { useQuestionBankStore } from "@/store/questionBankStore";
import { PlusCircle, Trash2 } from "lucide-react";

const questionSchema = z
  .object({
    type: z.enum(["MCQ", "Essay", "FillInBlanks"]),
    questionText: z.string().min(1, "Question text is required"),
    marks: z.coerce.number().min(1, "Marks are required"),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    options: z
      .array(z.object({ value: z.string().min(1, "Option cannot be empty") }))
      .optional(),
    correctAnswer: z.any().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "MCQ") {
        return (
          !!data.options &&
          data.options.length >= 2 &&
          data.correctAnswer !== undefined &&
          data.correctAnswer !== ""
        );
      }
      return true;
    },
    {
      message:
        "MCQ questions must have at least 2 options and a correct answer.",
      path: ["options"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "FillInBlanks") {
        return !!data.correctAnswer && data.correctAnswer !== "";
      }
      return true;
    },
    {
      message: "Fill in the blanks questions must have a correct answer.",
      path: ["correctAnswer"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "Essay") {
        return !data.options;
      }
      return true;
    },
    {
      message: "Essay questions should not have options.",
      path: ["options"],
    }
  );

type QuestionFormValues = z.infer<typeof questionSchema>;

interface AddEditQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
  question?: Question;
}

export const AddEditQuestionDialog = ({
  isOpen,
  onClose,
  bankId,
  question,
}: AddEditQuestionDialogProps) => {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema) as Resolver<QuestionFormValues>,
    defaultValues: question
      ? {
          type: question.type as "MCQ" | "Essay" | "FillInBlanks",
          questionText: question.questionText,
          marks: question.marks,
          difficulty: question.difficulty as "Easy" | "Medium" | "Hard",
          options: question.type === "MCQ" ? question.options : undefined,
          correctAnswer:
            question.type === "Essay" ? "" : question.correctAnswer,
        }
      : {
          type: "MCQ",
          questionText: "",
          marks: 1,
          difficulty: "Medium",
          options: [{ value: "" }, { value: "" }],
          correctAnswer: "",
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const questionType = form.watch("type");

  const { fetchQuestionBankById } = useQuestionBankStore();
  const { showToast } = useToast();

  const onSubmit = async (values: QuestionFormValues) => {
    const payload: Omit<Question, "id"> = {
      ...values,
      options:
        values.type === "MCQ"
          ? values.options?.map((opt) => opt.value)
          : undefined,
      correctAnswer:
        values.type === "MCQ"
          ? values.options?.[Number(values.correctAnswer)]?.value
          : values.type === "FillInBlanks"
          ? values.correctAnswer
          : undefined,
    };

    try {
      const response = question
        ? await updateQuestion(bankId, question.id, payload)
        : await addQuestionToBank(bankId, [payload]);

      if (response.success) {
        showToast({
          title: "Success",
          message: `Question ${question ? "updated" : "added"} successfully!`,
          type: "success",
        });
        fetchQuestionBankById(bankId);
        onClose();
      } else {
        showToast({
          title: "Error",
          message: response.message || "Failed to save question",
          type: "error",
        });
      }
    } catch (error) {
      showToast({
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while saving the question.",
        type: "error",
      });
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                      <SelectItem value="Essay">Essay</SelectItem>
                      <SelectItem value="FillInBlanks">
                        Fill in the Blanks
                      </SelectItem>
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
                    <Textarea
                      placeholder="Enter the question text here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {questionType === "MCQ" && (
              <div className="space-y-4 p-4 border rounded-md">
                <FormLabel>Options</FormLabel>
                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-2"
                        >
                          {fields.map((item, index) => (
                            <div key={item.id} className="flex items-center space-x-3">
                              <FormControl>
                                <RadioGroupItem value={String(index)} />
                              </FormControl>
                              <FormField
                                control={form.control}
                                name={`options.${index}.value`}
                                render={({ field: optionField }) => (
                                  <FormItem className="flex-grow">
                                    <FormControl>
                                      <Input
                                        {...optionField}
                                        placeholder={`Option ${index + 1}`}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                disabled={fields.length <= 2}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "" })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            )}

            {questionType === "FillInBlanks" && (
              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the correct answer"
                        {...field}
                      />
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
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
