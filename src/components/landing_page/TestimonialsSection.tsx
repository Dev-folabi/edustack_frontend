"use client";

import { useState, useEffect } from "react";
import { COLORS } from "@/constants/colors";

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Parent",
      image: "/api/placeholder/100/100",
      text: "EduStack Academy has been incredible for my daughter. The teachers are dedicated, and the learning environment is exceptional. She has grown so much academically and personally.",
    },
    {
      name: "Michael Chen",
      role: "Alumni (Class of 2020)",
      image: "/api/placeholder/100/100",
      text: "The education I received at EduStack prepared me perfectly for university. The critical thinking skills and confidence I gained here have been invaluable in my studies.",
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Parent & Educator",
      image: "/api/placeholder/100/100",
      text: "As an educator myself, I can confidently say that EduStack Academy sets the gold standard for quality education. The holistic approach to learning is truly remarkable.",
    },
    {
      name: "James Wilson",
      role: "Parent",
      image: "/api/placeholder/100/100",
      text: "The individual attention my son receives here is outstanding. The teachers know each student personally and tailor their approach to help every child succeed.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: COLORS.primary[700] }}
          >
            What People Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from our community of parents, students, and alumni.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center">
              <div
                className="text-6xl mb-6"
                style={{ color: COLORS.primary[300] }}
              >
                &quot;
              </div>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {testimonials[currentTestimonial].text}
              </p>

              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-left">
                  <h4
                    className="font-bold text-lg"
                    style={{ color: COLORS.primary[600] }}
                  >
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial
                    ? "bg-blue-500"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
