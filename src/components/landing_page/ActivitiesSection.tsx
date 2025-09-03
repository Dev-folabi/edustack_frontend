"use client";

import { useState, useEffect } from "react";
import { COLORS } from "@/constants/colors";

export default function ActivitiesSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const activities = [
    {
      title: "Science Laboratory",
      description:
        "State-of-the-art labs for hands-on scientific exploration and discovery.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_318bdc5300.jpg",
    },
    {
      title: "Sports & Athletics",
      description:
        "Comprehensive sports programs to develop physical fitness and teamwork.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_bc51572db5.jpg",
    },
    {
      title: "Arts & Music",
      description:
        "Creative programs fostering artistic expression and musical talents.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_de84565fee.jpg",
    },
    {
      title: "Drama & Theater",
      description:
        "Performance arts programs building confidence and communication skills.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_28fb972d05.jpg",
    },
    {
      title: "Robotics Club",
      description:
        "STEM programs preparing students for the future of technology.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_b5a7242954.jpg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activities.length]);

  return (
    <section
      id="activities"
      className="py-20"
      style={{ backgroundColor: COLORS.background.accent }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: COLORS.primary[700] }}
          >
            Our Activities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our diverse range of extracurricular activities designed to
            nurture every student&apos;s interests.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          <div className="relative h-96 md:h-[500px]">
            {activities.map((activity, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <div
                  className="w-full h-full bg-cover bg-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${activity.image})`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white max-w-2xl px-4">
                      <h3 className="text-4xl font-bold mb-4">
                        {activity.title}
                      </h3>
                      <p className="text-xl opacity-90">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev - 1 + activities.length) % activities.length
              )
            }
          >
            ←
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % activities.length)
            }
          >
            →
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {activities.map((_, index) => (
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
      </div>
    </section>
  );
}
