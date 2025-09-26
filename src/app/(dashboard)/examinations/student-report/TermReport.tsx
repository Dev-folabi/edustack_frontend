"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface ReportData {
    schoolInfo: {
        name: string;
        address: string;
        phone: string[];
        email: string;
        motto: string;
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
        timesOpened: number;
        closingDate: string;
        resumptionDate: string;
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
    affectiveTraits: { name: string; rating: number }[];
    schoolBills: { name: string; amount: number }[];
    remarks: {
        teacher: string;
        principal: string;
    };
}

interface TermReportProps {
  reportData: ReportData;
  onPrint: () => void;
}

const TermReport: React.FC<TermReportProps> = ({ reportData, onPrint }) => {
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

  return (
    <div className="printable-report p-4 bg-white text-black">
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold">{schoolInfo.name}</h1>
        <p>{schoolInfo.address}</p>
        <p>Email: {schoolInfo.email} | Phone: {schoolInfo.phone.join(', ')}</p>
        <h2 className="text-xl font-semibold">{schoolInfo.motto}</h2>
      </header>

      <section className="mb-4 p-2 border border-black">
        <h3 className="text-center font-bold bg-gray-200">SECOND TERM REPORT SHEET</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
            <div><span className="font-bold">NAME OF PUPIL:</span> {studentInfo.name}</div>
            <div><span className="font-bold">CLASS:</span> {studentInfo.class}</div>
            <div><span className="font-bold">NO. IN CLASS:</span> {termInfo.classSize}</div>
            <div><span className="font-bold">REGISTRATION NUMB:</span> {studentInfo.admissionNumber}</div>
            <div><span className="font-bold">SESSION:</span> {termInfo.session}</div>
            <div><span className="font-bold">TIMES SCHOOL OPENED:</span> {termInfo.timesOpened}</div>
            <div><span className="font-bold">CLOSING DATE:</span> {new Date(termInfo.closingDate).toLocaleDateString()}</div>
            <div><span className="font-bold">TERM:</span> {termInfo.term}</div>
            <div><span className="font-bold">TIMES PRESENT:</span> {attendance.present}</div>
            <div><span className="font-bold">RESUMPTION DATE:</span> {new Date(termInfo.resumptionDate).toLocaleDateString()}</div>
            <div><span className="font-bold">GENDER:</span> {studentInfo.gender}</div>
            <div><span className="font-bold">TIMES ABSENT:</span> {attendance.absent}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm mt-2">
            <div className="font-bold">OVERALL TOTAL: {performance.summary.totalMarks}</div>
            <div className="font-bold">AVERAGE: {performance.summary.percentage.toFixed(2)}</div>
            <div className="font-bold">PERCENTAGE: {performance.summary.percentage.toFixed(2)}%</div>
            <div className="font-bold">POSITION: </div>
        </div>
      </section>

      <section className="mb-4">
        <h4 className="text-center font-bold">STUDENT'S ACADEMIC PERFORMANCE (JUNIOR SECONDARY CATEGORY)</h4>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black p-1">SUBJECT</th>
              <th className="border border-black p-1">1ST C.A 10</th>
              <th className="border border-black p-1">2ND C.A 20</th>
              <th className="border border-black p-1">EXAM 70</th>
              <th className="border border-black p-1">TOTAL 100</th>
              <th className="border border-black p-1">GRADE</th>
              <th className="border border-black p-1">REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {performance.academic.map((subject, index) => (
              <tr key={index}>
                <td className="border border-black p-1">{subject.name}</td>
                <td className="border border-black p-1 text-center">{subject.scores.find(s => s.title === '1st CA')?.score || ''}</td>
                <td className="border border-black p-1 text-center">{subject.scores.find(s => s.title === '2nd CA')?.score || ''}</td>
                <td className="border border-black p-1 text-center">{subject.scores.find(s => s.title === 'Final Exam')?.score || ''}</td>
                <td className="border border-black p-1 text-center">{subject.total}</td>
                <td className="border border-black p-1 text-center">{subject.grade}</td>
                <td className="border border-black p-1">{subject.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <section className="mb-4">
          <h4 className="text-center font-bold">AFFECTIVE TRAITS</h4>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="border border-black p-1">AFFECTIVE TRAITS</th>
                <th className="border border-black p-1">RATING</th>
              </tr>
            </thead>
            <tbody>
              {affectiveTraits.map((trait, index) => (
                <tr key={index}>
                  <td className="border border-black p-1">{trait.name}</td>
                  <td className="border border-black p-1 text-center">{trait.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-4">
          <h4 className="text-center font-bold">KEYS TO GRADING</h4>
          <table className="w-full border-collapse border border-black">
            <tbody>
              <tr><td className="border border-black p-1">70-100=A - Excellent, 60-69=B- Very Good</td></tr>
              <tr><td className="border border-black p-1">49-59= C- Good, 40-49 =D- Fair</td></tr>
              <tr><td className="border border-black p-1">0-39 = F- Poor</td></tr>
            </tbody>
          </table>
          <h4 className="text-center font-bold mt-2">KEYS TO RATING</h4>
          <table className="w-full border-collapse border border-black">
            <tbody>
                <tr><td className="border border-black p-1">5 = EXCELLENT</td></tr>
                <tr><td className="border border-black p-1">4 = VERY GOOD</td></tr>
                <tr><td className="border border-black p-1">3 = GOOD</td></tr>
                <tr><td className="border border-black p-1">2 = POOR</td></tr>
                <tr><td className="border border-black p-1">1 = VERY POOR</td></tr>
            </tbody>
          </table>
        </section>

        <section className="mb-4">
          <h4 className="text-center font-bold">SCHOOL BILLS</h4>
          <table className="w-full border-collapse border border-black">
              <thead>
                  <tr>
                      <th className="border border-black p-1"></th>
                      <th className="border border-black p-1">N</th>
                  </tr>
              </thead>
            <tbody>
              {schoolBills.map((bill, index) => (
                <tr key={index}>
                  <td className="border border-black p-1">{bill.name}</td>
                  <td className="border border-black p-1 text-right">{bill.amount.toLocaleString()}</td>
                </tr>
              ))}
              <tr>
                <td className="border border-black p-1 font-bold">TOTAL</td>
                <td className="border border-black p-1 text-right font-bold">
                    {schoolBills.reduce((acc, bill) => acc + bill.amount, 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <section className="text-sm">
        <div className="mb-2"><span className="font-bold">TEACHER'S COMMENT:</span> {remarks.teacher}</div>
        <div className="mb-2"><span className="font-bold">PRINCIPAL'S COMMENT:</span> {remarks.principal}</div>
        <div className="mb-2"><span className="font-bold">PROPRIETOR'S/DIRECTOR'S COMMENT:</span></div>
        <div className="mt-8 flex justify-end">
            <div className="text-center">
                <p className="border-t border-black px-8">SIGNATURE & STAMP</p>
            </div>
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <Button onClick={onPrint}>Print Report</Button>
      </div>
    </div>
  );
};

export default TermReport;