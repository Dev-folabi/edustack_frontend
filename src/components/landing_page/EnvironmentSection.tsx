"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { COLORS } from "@/constants/config";

export default function EnvironmentSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const environments = [
    {
      title: "Modern Classrooms",
      description:
        "Spacious, well-lit classrooms equipped with smart boards and modern furniture.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_7a8f83bd16.jpg",
    },
    {
      title: "Library & Study Areas",
      description:
        "Extensive library with quiet study spaces and digital resources.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_b4c101128a.jpg",
    },
    {
      title: "Campus Grounds",
      description:
        "Beautiful, safe campus with green spaces and recreational areas.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_a298b62957.jpg",
    },
    {
      title: "Cafeteria",
      description: "Clean, modern dining facilities serving nutritious meals.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_bca4f1ebd9.jpg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % environments.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [environments.length]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: COLORS.primary[700] }}
          >
            School Environment
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Take a virtual tour of our beautiful, modern campus designed for
            optimal learning.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="relative h-80 md:h-96">
              {environments.map((env, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={env.image}
                    alt={env.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {environments.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>

          <div>
            <h3
              className="text-3xl font-bold mb-6"
              style={{ color: COLORS.primary[600] }}
            >
              {environments[currentSlide].title}
            </h3>
            <p className="text-lg text-gray-700 mb-8">
              {environments[currentSlide].description}
            </p>

            <div className="space-y-4">
              {environments.map((env, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    index === currentSlide ? "border-l-4" : "hover:bg-gray-50"
                  }`}
                  style={{
                    backgroundColor:
                      index === currentSlide
                        ? `${COLORS.primary[50]}`
                        : undefined,
                    borderLeftColor:
                      index === currentSlide ? COLORS.primary[500] : undefined,
                  }}
                  onClick={() => setCurrentSlide(index)}
                >
                  <div
                    className="font-semibold"
                    style={{ color: COLORS.primary[600] }}
                  >
                    {env.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {env.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
