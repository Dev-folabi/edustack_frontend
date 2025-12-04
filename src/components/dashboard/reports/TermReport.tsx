"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { SCHOOL_INFO } from "@/constants/config";

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
    admissionNumber: string;
    class: string;
    section: string;
    gender: string;
  };
  termInfo: {
    session: string;
    term: string;
    timesOpened: number;
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
      position: number;
    };
  };
  attendance: {
    present: number;
    absent: number;
  };
  affectiveTraits: { name: string; rating: number | null }[];
  schoolBills: { name: string; amount: number }[];
  gradingScale: {
    grade: string;
    minScore: number;
    maxScore: number;
    remark: string;
  }[];
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
    gradingScale,
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

  const getPositionSuffix = (position: number) => {
    const j = position % 10;
    const k = position % 100;
    if (j === 1 && k !== 11) return `${position}st`;
    if (j === 2 && k !== 12) return `${position}nd`;
    if (j === 3 && k !== 13) return `${position}rd`;
    return `${position}th`;
  };

  return (
    <div className="printable-report bg-white text-gray-900 min-h-screen">
      <style jsx>{`
        @media print {
          .printable-report {
            padding: 0.5in;
            font-size: 10pt;
          }
          .print-compact {
            margin-bottom: 0.15in !important;
          }
          .print-table {
            font-size: 9pt;
          }
          .print-header {
            margin-bottom: 0.1in !important;
          }
          .print-section {
            margin-bottom: 0.12in !important;
          }
          @page {
            size: A4;
            margin: 0.5in;
          }
        }
      `}</style>

      {/* Modern Header */}
      <div className="relative mb-4 print-header">
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
        <div className="text-center pt-3 pb-3 border-b-2 border-gray-200">
          {/* School Logo and Name */}
          <div className="flex items-center justify-center gap-3 mb-1">
            {SCHOOL_INFO.logo && (
              <Image
                src={SCHOOL_INFO.logo}
                alt={`${schoolInfo.name} Logo`}
                width={48}
                height={48}
                className="object-contain"
              />
            )}
            <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800">
              {schoolInfo.name}
            </h1>
          </div>
          <p className="text-xs text-gray-600">{schoolInfo.address}</p>
          <p className="text-xs text-gray-600">
            {schoolInfo.email} | {schoolInfo.phone.join(", ")}
          </p>
          {schoolInfo.motto && (
            <p className="text-sm font-medium italic mt-1 text-blue-600">
              &quot;{schoolInfo.motto}&quot;
            </p>
          )}
        </div>
      </div>

      {/* Report Title with Modern Design */}
      <div className="text-center mb-3 print-compact">
        <div className="inline-block">
          <h2 className="text-xl font-bold uppercase tracking-wider bg-blue-600 text-white px-8 py-2 rounded-lg shadow-md">
            {termInfo.term} REPORT CARD
          </h2>
          <div className="text-xs text-gray-500 mt-1">
            Academic Session: {termInfo.session}
          </div>
        </div>
      </div>

      {/* Student Information Card */}
      <div className="bg-gray-50 rounded-lg border-2 border-gray-300 p-3 mb-3 print-section shadow-sm">
        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 mr-1">Student:</span>
            <span className="text-gray-900 font-medium">
              {studentInfo.name}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 mr-1">Class:</span>
            <span className="text-gray-900">
              {studentInfo.class} {studentInfo.section}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 mr-1">
              Admission No:
            </span>
            <span className="text-gray-900">{studentInfo.admissionNumber}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 mr-1">Gender:</span>
            <span className="text-gray-900 capitalize">
              {studentInfo.gender}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 mr-1">
              Class Size:
            </span>
            <span className="text-gray-900">{termInfo.classSize}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-gray-700 mr-1">
              Closing Date:
            </span>
            <span className="text-gray-900">
              {formatDate(termInfo.closingDate)}
            </span>
          </div>
        </div>

        {/* Performance Summary Cards */}
        <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t-2 border-gray-300">
          <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase font-medium mb-0.5">
              Total
            </p>
            <p className="text-lg font-bold text-blue-600">
              {performance.summary.totalMarks}
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase font-medium mb-0.5">
              Maximum
            </p>
            <p className="text-lg font-bold text-gray-700">
              {performance.summary.maxMarks}
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase font-medium mb-0.5">
              Average
            </p>
            <p className="text-lg font-bold text-blue-600">
              {performance.summary.percentage.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase font-medium mb-0.5">
              Position
            </p>
            <p className="text-lg font-bold text-blue-600">
              {getPositionSuffix(performance.summary.position)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase font-medium mb-0.5">
              Attendance
            </p>
            <p className="text-lg font-bold text-blue-600">
              {attendance.present}/{termInfo.timesOpened}
            </p>
          </div>
        </div>
      </div>

      {/* Academic Performance Table */}
      <div className="mb-3 print-section">
        <h3 className="text-sm font-bold mb-2 uppercase tracking-wide text-gray-700 border-l-4 border-blue-600 pl-2">
          Academic Performance
        </h3>
        <div className="overflow-hidden rounded-lg border-2 border-gray-300 shadow-sm">
          <table className="w-full border-collapse print-table text-xs">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-300 p-1.5 text-left font-semibold">
                  Subject
                </th>
                {performance.academic[0]?.scores.map((score, idx) => (
                  <th
                    key={idx}
                    className="border border-gray-300 p-1.5 text-center font-semibold whitespace-nowrap"
                  >
                    {score.title}
                  </th>
                ))}
                <th className="border border-gray-300 p-1.5 text-center font-semibold">
                  Total
                </th>
                <th className="border border-gray-300 p-1.5 text-center font-semibold">
                  Max
                </th>
                <th className="border border-gray-300 p-1.5 text-center font-semibold">
                  %
                </th>
                <th className="border border-gray-300 p-1.5 text-center font-semibold">
                  Grade
                </th>
                <th className="border border-gray-300 p-1.5 text-center font-semibold">
                  Remark
                </th>
              </tr>
            </thead>
            <tbody>
              {performance.academic.map((subject, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border border-gray-300 p-1.5 font-medium text-gray-800">
                    {subject.name}
                  </td>
                  {subject.scores.map((score, idx) => (
                    <td
                      key={idx}
                      className="border border-gray-300 p-1.5 text-center text-gray-700"
                    >
                      {score.score || "-"}
                    </td>
                  ))}
                  <td className="border border-gray-300 p-1.5 text-center font-bold text-blue-600">
                    {subject.total}
                  </td>
                  <td className="border border-gray-300 p-1.5 text-center text-gray-600">
                    {subject.max}
                  </td>
                  <td className="border border-gray-300 p-1.5 text-center font-semibold text-blue-600">
                    {subject.percentage.toFixed(0)}%
                  </td>
                  <td className="border border-gray-300 p-1.5 text-center font-bold text-blue-600">
                    {subject.grade}
                  </td>
                  <td className="border border-gray-300 p-1.5 text-gray-700">
                    {subject.remark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section - 3 Columns */}
      <div className="grid grid-cols-3 gap-3 mb-3 print-section">
        {/* Affective Traits */}
        <div className="rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm">
          <h4 className="text-xs font-bold uppercase bg-blue-600 text-white py-1.5 px-2 text-center">
            Affective Traits
          </h4>
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-t border-gray-300 p-1.5 text-left font-semibold text-gray-700">
                  Trait
                </th>
                <th className="border-t border-gray-300 p-1.5 text-center font-semibold text-gray-700 w-12">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {affectiveTraits.map((trait, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border-t border-gray-200 p-1.5 text-gray-700">
                    {trait.name}
                  </td>
                  <td className="border-t border-gray-200 p-1.5 text-center font-medium text-gray-800">
                    {trait.rating || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grading Scale */}
        <div className="rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm">
          <h4 className="text-xs font-bold uppercase bg-blue-600 text-white py-1.5 px-2 text-center">
            Grading Scale
          </h4>
          <div className="p-2 bg-white">
            <div className="space-y-1 text-[10px]">
              {gradingScale.map((scale, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-0.5 px-1.5 bg-gray-50 rounded"
                >
                  <span className="font-bold text-gray-800">
                    {scale.grade} ({scale.minScore}-{scale.maxScore})
                  </span>
                  <span className="text-gray-600">{scale.remark}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* School Bills */}
        <div className="rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm">
          <h4 className="text-xs font-bold uppercase bg-blue-600 text-white py-1.5 px-2 text-center">
            School Bills
          </h4>
          {schoolBills.length > 0 ? (
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-t border-gray-300 p-1.5 text-left font-semibold text-gray-700">
                    Item
                  </th>
                  <th className="border-t border-gray-300 p-1.5 text-right font-semibold text-gray-700">
                    Amount (₦)
                  </th>
                </tr>
              </thead>
              <tbody>
                {schoolBills.map((bill, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border-t border-gray-200 p-1.5 text-gray-700">
                      {bill.name}
                    </td>
                    <td className="border-t border-gray-200 p-1.5 text-right font-medium text-gray-800">
                      {bill.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="border-t-2 border-gray-400 p-1.5 text-gray-800">
                    TOTAL
                  </td>
                  <td className="border-t-2 border-gray-400 p-1.5 text-right text-gray-800">
                    {schoolBills
                      .reduce((acc, bill) => acc + bill.amount, 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="p-3 text-center text-[10px] text-gray-500 bg-gray-50">
              No bills recorded
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-50 rounded-lg border-2 border-gray-300 p-2.5 mb-3 print-section shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-bold text-xs mb-1 text-gray-700 flex items-center">
              <span className="w-1 h-4 bg-blue-600 mr-1.5 rounded"></span>
              Teacher&apos;s Comment
            </p>
            <p className="text-[10px] text-gray-700 italic bg-white p-2 rounded border border-gray-200 min-h-[40px]">
              {remarks.teacher || "No comment provided"}
            </p>
          </div>
          <div>
            <p className="font-bold text-xs mb-1 text-gray-700 flex items-center">
              <span className="w-1 h-4 bg-blue-600 mr-1.5 rounded"></span>
              Principal&apos;s Comment
            </p>
            <p className="text-[10px] text-gray-700 italic bg-white p-2 rounded border border-gray-200 min-h-[40px]">
              {remarks.principal || "No comment provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="flex justify-between items-end mb-2 print-compact">
        <div className="text-center">
          <div className="h-12 w-40 border-b-2 border-gray-400 mb-1"></div>
          <p className="text-[10px] font-semibold text-gray-700 uppercase">
            Class Teacher&apos;s Signature
          </p>
        </div>
        <div className="text-center">
          <div className="h-12 w-40 border-b-2 border-gray-400 mb-1"></div>
          <p className="text-[10px] font-semibold text-gray-700 uppercase">
            Principal&apos;s Signature & Stamp
          </p>
        </div>
      </div>

      {/* Resumption Note */}
      {termInfo.resumptionDate && (
        <div className="text-center border-t-2 border-gradient-to-r from-blue-600 to-purple-600 pt-2">
          <p className="font-bold text-sm text-gray-800">
            Next Term Resumes:{" "}
            <span className="text-blue-600">
              {formatDate(termInfo.resumptionDate)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TermReport;
