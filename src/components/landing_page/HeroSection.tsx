"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SCHOOL_INFO } from "@/constants/colors";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: `Welcome to ${SCHOOL_INFO.name}`,
      subtitle: SCHOOL_INFO.motto,
      description:
        "Discover excellence in education with our innovative learning approach and world-class facilities.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_cd42ee63f8.jpg",
    },
    {
      title: "Shape Your Future",
      subtitle: "Excellence in Every Classroom",
      description:
        "Join thousands of successful graduates who started their journey with us.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_b4c101128a.jpg",
    },
    {
      title: "Innovation Meets Education",
      subtitle: "Modern Learning Environment",
      description:
        "Experience cutting-edge technology and teaching methods designed for tomorrow's leaders.",
      image: "https://ik.imagekit.io/edustack/edustack/Whisk_11ea24ff91.jpg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Slides */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.7), rgba(14, 165, 233, 0.7)), url(${slide.image})`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {heroSlides[currentSlide].title}
          </h1>
          <h2 className="text-2xl md:text-3xl font-light mb-6 opacity-90">
            {heroSlides[currentSlide].subtitle}
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-80 max-w-2xl mx-auto">
            {heroSlides[currentSlide].description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Apply Now
            </Link>
            <Link
              href="#about"
              className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
