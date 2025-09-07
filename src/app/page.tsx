"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/landing_page/Header";
import HeroSection from "@/components/landing_page/HeroSection";
import AboutSection from "@/components/landing_page/AboutSection";
import WhyChooseUs from "@/components/landing_page/WhyChooseUs";
import ActivitiesSection from "@/components/landing_page/ActivitiesSection";
import EnvironmentSection from "@/components/landing_page/EnvironmentSection";
import AchievementsSection from "@/components/landing_page/AchievementsSection";
import TestimonialsSection from "@/components/landing_page/TestimonialsSection";
import GallerySection from "@/components/landing_page/GallerySection";
import NoticeBoardSection from "@/components/landing_page/NoticeBoardSection";
import ContactSection from "@/components/landing_page/ContactSection";
import Footer from "@/components/landing_page/Footer";

export default function Home() {
  const { isLoggedIn, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <div className="min-h-screen bg-white">
      <Header isLoggedIn={isLoggedIn} />
      <main>
        <HeroSection />
        <AboutSection />
        <WhyChooseUs />
        <ActivitiesSection />
        <EnvironmentSection />
        <AchievementsSection />
        <TestimonialsSection />
        <GallerySection />
        <NoticeBoardSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
