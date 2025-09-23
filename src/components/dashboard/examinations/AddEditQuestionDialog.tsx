"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Question } from "@/types/question";
import {
  addQuestionToBank,
  updateQuestion,
} from "@/services/questionBankService";
import { useQuestionBankStore } from "@/store/questionBankStore";

const questionSchema = z
  .object({
    type: z.enum(["MCQ", "Essay", "FillInBlanks"]),
    questionText: z.string().min(1, "Question text is required"),
    marks: z.coerce.number().min(1, "Marks are required"),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    options: z.array(z.object({ value: z.string().min(1) })).optional(),
    correctAnswer: z.string().optional(),
  })
  .refine(
    (data) =>
      data.type !== "MCQ" ||
      (!!data.options && data.options.length >= 2 && !!data.correctAnswer),
    {
      message: "MCQ must have ≥2 options and a correct answer.",
      path: ["correctAnswer"],
    }
  )
  .refine(
    (data) => data.type !== "FillInBlanks" || !!data.correctAnswer?.trim(),
    {
      message: "Fill in the blanks must have a correct answer.",
      path: ["correctAnswer"],
    }
  );

type QuestionFormValues = z.infer<typeof questionSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
  question?: Question;
}

export function AddEditQuestionDialog({
  isOpen,
  onClose,
  bankId,
  question,
}: Props) {
  const { showToast } = useToast();
  const { fetchQuestionBankById } = useQuestionBankStore();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: question
      ? {
          type: question.type as "MCQ" | "Essay" | "FillInBlanks",
          questionText: question.questionText,
          marks: question.marks,
          difficulty: question.difficulty as "Easy" | "Medium" | "Hard",
          options:
            question.type === "MCQ"
              ? question.options?.map((opt) => ({ value: opt }))
              : undefined,
          correctAnswer:
            question.type === "Essay"
              ? undefined
              : String(question.correctAnswer || ""),
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

  const handleTypeChange = (value: "MCQ" | "Essay" | "FillInBlanks") => {
    const resetMap = {
      MCQ: {
        type: "MCQ",
        options: [{ value: "" }, { value: "" }],
        correctAnswer: "",
      },
      FillInBlanks: {
        type: "FillInBlanks",
        options: undefined,
        correctAnswer: "",
      },
      Essay: { type: "Essay", options: undefined, correctAnswer: undefined },
    };
    form.reset({ ...form.getValues(), ...resetMap[value] });
  };

  const onSubmit = async (values: QuestionFormValues) => {
    const payload: Omit<Question, "id"> = {
      type: values.type,
      questionText: values.questionText,
      marks: values.marks,
      difficulty: values.difficulty,
      options:
        values.type === "MCQ" ? values.options?.map((o) => o.value) : undefined,
      correctAnswer:
        values.type === "MCQ"
          ? values.options?.[Number(values.correctAnswer)]?.value
          : values.type === "FillInBlanks"
          ? values.correctAnswer
          : undefined,
    };

    try {
      const res = question
        ? await updateQuestion(bankId, question.id, payload)
        : await addQuestionToBank(bankId, [payload]);

      if (res.success) {
        showToast({
          title: "Success",
          message: `Question ${question ? "updated" : "added"}!`,
          type: "success",
        });
        fetchQuestionBankById(bankId);
        onClose();
        form.reset();
      } else {
        throw new Error(res.message || "Failed to save question.");
      }
    } catch (err) {
      showToast({
        title: "Error",
        message: err instanceof Error ? err.message : "Unexpected error",
        type: "error",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{question ? "Edit" : "Add"} Question</DialogTitle>
          <DialogDescription>
            Fill in the details for the question.
          </DialogDescription>
        </DialogHeader>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="question-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pb-4"
            >
              {/* Type selector */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={handleTypeChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MCQ">Multiple Choice</SelectItem>
                        <SelectItem value="Essay">Essay</SelectItem>
                        <SelectItem value="FillInBlanks">
                          Fill in the Blanks
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Question text */}
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the question text"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* MCQ block */}
              {questionType === "MCQ" && (
                <div className="rounded-md border p-4 space-y-3">
                  <FormLabel>Options</FormLabel>
                  <FormField
                    control={form.control}
                    name="correctAnswer"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-2"
                      >
                        {fields.map((item, i) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3"
                          >
                            <RadioGroupItem value={String(i)} />
                            <FormField
                              control={form.control}
                              name={`options.${i}.value`}
                              render={({ field: optionField }) => (
                                <FormControl>
                                  <Input
                                    {...optionField}
                                    placeholder={`Option ${i + 1}`}
                                  />
                                </FormControl>
                              )}
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => remove(i)}
                              disabled={fields.length <= 2}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => append({ value: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                </div>
              )}

              {/* Fill in blanks block */}
              {questionType === "FillInBlanks" && (
                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answer</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter correct answer"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Marks + Difficulty */}
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
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        {/* fixed footer */}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            form="question-form"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
