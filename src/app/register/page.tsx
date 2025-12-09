"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import {
  authService,
  School,
  Class,
  Section,
} from "../../services/authService";
import { schoolService } from "../../services/schoolService";
import { useToast } from "../../components/ui/Toast";
import { Loader, ButtonLoader } from "../../components/ui/Loader";
import Link from "next/link";
import { COLORS } from "@/constants/config";

type UserType = "staff" | "student";
type StaffRole = "teacher" | "accountant" | "librarian";

// Blood group options array
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { checkOnboardingStatus } = useAuthStore();
  const { showToast } = useToast();

  const [userType, setUserType] = useState<UserType>("student");
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data for dropdowns
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // Form states
  const [staffData, setStaffData] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
    phone: [""],
    address: "",
    schoolId: "",
    role: "teacher" as StaffRole,
    designation: "",
    dob: "",
    salary: 0,
    joining_date: "",
    gender: "male" as "male" | "female",
    qualification: "",
    notes: "",
    classSectionId: "",
  });

  const [studentData, setStudentData] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
    schoolId: "",
    classId: "",
    sectionId: "",
    gender: "male" as "male" | "female",
    dob: "",
    phone: "",
    address: "",
    religion: "",
    blood_group: "",
    father_name: "",
    mother_name: "",
    father_occupation: "",
    mother_occupation: "",
    city: "",
    state: "",
    country: "",
    exist_guardian: false,
    guardian_name: "",
    guardian_phone: [""],
    guardian_emailOrUsername: "",
    guardian_email: "",
    guardian_username: "",
    guardian_password: "",
  });

  // Initial data loading
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const onboard = await checkOnboardingStatus();
        if (!onboard.isOnboarded) {
          router.push("/onboarding");
          return;
        }
        await loadSchools();
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };
    checkSystemStatus();
  }, [checkOnboardingStatus, router]);

  const loadSchools = async () => {
    try {
      const response = await schoolService.getSchools();
      if (
        !(response as any).success ||
        !(response as any).data ||
        !(response as any).data.data
      )
        return;
      setSchools((response as any).data?.data ?? []);
    } catch (error) {
      console.error("Error loading schools:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load schools.",
      });
    }
  };

  // Dynamic class loading
  useEffect(() => {
    const loadClasses = async () => {
      if (studentData.schoolId) {
        try {
          const response = await authService.getClasses(studentData.schoolId);
          if (response.success && response.data && response.data.data) {
            setClasses(response.data.data);
            setSections([]);
          } else {
            setClasses([]);
          }
        } catch (error) {
          console.error("Error loading classes:", error);
        }
      } else {
        setClasses([]);
        setSections([]);
      }
    };
    loadClasses();
  }, [studentData.schoolId]);

  // Dynamic section loading
  useEffect(() => {
    if (studentData.classId) {
      const selectedClass = classes.find((c) => c.id === studentData.classId);
      setSections(selectedClass?.sections || []);
    } else {
      setSections([]);
    }
  }, [studentData.classId, classes]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
    formType: "staff" | "student"
  ) => {
    const { name, value, type } = e.target;
    const isChecked = (e.target as HTMLInputElement).checked;

    if (formType === "staff") {
      setStaffData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? isChecked : value,
      }));
    } else {
      setStudentData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? isChecked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStaffForm = () => {
    const newErrors: Record<string, string> = {};
    if (!staffData.name.trim()) newErrors.name = "Full name is required.";
    if (!staffData.username.trim())
      newErrors.username = "Username is required.";
    if (!staffData.email.trim()) newErrors.email = "Email is required.";
    if (staffData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (!staffData.schoolId)
      newErrors.schoolId = "School selection is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStudentForm = () => {
    const newErrors: Record<string, string> = {};
    if (!studentData.name.trim())
      newErrors.name = "Student's name is required.";
    if (!studentData.username.trim())
      newErrors.username = "Student's username is required.";
    if (!studentData.email.trim())
      newErrors.email = "Student's email is required.";
    if (studentData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (!studentData.schoolId) newErrors.schoolId = "School is required.";
    if (!studentData.classId) newErrors.classId = "Class is required.";
    if (!studentData.sectionId) newErrors.sectionId = "Section is required.";

    if (studentData.exist_guardian) {
      if (!studentData.guardian_emailOrUsername.trim())
        newErrors.guardian_emailOrUsername_exist =
          "Guardian's username or email is required.";
      if (!studentData.guardian_password)
        newErrors.guardian_password_exist = "Guardian's password is required.";
    } else {
      if (!studentData.guardian_name.trim())
        newErrors.guardian_name = "Guardian's name is required.";
      if (!studentData.guardian_username.trim())
        newErrors.guardian_username = "Guardian's username is required.";
      if (!studentData.guardian_email.trim())
        newErrors.guardian_email = "Guardian's email is required.";
      if (studentData.guardian_password.length < 6)
        newErrors.guardian_password =
          "Guardian password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStaffForm()) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please correct the errors and try again.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.staffSignup({
        ...staffData,
        isActive: false,
      });
      showToast({
        type: "success",
        title: "Registration Successful",
        message: "Staff account created successfully!",
      });
      router.push("/login");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create staff account";
      showToast({
        type: "error",
        title: "Registration Failed",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStudentForm()) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please correct the errors and try again.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.studentSignup({
        ...studentData,
        isActive: false,
      });
      showToast({
        type: "success",
        title: "Registration Successful",
        message: "Student account created successfully!",
      });
      router.push("/login");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create student account";
      showToast({
        type: "error",
        title: "Registration Failed",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (isCheckingOnboarding)
  //   return <Loader fullScreen text="Checking system status..." />;

  const renderStaffForm = () => (
    <motion.form
      key="staff"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleStaffSubmit}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-gray-900 text-center">
        Staff Registration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <input
            name="name"
            value={staffData.name}
            onChange={(e) => handleInputChange(e, "staff")}
            placeholder="Full Name"
            className={`input ${errors.name ? "input-error" : ""}`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <input
            name="username"
            value={staffData.username}
            onChange={(e) => handleInputChange(e, "staff")}
            placeholder="Username"
            className={`input ${errors.username ? "input-error" : ""}`}
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
          )}
        </div>
        <div>
          <input
            name="email"
            type="email"
            value={staffData.email}
            onChange={(e) => handleInputChange(e, "staff")}
            placeholder="Email"
            className={`input ${errors.email ? "input-error" : ""}`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <input
            name="password"
            type="password"
            value={staffData.password}
            onChange={(e) => handleInputChange(e, "staff")}
            placeholder="Password"
            className={`input ${errors.password ? "input-error" : ""}`}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        <input
          name="phone"
          value={staffData.phone[0]}
          onChange={(e) =>
            setStaffData((p) => ({ ...p, phone: [e.target.value] }))
          }
          placeholder="Phone Number"
          className="input"
        />
        <input
          name="address"
          value={staffData.address}
          onChange={(e) => handleInputChange(e, "staff")}
          placeholder="Address"
          className="input"
        />
        <select
          name="gender"
          value={staffData.gender}
          onChange={(e) => handleInputChange(e, "staff")}
          className="input"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          name="dob"
          type="date"
          value={staffData.dob}
          onChange={(e) => handleInputChange(e, "staff")}
          className="input"
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => {
            if (!e.target.value) {
              e.target.type = "text";
            }
          }}
          placeholder="Date of Birth"
        />
        <input
          name="qualification"
          value={staffData.qualification}
          onChange={(e) => handleInputChange(e, "staff")}
          placeholder="Qualification"
          className="input"
        />
        <div>
          <select
            name="schoolId"
            value={staffData.schoolId}
            onChange={(e) => handleInputChange(e, "staff")}
            className={`input ${errors.schoolId ? "input-error" : ""}`}
          >
            <option value="">Select School</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
          {errors.schoolId && (
            <p className="text-red-500 text-xs mt-1">{errors.schoolId}</p>
          )}
        </div>
        <select
          name="role"
          value={staffData.role}
          onChange={(e) => handleInputChange(e, "staff")}
          className="input"
        >
          <option value="teacher">Teacher</option>
          <option value="accountant">Accountant</option>
          <option value="librarian">Librarian</option>
        </select>
        <input
          name="designation"
          value={staffData.designation}
          onChange={(e) => handleInputChange(e, "staff")}
          placeholder="Designation"
          className="input"
        />
        <input
          name="salary"
          type="number"
          value={staffData.salary}
          onChange={(e) => handleInputChange(e, "staff")}
          placeholder="Salary"
          className="input"
          onFocus={(e) => (e.target.type = "number")}
          onBlur={(e) => {
            if (!e.target.value) {
              e.target.type = "text";
            }
          }}
        />
        <input
          name="joining_date"
          type="date"
          value={staffData.joining_date}
          onChange={(e) => handleInputChange(e, "staff")}
          className="input"
          onFocus={(e) => (e.target.type = "date")}
          onBlur={(e) => {
            if (!e.target.value) {
              e.target.type = "text";
            }
          }}
          placeholder="Joining Date"
        />
        <textarea
          name="notes"
          value={staffData.notes}
          onChange={(e) => handleInputChange(e, "staff")}
          placeholder="Notes (optional)"
          className="input md:col-span-2"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary disabled:opacity-50"
      >
        {isSubmitting ? <ButtonLoader /> : "Create Staff Account"}
      </button>
    </motion.form>
  );

  const renderStudentForm = () => (
    <motion.form
      key="student"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleStudentSubmit}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-gray-900 text-center">
        Student Registration
      </h3>
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-medium text-gray-800">Student&apos;s Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
          <div>
            <input
              name="name"
              value={studentData.name}
              onChange={(e) => handleInputChange(e, "student")}
              placeholder="Full Name"
              className={`input ${errors.name ? "input-error" : ""}`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <input
              name="username"
              value={studentData.username}
              onChange={(e) => handleInputChange(e, "student")}
              placeholder="Username"
              className={`input ${errors.username ? "input-error" : ""}`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>
          <div>
            <input
              name="email"
              type="email"
              value={studentData.email}
              onChange={(e) => handleInputChange(e, "student")}
              placeholder="Email"
              className={`input ${errors.email ? "input-error" : ""}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <input
              name="password"
              type="password"
              value={studentData.password}
              onChange={(e) => handleInputChange(e, "student")}
              placeholder="Password"
              className={`input ${errors.password ? "input-error" : ""}`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <select
            name="gender"
            value={studentData.gender}
            onChange={(e) => handleInputChange(e, "student")}
            className="input"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <div className="relative">
            <input
              name="dob"
              type="date"
              value={studentData.dob}
              onChange={(e) => handleInputChange(e, "student")}
              className="input"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.type = "text";
                }
              }}
              placeholder="Date of Birth"
            />
          </div>
          <input
            name="phone"
            value={studentData.phone}
            onChange={(e) => handleInputChange(e, "student")}
            placeholder="Phone Number"
            className="input"
          />
          <input
            name="address"
            value={studentData.address}
            onChange={(e) => handleInputChange(e, "student")}
            placeholder="Address"
            className="input"
          />
          <input
            name="city"
            value={studentData.city}
            onChange={(e) => handleInputChange(e, "student")}
            placeholder="City"
            className="input"
          />
          <input
            name="state"
            value={studentData.state}
            onChange={(e) => handleInputChange(e, "student")}
            placeholder="State"
            className="input"
          />
          <input
            name="country"
            value={studentData.country}
            onChange={(e) => handleInputChange(e, "student")}
            placeholder="Country"
            className="input"
          />
          <input
            name="religion"
            value={studentData.religion}
            onChange={(e) => handleInputChange(e, "student")}
            placeholder="Religion"
            className="input"
          />
          <select
            name="blood_group"
            value={studentData.blood_group}
            onChange={(e) => handleInputChange(e, "student")}
            className="input"
          >
            <option value="">Select Blood Group</option>
            {BLOOD_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-medium text-gray-800">Academic Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select
              name="schoolId"
              value={studentData.schoolId}
              onChange={(e) => handleInputChange(e, "student")}
              className={`input ${errors.schoolId ? "input-error" : ""}`}
            >
              <option value="">Select School</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            {errors.schoolId && (
              <p className="text-red-500 text-xs mt-1">{errors.schoolId}</p>
            )}
          </div>
          <div>
            <select
              name="classId"
              value={studentData.classId}
              onChange={(e) => handleInputChange(e, "student")}
              className={`input ${errors.classId ? "input-error" : ""}`}
              disabled={!studentData.schoolId}
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.classId && (
              <p className="text-red-500 text-xs mt-1">{errors.classId}</p>
            )}
          </div>
          <div>
            <select
              name="sectionId"
              value={studentData.sectionId}
              onChange={(e) => handleInputChange(e, "student")}
              className={`input ${errors.sectionId ? "input-error" : ""}`}
              disabled={!studentData.classId}
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.sectionId && (
              <p className="text-red-500 text-xs mt-1">{errors.sectionId}</p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-800">
            Parent/Guardian&apos;s Details
          </h4>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="exist_guardian"
              checked={studentData.exist_guardian}
              onChange={(e) => handleInputChange(e, "student")}
              className="rounded"
            />
            <span className="text-sm text-gray-600">
              Guardian already exists
            </span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          {!studentData.exist_guardian ? (
            <>
              <div>
                <input
                  name="guardian_name"
                  value={studentData.guardian_name}
                  onChange={(e) => handleInputChange(e, "student")}
                  placeholder="Guardian Name"
                  className={`input ${
                    errors.guardian_name ? "input-error" : ""
                  }`}
                />
                {errors.guardian_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.guardian_name}
                  </p>
                )}
              </div>
              <div>
                <input
                  name="guardian_email"
                  type="email"
                  value={studentData.guardian_email}
                  onChange={(e) => handleInputChange(e, "student")}
                  placeholder="Guardian Email"
                  className={`input ${
                    errors.guardian_email ? "input-error" : ""
                  }`}
                />
                {errors.guardian_email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.guardian_email}
                  </p>
                )}
              </div>
              <input
                name="guardian_phone"
                value={studentData.guardian_phone[0]}
                onChange={(e) =>
                  setStudentData((p) => ({
                    ...p,
                    guardian_phone: [e.target.value],
                  }))
                }
                placeholder="Guardian Phone"
                className="input"
              />
            </>
          ) : null}
          <div>
            <input
              name={
                !studentData.exist_guardian
                  ? "guardian_username"
                  : "guardian_emailOrUsername"
              }
              value={studentData.guardian_emailOrUsername}
              onChange={(e) => handleInputChange(e, "student")}
              placeholder={
                !studentData.exist_guardian
                  ? "Guardian Username"
                  : "Guardian Username or Email"
              }
              className={`input ${
                errors.guardian_emailOrUsername ||
                errors.guardian_emailOrUsername_exist
                  ? "input-error"
                  : ""
              }`}
            />
            {(errors.guardian_emailOrUsername ||
              errors.guardian_emailOrUsername_exist) && (
              <p className="text-red-500 text-xs mt-1">
                {errors.guardian_emailOrUsername ||
                  errors.guardian_emailOrUsername_exist}
              </p>
            )}
          </div>
          <div>
            <input
              name="guardian_password"
              type="password"
              value={studentData.guardian_password}
              onChange={(e) => handleInputChange(e, "student")}
              placeholder="Guardian Password"
              className={`input ${
                (!studentData.exist_guardian && errors.guardian_password) ||
                (studentData.exist_guardian && errors.guardian_password_exist)
                  ? "input-error"
                  : ""
              }`}
            />
            {((!studentData.exist_guardian && errors.guardian_password) ||
              (studentData.exist_guardian &&
                errors.guardian_password_exist)) && (
              <p className="text-red-500 text-xs mt-1">
                {!studentData.exist_guardian
                  ? errors.guardian_password
                  : errors.guardian_password_exist}
              </p>
            )}
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary disabled:opacity-50"
      >
        {isSubmitting ? <ButtonLoader /> : "Create Student Account"}
      </button>
    </motion.form>
  );

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4"
      style={{ backgroundColor: COLORS.background.accent }}
    >
      <div className="max-w-4xl w-full py-8">
        <header className="text-center mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ color: COLORS.primary[700] }}
          >
            Join EduStack
          </h1>
          <p style={{ color: COLORS.gray[600] }}>
            Create your account to get started
          </p>
        </header>
        <div className="flex justify-center mb-8">
          <div
            className="p-1 rounded-lg flex space-x-1"
            style={{ backgroundColor: COLORS.gray[200] }}
          >
            <button
              onClick={() => setUserType("student")}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                userType === "student" ? "shadow" : "bg-transparent"
              }`}
              style={{
                backgroundColor:
                  userType === "student"
                    ? COLORS.background.primary
                    : "transparent",
                color:
                  userType === "student" ? COLORS.gray[900] : COLORS.gray[600],
              }}
            >
              I am a Student
            </button>
            <button
              onClick={() => setUserType("staff")}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                userType === "staff" ? "shadow" : "bg-transparent"
              }`}
              style={{
                backgroundColor:
                  userType === "staff"
                    ? COLORS.background.primary
                    : "transparent",
                color:
                  userType === "staff" ? COLORS.gray[900] : COLORS.gray[600],
              }}
            >
              I am a Staff Member
            </button>
          </div>
        </div>
        <div
          className="p-8 rounded-lg shadow-md"
          style={{ backgroundColor: COLORS.background.primary }}
        >
          <AnimatePresence mode="wait">
            {userType === "staff" ? renderStaffForm() : renderStudentForm()}
          </AnimatePresence>
        </div>
        <p
          className="mt-4 text-center text-sm"
          style={{ color: COLORS.gray[600] }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium transition-colors duration-200"
            style={{ color: COLORS.primary[600] }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLORS.primary[500];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLORS.primary[600];
            }}
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
