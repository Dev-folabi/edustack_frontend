"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { studentService } from "@/services/studentService";
import { Student, StudentRegistrationPayload } from "@/types/student";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ADMINS_ROLES, UserRole } from "@/constants/roles";
import { sessionService, Session, Term } from "@/services/sessionService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Skeleton } from "@/components/ui/skeleton";
import withAuth from "@/components/withAuth";
import { classService, Class, ClassSection } from "@/services/classService";
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Users,
  GraduationCap,
  FileText,
  Heart,
  Edit3,
  Save,
  X,
} from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }).optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  name: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  dob: z.date().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  admission_date: z.date().optional(),
  religion: z.string().optional(),
  blood_group: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  father_occupation: z.string().optional(),
  mother_occupation: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal("")),
});

const StudentProfilePage = () => {
  const params = useParams();
  const { selectedSchool } = useAuthStore();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const canDownloadReport =
    selectedSchool && ADMINS_ROLES.includes(selectedSchool.role as UserRole);

  const canEditStudent =
    selectedSchool && ADMINS_ROLES.includes(selectedSchool.role as UserRole);

  const { showToast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const selectedClassId = form.watch("classId");

  useEffect(() => {
    if (studentId || isUpdated) {
      studentService
        .getStudentById(studentId)
        .then((res) => {
          const studentData = res.data;
          setStudent(studentData || null);
          setIsUpdated(false);
          setIsEditing(false);

          // Set form values when student data is loaded
          if (studentData) {
            form.reset({
              ...studentData,
              dob: new Date(studentData.dob),
              admission_date: new Date(studentData.admission_date),
              classId: studentData.class?.id || "",
              sectionId: studentData.section?.id || "",
            });
          }
        })
        .catch((err) =>
          showToast({
            type: "error",
            title: "Error",
            message: err.message || "Failed to fetch student details.",
          })
        )
        .finally(() => setIsLoading(false));
    }

    if (canDownloadReport) {
      sessionService.getSessions().then((res) => setSessions(res.data.data));
    }
  }, [studentId, canDownloadReport, form, isUpdated]);

  useEffect(() => {
    if (selectedSchool?.schoolId && canEditStudent) {
      classService.getClasses(selectedSchool.schoolId).then((res) => {
        if (res.data) {
          setClasses(res.data.data);
        }
      });
    }
  }, [selectedSchool?.schoolId, canEditStudent]);

  useEffect(() => {
    if (selectedClassId) {
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      setSections(selectedClass?.sections || []);
    }
  }, [selectedClassId, classes]);

  useEffect(() => {
    if (selectedSessionId) {
      const selectedSession = sessions.find((s) => s.id === selectedSessionId);
      setTerms(selectedSession?.terms || []);
      setSelectedTermId("");
    }
  }, [selectedSessionId, sessions]);

  const handleDownloadReport = async () => {
    if (!selectedSessionId || !selectedTermId) {
      showToast({
        type: "error",
        title: "Error",
        message: "Please select a session and term to generate the report.",
      });
      return;
    }
    setIsDownloading(true);
    try {
      const res = await studentService.getStudentTermReport(
        studentId,
        selectedTermId,
        selectedSessionId
      );
      const blob = res.data;
      if (!blob) {
        showToast({
          type: "error",
          title: "Error",
          message: "Failed to download report.",
        });
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${student?.name}_term_report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast({
        type: "success",
        title: "Success",
        message: "Report downloaded successfully.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to download report.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackToProfiles = () => {
    window.location.href = "/student-management/profiles";
  };

  const handleEditToggle = () => {
    if (isEditing && student) {
      form.reset({
        ...student,
        dob: student.dob ? new Date(student.dob) : undefined,
        admission_date: student.admission_date
          ? new Date(student.admission_date)
          : undefined,
        classId: student.class?.id || "",
        sectionId: student.section?.id || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!student) return;
    setIsSaving(true);
    const payload: Partial<StudentRegistrationPayload> = {
      ...values,
      dob: values.dob ? values.dob.toISOString().split("T")[0] : undefined,
      admission_date: values.admission_date
        ? values.admission_date.toISOString().split("T")[0]
        : undefined,
    };

    try {
      await studentService.updateStudent(student.id, payload);
      setIsUpdated(true);
      showToast({
        type: "success",
        title: "Success",
        message: "Student updated successfully!",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update student.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Student Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The requested student profile could not be found. Please check the
            student ID and try again.
          </p>
          <Button onClick={handleBackToProfiles} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Student Profiles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBackToProfiles}
            className="flex items-center gap-2 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profiles
          </Button>
          <div className="flex items-center gap-4">
            {canEditStudent && (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={handleEditToggle}
                      variant="outline"
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleEditToggle}
                    variant="outline"
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              Student Profile
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Header Card */}
            <Card className="bg-white shadow-xl rounded-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-24"></div>
              <CardContent className="p-8 -mt-12 relative">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                  <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl">
                    <AvatarImage src={student.photo_url} alt={student.name} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {student.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    {isEditing ? (
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                className="text-3xl font-bold text-gray-800 border-0 bg-transparent p-0 focus:ring-0 focus:border-b-2 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-gray-800">
                        {student.name}
                      </h1>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Admission: {student.admission_number}
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {student.enrollment.class} -{" "}
                        {student.enrollment.section}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          student.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information Cards */}
            <div className="space-y-6">
              {/* Personal Information */}
              <Card className="bg-white shadow-lg rounded-2xl border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isEditing ? (
                      <>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <EditableField label="Email" icon={Mail}>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <EditableField label="Username" icon={User}>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <EditableField label="Phone" icon={Phone}>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <EditableField label="Gender" icon={User}>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dob"
                          render={({ field }) => (
                            <EditableField
                              label="Date of Birth"
                              icon={Calendar}
                            >
                              <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                              />
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="religion"
                          render={({ field }) => (
                            <EditableField label="Religion" icon={Heart}>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="blood_group"
                          render={({ field }) => (
                            <EditableField label="Blood Group" icon={Heart}>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <InfoItem
                          icon={Mail}
                          label="Email"
                          value={student.email}
                        />
                        <InfoItem
                          icon={User}
                          label="Username"
                          value={student.username}
                        />
                        <InfoItem
                          icon={Phone}
                          label="Phone"
                          value={student.phone}
                        />
                        <InfoItem
                          icon={User}
                          label="Gender"
                          value={student.gender}
                        />
                        <InfoItem
                          icon={Calendar}
                          label="Date of Birth"
                          value={new Date(student.dob).toLocaleDateString()}
                        />
                        <InfoItem
                          icon={Heart}
                          label="Religion"
                          value={student.religion}
                        />
                        <InfoItem
                          icon={Heart}
                          label="Blood Group"
                          value={student.blood_group || "N/A"}
                        />
                      </>
                    )}
                    <InfoItem
                      icon={Calendar}
                      label="Created At"
                      value={new Date(student.createdAt).toLocaleDateString()}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card className="bg-white shadow-lg rounded-2xl border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isEditing ? (
                      <>
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <EditableField label="Address" icon={MapPin}>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <EditableField label="City" icon={MapPin}>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <EditableField label="State" icon={MapPin}>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <EditableField label="Country" icon={MapPin}>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <InfoItem
                          icon={MapPin}
                          label="Address"
                          value={student.address}
                        />
                        <InfoItem
                          icon={MapPin}
                          label="City"
                          value={student.city || "N/A"}
                        />
                        <InfoItem
                          icon={MapPin}
                          label="State"
                          value={student.state || "N/A"}
                        />
                        <InfoItem
                          icon={MapPin}
                          label="Country"
                          value={student.country || "N/A"}
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Academic Details */}
              <Card className="bg-white shadow-lg rounded-2xl border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    Academic Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isEditing ? (
                      <>
                        <FormField
                          control={form.control}
                          name="admission_date"
                          render={({ field }) => (
                            <EditableField
                              label="Admission Date"
                              icon={Calendar}
                            >
                              <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                              />
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="classId"
                          render={({ field }) => (
                            <EditableField label="Class" icon={GraduationCap}>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {classes.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sectionId"
                          render={({ field }) => (
                            <EditableField label="Section" icon={GraduationCap}>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!selectedClassId}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a section" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {sections.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <InfoItem
                          icon={Calendar}
                          label="Admission Date"
                          value={new Date(
                            student.admission_date
                          ).toLocaleDateString()}
                        />
                        <InfoItem
                          icon={GraduationCap}
                          label="Class"
                          value={student.enrollment.class}
                        />
                        <InfoItem
                          icon={GraduationCap}
                          label="Section"
                          value={student.enrollment.section}
                        />
                      </>
                    )}
                    <InfoItem
                      icon={GraduationCap}
                      label="Session"
                      value={student.enrollment.session}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Parent Details */}
              <Card className="bg-white shadow-lg rounded-2xl border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <Users className="w-5 h-5 text-orange-600" />
                    Parent Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isEditing ? (
                      <>
                        <FormField
                          control={form.control}
                          name="father_name"
                          render={({ field }) => (
                            <EditableField label="Father's Name" icon={User}>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="father_occupation"
                          render={({ field }) => (
                            <EditableField
                              label="Father's Occupation"
                              icon={User}
                            >
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mother_name"
                          render={({ field }) => (
                            <EditableField label="Mother's Name" icon={User}>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mother_occupation"
                          render={({ field }) => (
                            <EditableField
                              label="Mother's Occupation"
                              icon={User}
                            >
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </EditableField>
                          )}
                        />
                      </>
                    ) : (
                      <>
                        <InfoItem
                          icon={User}
                          label="Father's Name"
                          value={student.father_name}
                        />
                        <InfoItem
                          icon={User}
                          label="Father's Occupation"
                          value={student.father_occupation}
                        />
                        <InfoItem
                          icon={User}
                          label="Mother's Name"
                          value={student.mother_name}
                        />
                        <InfoItem
                          icon={User}
                          label="Mother's Occupation"
                          value={student.mother_occupation}
                        />
                      </>
                    )}
                    <InfoItem
                      icon={User}
                      label="Parent Contact Name"
                      value={student.parentDetails?.name || "N/A"}
                    />
                    <InfoItem
                      icon={Phone}
                      label="Parent Phone"
                      value={student.parentDetails?.phone || "N/A"}
                    />
                    <InfoItem
                      icon={Mail}
                      label="Parent Email"
                      value={student.parentDetails?.email || "N/A"}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>

        {/* Report Generation */}
        {canDownloadReport && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg rounded-2xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <FileText className="w-5 h-5 text-blue-600" />
                Generate Student Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Session
                    </label>
                    <Select
                      onValueChange={setSelectedSessionId}
                      value={selectedSessionId}
                    >
                      <SelectTrigger className="bg-white shadow-sm">
                        <SelectValue placeholder="Select Session" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Term
                    </label>
                    <Select
                      onValueChange={setSelectedTermId}
                      value={selectedTermId}
                      disabled={!selectedSessionId}
                    >
                      <SelectTrigger className="bg-white shadow-sm">
                        <SelectValue placeholder="Select Term" />
                      </SelectTrigger>
                      <SelectContent>
                        {terms.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleDownloadReport}
                  disabled={isDownloading || !selectedTermId}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? "Generating..." : "Download Report"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Helper component for consistent info display
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm text-gray-800 mt-0.5 break-words">{value}</p>
    </div>
  </div>
);

// Helper component for editable fields
const EditableField = ({ icon: Icon, label, children }) => (
  <FormItem className="flex flex-col">
    <FormLabel className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
      <Icon className="w-4 h-4 text-gray-400" />
      {label}
    </FormLabel>
    {children}
  </FormItem>
);

export default withAuth(StudentProfilePage, [UserRole.ADMIN, UserRole.TEACHER]);
