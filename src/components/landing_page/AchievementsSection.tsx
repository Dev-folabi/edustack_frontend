"use client";

import { COLORS } from "@/constants/colors";
import {
  FaTrophy,
  FaBook,
  FaTheaterMasks,
  FaFutbol,
  FaPaintBrush,
  FaLaptopCode,
} from "react-icons/fa";

export default function AchievementsSection() {
  const achievements = [
    {
      icon: FaTrophy,
      title: "National Science Fair",
      description: "First Place Winner 2023",
      year: "2023",
    },
    {
      icon: FaBook,
      title: "Academic Excellence",
      description: "Top 10 Schools Nationwide",
      year: "2023",
    },
    {
      icon: FaTheaterMasks,
      title: "Drama Competition",
      description: "Regional Champions",
      year: "2022",
    },
    {
      icon: FaFutbol,
      title: "Sports Championship",
      description: "Inter-School Football League",
      year: "2023",
    },
    {
      icon: FaPaintBrush,
      title: "Art Exhibition",
      description: "Best Creative Display",
      year: "2022",
    },
    {
      icon: FaLaptopCode,
      title: "Coding Competition",
      description: "State Level Winners",
      year: "2023",
    },
  ];

  return (
    <section
      className="py-20"
      style={{ backgroundColor: COLORS.background.accent }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: COLORS.primary[700] }}
          >
            Our Achievements
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Celebrating our students&apos; outstanding accomplishments and
            recognitions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              <div className="text-5xl mb-4 text-center">
                {<achievement.icon />}
              </div>
              <div className="text-center">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: COLORS.primary[600] }}
                >
                  {achievement.title}
                </h3>
                <p className="text-gray-600 mb-3">{achievement.description}</p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: COLORS.primary[500] }}
                >
                  {achievement.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
