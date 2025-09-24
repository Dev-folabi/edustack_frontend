"use client";

import useAuthStore from "@/store/authStore";

const ResultHeader = () => {
  const { currentSchool } = useAuthStore();

  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-800">{currentSchool?.name || "Greenfield Academy"}</h1>
      <p className="text-gray-600">{currentSchool?.address || "123 Education Lane, Knowledge City"}</p>
      <h2 className="text-2xl font-semibold mt-6">Student Termly Report Card</h2>
    </div>
  );
};

export default ResultHeader;
