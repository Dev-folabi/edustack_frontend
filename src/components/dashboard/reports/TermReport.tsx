"use client";

import React from "react";
import { format } from "date-fns";

interface ReportData {
  schoolInfo: {
    name: string;
    address: string;
    phone: string[];
    email: string;
    motto: string | null;
  };
  studentInfo: {
    name: string;
    admissionNumber: number;
    class: string;
    section: string;
    gender: string;
    dob: string;
  };
  termInfo: {
    session: string;
    term: string;
    timesOpened: any[];
    closingDate: string;
    resumptionDate: string | null;
    classSize: number;
  };
  performance: {
    academic: {
      name: string;
      scores: { title: string; score: number }[];
      total: number;
      max: number;
      percentage: number;
      grade: string;
      remark: string;
    }[];
    summary: {
      totalMarks: number;
      maxMarks: number;
      percentage: number;
      grade: string;
    };
  };
  attendance: {
    present: number;
    absent: number;
  };
  affectiveTraits: { name: string; rating: number | null }[];
  schoolBills: { name: string; amount: number }[];
  remarks: {
    teacher: string | null;
    principal: string | null;
  };
}

interface TermReportProps {
  reportData: ReportData;
}

export const TermReport: React.FC<TermReportProps> = ({ reportData }) => {
  if (!reportData) return null;

  const {
    schoolInfo,
    studentInfo,
    termInfo,
    performance,
    attendance,
    affectiveTraits,
    schoolBills,
    remarks,
  } = reportData;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="printable-report bg-white text-black p-8">
      {/* School Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold uppercase mb-2">{schoolInfo.name}</h1>
        <p className="text-sm">{schoolInfo.address}</p>
        <p className="text-sm">
          Email: {schoolInfo.email} | Phone: {schoolInfo.phone.join(", ")}
        </p>
        {schoolInfo.motto && (
          <p className="text-lg font-semibold italic mt-2 text-blue-600">
            &quot;{schoolInfo.motto}&quot;
          </p>
        )}
      </div>

      {/* Report Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold uppercase bg-gray-200 py-2">
          {termInfo.term} REPORT SHEET
        </h2>
      </div>

      {/* Student Information */}
      <div className="border-2 border-black p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm">
          <div>
            <span className="font-bold">NAME OF PUPIL:</span>{" "}
            {studentInfo.name}
          </div>
          <div>
            <span className="font-bold">CLASS:</span> {studentInfo.class}{" "}
            {studentInfo.section}
          </div>
          <div>
            <span className="font-bold">NO. IN CLASS:</span>{" "}
            {termInfo.classSize}
          </div>
          <div>
            <span className="font-bold">ADMISSION NO:</span>{" "}
            {studentInfo.admissionNumber}
          </div>
          <div>
            <span className="font-bold">SESSION:</span> {termInfo.session}
          </div>
          <div>
            <span className="font-bold">TIMES OPENED:</span>{" "}
            {termInfo.timesOpened?.length || 0}
          </div>
          <div>
            <span className="font-bold">GENDER:</span>{" "}
            <span className="uppercase">{studentInfo.gender}</span>
          </div>
          <div>
            <span className="font-bold">TERM:</span> {termInfo.term}
          </div>
          <div>
            <span className="font-bold">TIMES PRESENT:</span>{" "}
            {attendance.present}
          </div>
          <div>
            <span className="font-bold">DATE OF BIRTH:</span>{" "}
            {formatDate(studentInfo.dob)}
          </div>
          <div>
            <span className="font-bold">CLOSING DATE:</span>{" "}
            {formatDate(termInfo.closingDate)}
          </div>
          <div>
            <span className="font-bold">TIMES ABSENT:</span> {attendance.absent}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t-2 border-gray-300">
          <div className="text-center">
            <p className="text-xs text-gray-600">TOTAL MARKS</p>
            <p className="text-xl font-bold">{performance.summary.totalMarks}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">MAX MARKS</p>
            <p className="text-xl font-bold">{performance.summary.maxMarks}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">PERCENTAGE</p>
            <p className="text-xl font-bold">
              {performance.summary.percentage.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">GRADE</p>
            <p className="text-xl font-bold text-blue-600">
              {performance.summary.grade}
            </p>
          </div>
        </div>
      </div>

      {/* Academic Performance */}
      <div className="mb-6">
        <h3 className="text-center font-bold text-lg mb-3 uppercase">
          Academic Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-2 border-black text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 text-left">SUBJECT</th>
                {performance.academic[0]?.scores.map((score, idx) => (
                  <th key={idx} className="border border-black p-2 text-center">
                    {score.title}
                  </th>
                ))}
                <th className="border border-black p-2 text-center">TOTAL</th>
                <th className="border border-black p-2 text-center">MAX</th>
                <th className="border border-black p-2 text-center">%</th>
                <th className="border border-black p-2 text-center">GRADE</th>
                <th className="border border-black p-2 text-center">REMARK</th>
              </tr>
            </thead>
            <tbody>
              {performance.academic.map((subject, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-black p-2 font-medium">
                    {subject.name}
                  </td>
                  {subject.scores.map((score, idx) => (
                    <td
                      key={idx}
                      className="border border-black p-2 text-center"
                    >
                      {score.score || "-"}
                    </td>
                  ))}
                  <td className="border border-black p-2 text-center font-bold">
                    {subject.total}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {subject.max}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {subject.percentage.toFixed(0)}%
                  </td>
                  <td className="border border-black p-2 text-center font-bold text-blue-600">
                    {subject.grade}
                  </td>
                  <td className="border border-black p-2">{subject.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Affective Traits */}
        <div>
          <h4 className="text-center font-bold mb-2 text-sm uppercase bg-gray-200 py-2">
            Affective Traits
          </h4>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left">TRAIT</th>
                <th className="border border-black p-2 text-center w-16">
                  RATING
                </th>
              </tr>
            </thead>
            <tbody>
              {affectiveTraits.map((trait, index) => (
                <tr key={index}>
                  <td className="border border-black p-2">{trait.name}</td>
                  <td className="border border-black p-2 text-center">
                    {trait.rating || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grading Keys */}
        <div>
          <h4 className="text-center font-bold mb-2 text-sm uppercase bg-gray-200 py-2">
            Keys to Grading
          </h4>
          <div className="border border-black p-3 text-xs space-y-1">
            <p>
              <span className="font-bold">A (70-100):</span> Excellent
            </p>
            <p>
              <span className="font-bold">B (60-69):</span> Very Good
            </p>
            <p>
              <span className="font-bold">C (50-59):</span> Good
            </p>
            <p>
              <span className="font-bold">D (40-49):</span> Fair
            </p>
            <p>
              <span className="font-bold">F (0-39):</span> Poor
            </p>
          </div>

          <h4 className="text-center font-bold mb-2 mt-4 text-sm uppercase bg-gray-200 py-2">
            Keys to Rating
          </h4>
          <div className="border border-black p-3 text-xs space-y-1">
            <p>
              <span className="font-bold">5:</span> Excellent
            </p>
            <p>
              <span className="font-bold">4:</span> Very Good
            </p>
            <p>
              <span className="font-bold">3:</span> Good
            </p>
            <p>
              <span className="font-bold">2:</span> Fair
            </p>
            <p>
              <span className="font-bold">1:</span> Poor
            </p>
          </div>
        </div>

        {/* School Bills */}
        <div>
          <h4 className="text-center font-bold mb-2 text-sm uppercase bg-gray-200 py-2">
            School Bills
          </h4>
          {schoolBills.length > 0 ? (
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 text-left">ITEM</th>
                  <th className="border border-black p-2 text-right">
                    AMOUNT (₦)
                  </th>
                </tr>
              </thead>
              <tbody>
                {schoolBills.map((bill, index) => (
                  <tr key={index}>
                    <td className="border border-black p-2">{bill.name}</td>
                    <td className="border border-black p-2 text-right">
                      {bill.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-black p-2">TOTAL</td>
                  <td className="border border-black p-2 text-right">
                    {schoolBills
                      .reduce((acc, bill) => acc + bill.amount, 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="border border-black p-4 text-center text-xs text-gray-500">
              No bills recorded
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-2 border-black p-4 space-y-3 mb-6">
        <div>
          <p className="font-bold text-sm mb-1">TEACHER&apos;S COMMENT:</p>
          <p className="text-sm italic">
            {remarks.teacher || "No comment provided"}
          </p>
        </div>
        <div>
          <p className="font-bold text-sm mb-1">PRINCIPAL&apos;S COMMENT:</p>
          <p className="text-sm italic">
            {remarks.principal || "No comment provided"}
          </p>
        </div>
        <div>
          <p className="font-bold text-sm mb-1">
            PROPRIETOR&apos;S/DIRECTOR&apos;S COMMENT:
          </p>
          <div className="h-12 border-b border-gray-400"></div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between items-end">
        <div className="text-center">
          <div className="h-16"></div>
          <p className="border-t-2 border-black pt-1 px-8 text-sm font-bold">
            CLASS TEACHER&apos;S SIGNATURE
          </p>
        </div>
        <div className="text-center">
          <div className="h-16"></div>
          <p className="border-t-2 border-black pt-1 px-8 text-sm font-bold">
            PRINCIPAL&apos;S SIGNATURE & STAMP
          </p>
        </div>
      </div>

      {/* Resumption Note */}
      {termInfo.resumptionDate && (
        <div className="mt-6 text-center border-t-2 border-black pt-4">
          <p className="font-bold text-lg">
            NEXT TERM BEGINS: {formatDate(termInfo.resumptionDate)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TermReport;