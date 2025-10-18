"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useExamStore } from "@/store/examStore";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResultsTable } from "@/components/dashboard/examinations/ResultsTable";
import { Save, Eye, EyeOff } from "lucide-react";
import { useStudentStore } from "@/store/studentStore";
import {
  saveManualResults,
  publishResults,
  finalizeCbtResult,
} from "@/services/examService";
import { toast } from "sonner";
import { getPsychomotorSkills } from "@/services/examSettingsService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/BackButton";
import { Attempt } from "@/types/exam";

interface PsychomotorSkill {
  id: string;
  name: string;
  description: string;
}

const ResultEntryPage = () => {
  const params = useParams();
  const paperId = params.paperId as string;
  const {
    selectedPaper,
    fetchExamPaperById,
    loading: examLoading,
    error: examError,
  } = useExamStore();
  const {
    students,
    fetchStudentsBySection,
    loading: studentsLoading,
    error: studentsError,
  } = useStudentStore();
  const { selectedSchool } = useAuthStore();

  const [scores, setScores] = useState<{
    [studentId: string]: number;
  }>({});

  const [psychomotorSkills, setPsychomotorSkills] = useState<
    PsychomotorSkill[]
  >([]);
  const [psychomotorScores, setPsychomotorScores] = useState<{
    [studentId: string]: { [skillId: string]: number };
  }>({});

  const [showPsychomotor, setShowPsychomotor] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isPublishing, setPublishing] = useState(false);
  // const [isImportDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => {
    if (paperId) {
      fetchExamPaperById(paperId);
    }
  }, [paperId, fetchExamPaperById]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedPaper && selectedSchool && selectedPaper?.exam?.section?.id) {
        await fetchStudentsBySection(
          selectedSchool.schoolId,
          selectedPaper?.exam?.section?.id
        );

        // Prefill scores from existing attempts
        const initialScores: { [key: string]: number } = {};
        selectedPaper?.attempts?.forEach((attempt: Attempt) => {
          if (attempt.totalScore !== null && attempt.totalScore !== undefined) {
            initialScores[attempt.studentId] = attempt.totalScore;
          }
        });
        setScores(initialScores);

        // Fetch psychomotor skills
        try {
          const psychomotorRes = await getPsychomotorSkills();
          setPsychomotorSkills(psychomotorRes.data || []);
        } catch (error) {
          console.error("Failed to fetch psychomotor skills:", error);
        }
      }
    };
    fetchData();
  }, [selectedPaper, selectedSchool, fetchStudentsBySection]);

  const handleScoreChange = (studentId: string, value: number) => {
    setScores((prev) => ({ ...prev, [studentId]: value }));
  };

  const handlePsychomotorChange = (
    studentId: string,
    skillId: string,
    value: string
  ) => {
    const numValue = value === "" ? 0 : Number(value);
    setPsychomotorScores((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [skillId]: numValue,
      },
    }));
  };

  const handleSaveResults = async () => {
    if (!selectedPaper || selectedPaper.mode !== "PaperBased") return;

    setSaving(true);
    try {
      const studentMarks = students
        .filter((student) => scores[student?.studentId || ""] !== undefined)
        .map((student) => {
          const studentId = student?.studentId || "";
          const payload: any = {
            studentId,
            marksObtained: scores[studentId] || 0,
          };

          if (showPsychomotor && psychomotorScores[studentId]) {
            payload.psychomotorAssessments = Object.keys(
              psychomotorScores[studentId]
            )
              .filter((skillId) => psychomotorScores[studentId][skillId] > 0)
              .map((skillId) => ({
                skillId,
                rating: psychomotorScores[studentId][skillId],
              }));
          }

          return payload;
        });

      if (studentMarks.length === 0) {
        toast.warning("No marks to save.");
        return;
      }

      await saveManualResults({
        examPaperId: selectedPaper?.id || "",
        termId: selectedPaper?.exam?.term?.id || "",
        sessionId: selectedPaper?.exam?.session?.id || "",
        studentMarks,
      });

      toast.success("Results saved successfully!");
      await fetchExamPaperById(paperId);
    } catch (error) {
      toast.error("Failed to save results.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCbtFinalize = async () => {
    if (!selectedPaper || selectedPaper.mode !== "CBT") return;
    setSaving(true);
    try {
      await finalizeCbtResult(selectedPaper?.id || "");
      toast.success("CBT results finalized successfully!");
      await fetchExamPaperById(paperId);
    } catch (error) {
      toast.error("Failed to finalize CBT results.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishResults = async () => {
    if (!selectedPaper) return;
    setPublishing(true);
    try {
      await publishResults(paperId, !selectedPaper.isResultPublished);
      toast.success(
        `Results ${
          !selectedPaper.isResultPublished ? "published" : "unpublished"
        } successfully!`
      );
      await fetchExamPaperById(paperId);
    } catch (error) {
      toast.error("Failed to update results status.");
    } finally {
      setPublishing(false);
    }
  };

  const loading = examLoading || studentsLoading;
  const error = examError || studentsError;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!selectedPaper) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground text-lg">No exam paper found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <BackButton />
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {selectedPaper.subject?.name} - Result Entry
              </CardTitle>
              <CardDescription className="text-base">
                {selectedPaper.exam?.title} | {selectedPaper.exam?.class?.name}{" "}
                {selectedPaper.exam?.section?.name}
              </CardDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">Mode: {selectedPaper.mode}</Badge>
                <Badge variant="outline">
                  Max Marks: {selectedPaper.maxMarks}
                </Badge>
                <Badge variant="outline">
                  {selectedPaper.exam?.term?.name}
                </Badge>
                <Badge variant="outline">
                  {selectedPaper.exam?.session?.name}
                </Badge>
                {selectedPaper.isResultPublished && (
                  <Badge variant="default" className="bg-green-600">
                    Published
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* {selectedPaper.mode === "PaperBased" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportDialogOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              )} */}

              {selectedPaper.mode === "PaperBased" ? (
                <Button
                  onClick={handleSaveResults}
                  disabled={isSaving}
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Results"}
                </Button>
              ) : (
                <Button
                  onClick={handleCbtFinalize}
                  disabled={isSaving}
                  size="sm"
                >
                  {isSaving ? "Finalizing..." : "Finalize Results"}
                </Button>
              )}

              <Button
                onClick={handlePublishResults}
                disabled={isPublishing}
                variant={
                  selectedPaper.isResultPublished ? "destructive" : "default"
                }
                size="sm"
              >
                {selectedPaper.isResultPublished ? (
                  <EyeOff className="mr-2 h-4 w-4" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                {isPublishing
                  ? selectedPaper.isResultPublished
                    ? "Unpublishing..."
                    : "Publishing..."
                  : selectedPaper.isResultPublished
                  ? "Unpublish"
                  : "Publish"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
          <CardDescription>
            Enter marks for {students.length} student(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResultsTable
            paper={selectedPaper}
            students={students}
            scores={scores}
            onScoreChange={handleScoreChange}
          />
        </CardContent>
      </Card>

      {/* Psychomotor Section */}
      {selectedPaper.mode === "PaperBased" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Psychomotor Assessments</CardTitle>
                <CardDescription>
                  Optional behavioral and skill assessments
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="psychomotor-toggle"
                  checked={showPsychomotor}
                  onCheckedChange={setShowPsychomotor}
                />
                <Label htmlFor="psychomotor-toggle">Enable</Label>
              </div>
            </div>
          </CardHeader>

          {showPsychomotor && (
            <CardContent>
              <div className="rounded-lg border bg-amber-50 p-4 mb-4">
                <p className="text-sm text-amber-800">
                  ⚠️ <strong>Note:</strong> Psychomotor assessments are
                  typically required for final term exams, not for tests or
                  mid-term assessments.
                </p>
              </div>

              {psychomotorSkills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No psychomotor skills configured. Please add skills in
                  settings.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">
                          Student Name
                        </TableHead>
                        {psychomotorSkills.map((skill) => (
                          <TableHead
                            key={skill.id}
                            className="text-center min-w-[120px]"
                          >
                            {skill.name}
                            <br />
                            <span className="text-xs text-muted-foreground font-normal">
                              (1-5 scale)
                            </span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student?.id}>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          {psychomotorSkills.map((skill) => {
                            const val =
                              psychomotorScores[student?.studentId || ""]?.[
                                skill.id
                              ] ?? "";
                            return (
                              <TableCell key={skill.id}>
                                <Input
                                  type="number"
                                  max={5}
                                  min={1}
                                  value={val}
                                  onChange={(e) =>
                                    handlePsychomotorChange(
                                      student?.studentId || "",
                                      skill.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-20 text-center"
                                  placeholder="1-5"
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* <ImportResultsDialog
        isOpen={isImportDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        paperId={paperId}
      /> */}
    </div>
  );
};

export default withAuth(ResultEntryPage, [UserRole.ADMIN, UserRole.TEACHER]);
