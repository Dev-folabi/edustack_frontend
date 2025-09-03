"use client";

import { useState } from "react";
import Link from "next/link";
import { COLORS, SCHOOL_INFO } from "@/constants/colors";
import {
  StudentRegistration,
  StaffRegistration,
  RegistrationType,
} from "@/types/registration";

export default function RegisterPage() {
  const [registrationType, setRegistrationType] =
    useState<RegistrationType>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [studentData, setStudentData] = useState<Partial<StudentRegistration>>({
    email: "",
    password: "",
    username: "",
    name: "",
    gender: "male",
    dob: "",
    phone: "",
    address: "",
    admission_date: "",
    religion: "",
    blood_group: "",
    father_name: "",
    mother_name: "",
    father_occupation: "",
    mother_occupation: "",
    city: "",
    state: "",
    country: "",
    guardian_name: "",
    guardian_phone: [""],
    guardian_email: "",
    guardian_username: "",
    guardian_password: "",
  });

  const [staffData, setStaffData] = useState<Partial<StaffRegistration>>({
    email: "",
    password: "",
    username: "",
    name: "",
    phone: [""],
    address: "",
    role: "teacher",
    designation: "",
    dob: "",
    salary: 0,
    joining_date: "",
    gender: "male",
    qualification: "",
    notes: "",
  });

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      console.log("Student Registration Data:", studentData);
    }, 2000);
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      console.log("Staff Registration Data:", staffData);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: COLORS.primary[500] }}
            >
              E
            </div>
            <span
              className="text-xl font-bold"
              style={{ color: COLORS.primary[700] }}
            >
              {SCHOOL_INFO.name}
            </span>
          </Link>

          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: COLORS.primary[700] }}
          >
            Registration
          </h1>
          <p className="text-xl text-gray-600">
            Join our community of learners and educators
          </p>
        </div>

        {/* Registration Type Switcher */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  registrationType === "student"
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{
                  backgroundColor:
                    registrationType === "student"
                      ? COLORS.primary[500]
                      : "transparent",
                }}
                onClick={() => setRegistrationType("student")}
              >
                Student Registration
              </button>
              <button
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  registrationType === "staff"
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                style={{
                  backgroundColor:
                    registrationType === "staff"
                      ? COLORS.primary[500]
                      : "transparent",
                }}
                onClick={() => setRegistrationType("staff")}
              >
                Staff Registration
              </button>
            </div>
          </div>

          {submitStatus === "success" ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: COLORS.primary[600] }}
              >
                Registration Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for registering. We will review your application and
                get back to you soon.
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => {
                    setSubmitStatus("idle");
                    if (registrationType === "student") {
                      setStudentData({
                        email: "",
                        password: "",
                        username: "",
                        name: "",
                        gender: "male",
                        dob: "",
                        phone: "",
                        address: "",
                        admission_date: "",
                        religion: "",
                        blood_group: "",
                        father_name: "",
                        mother_name: "",
                        father_occupation: "",
                        mother_occupation: "",
                        city: "",
                        state: "",
                        country: "",
                        guardian_name: "",
                        guardian_phone: [""],
                        guardian_email: "",
                        guardian_username: "",
                        guardian_password: "",
                      });
                    } else {
                      setStaffData({
                        email: "",
                        password: "",
                        username: "",
                        name: "",
                        phone: [""],
                        address: "",
                        role: "teacher",
                        designation: "",
                        dob: "",
                        salary: 0,
                        joining_date: "",
                        gender: "male",
                        qualification: "",
                        notes: "",
                      });
                    }
                  }}
                  className="px-6 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: COLORS.primary[500] }}
                >
                  Register Another
                </button>
                <Link
                  href="/"
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Student Registration Form */}
              {registrationType === "student" && (
                <form onSubmit={handleStudentSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="md:col-span-2">
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: COLORS.primary[600] }}
                      >
                        Basic Information
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentData.name || ""}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentData.username || ""}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Choose a username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={studentData.email || ""}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={studentData.password || ""}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Create a password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        required
                        value={studentData.gender || "male"}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            gender: e.target.value as "male" | "female",
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={studentData.dob || ""}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            dob: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={studentData.phone || ""}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group
                      </label>
                      <select
                        value={studentData.blood_group || ""}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            blood_group: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        required
                        value={studentData.address || ""}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter full address"
                      />
                    </div>

                    {/* Guardian Information */}
                    <div className="md:col-span-2 mt-8">
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: COLORS.primary[600] }}
                      >
                        Guardian Information
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentData.guardian_name || ""}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            guardian_name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Guardian's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={studentData.guardian_email || ""}
                        onChange={(e) =>
                          setStudentData((prev) => ({
                            ...prev,
                            guardian_email: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Guardian's email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: COLORS.primary[500] }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Student Registration"
                    )}
                  </button>
                </form>
              )}

              {/* Staff Registration Form */}
              {registrationType === "staff" && (
                <form onSubmit={handleStaffSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: COLORS.primary[600] }}
                      >
                        Staff Information
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={staffData.name || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={staffData.username || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Choose a username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={staffData.email || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={staffData.password || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Create a password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                      </label>
                      <select
                        required
                        value={staffData.role || "teacher"}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            role: e.target.value as "teacher" | "admin" | "accountant" | "librarian",
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                        <option value="accountant">Accountant</option>
                        <option value="librarian">Librarian</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={staffData.designation || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            designation: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter designation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={staffData.dob || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            dob: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        required
                        value={staffData.gender || "male"}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            gender: e.target.value as "male" | "female",
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={staffData.phone?.[0] || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            phone: [e.target.value],
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Joining Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={staffData.joining_date || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            joining_date: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salary *
                      </label>
                      <input
                        type="number"
                        required
                        value={staffData.salary || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            salary: Number(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter salary amount"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualification *
                      </label>
                      <input
                        type="text"
                        required
                        value={staffData.qualification || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            qualification: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter qualification"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        required
                        value={staffData.address || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter full address"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={staffData.notes || ""}
                        onChange={(e) =>
                          setStaffData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Additional notes (optional)"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                    style={{ backgroundColor: COLORS.primary[500] }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Staff Registration"
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
