"use client";
import { COLORS } from "@/constants/config";
import {
  FaGraduationCap,
  FaLaptop,
  FaTrophy,
  FaStar,
  FaUsers,
  FaGlobeAmericas,
} from "react-icons/fa";

export default function WhyChooseUs() {
  const features = [
    {
      icon: FaGraduationCap,
      title: "Expert Faculty",
      description:
        "Highly qualified and experienced teachers dedicated to student success.",
    },
    {
      icon: FaLaptop,
      title: "Modern Technology",
      description:
        "State-of-the-art facilities and digital learning resources.",
    },
    {
      icon: FaTrophy,
      title: "Proven Results",
      description:
        "Consistent academic excellence and outstanding student achievements.",
    },
    {
      icon: FaStar,
      title: "Holistic Development",
      description:
        "Focus on academic, social, and emotional growth of every student.",
    },
    {
      icon: FaUsers,
      title: "Small Class Sizes",
      description:
        "Personalized attention with optimal teacher-to-student ratios.",
    },
    {
      icon: FaGlobeAmericas,
      title: "Global Perspective",
      description:
        "International curriculum preparing students for a global future.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: COLORS.primary[700] }}
          >
            Why Choose Us?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover what makes our school the perfect choice for your
            child&apos;s educational journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border border-gray-100"
            >
              <div className="text-4xl mb-4">{<feature.icon />}</div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: COLORS.primary[600] }}
              >
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
