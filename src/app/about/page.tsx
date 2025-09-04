"use client";

import Link from "next/link";
import Image from "next/image";
import { COLORS, SCHOOL_INFO } from "@/constants/colors";
import Header from "@/components/landing_page/Header";
import Footer from "@/components/landing_page/Footer";
import { useAuthStore } from "@/store/authStore";
import { FaGraduationCap, FaUsers, FaTrophy, FaGlobe, FaHeart, FaLightbulb } from "react-icons/fa";

export default function AboutPage() {
  const { isLoggedIn } = useAuthStore();

  const stats = [
    { number: "25+", label: "Years of Excellence", icon: FaTrophy },
    { number: "2000+", label: "Students Graduated", icon: FaGraduationCap },
    { number: "150+", label: "Expert Faculty", icon: FaUsers },
    { number: "50+", label: "Countries Reached", icon: FaGlobe }
  ];

  const values = [
    {
      icon: FaLightbulb,
      title: "Innovation",
      description: "We embrace cutting-edge teaching methods and technology to enhance learning experiences."
    },
    {
      icon: FaHeart,
      title: "Compassion",
      description: "We foster a caring environment where every student feels valued and supported."
    },
    {
      icon: FaTrophy,
      title: "Excellence",
      description: "We strive for the highest standards in education and personal development."
    },
    {
      icon: FaUsers,
      title: "Community",
      description: "We build strong relationships between students, families, and educators."
    }
  ];

  const milestones = [
    { year: "1995", event: "EduStack Academy Founded", description: "Started with a vision to provide quality education" },
    { year: "2000", event: "First Graduation Class", description: "Celebrated our first batch of successful graduates" },
    { year: "2005", event: "Technology Integration", description: "Introduced smart classrooms and digital learning" },
    { year: "2010", event: "International Recognition", description: "Received accreditation from global education bodies" },
    { year: "2015", event: "Campus Expansion", description: "Opened new facilities and expanded programs" },
    { year: "2020", event: "Digital Transformation", description: "Successfully transitioned to hybrid learning model" },
    { year: "2024", event: "AI-Powered Learning", description: "Launched innovative AI-assisted educational platform" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header isLoggedIn={isLoggedIn} />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20" style={{ backgroundColor: COLORS.background.accent }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6" style={{ color: COLORS.primary[700] }}>
                About {SCHOOL_INFO.name}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {SCHOOL_INFO.motto}. For over {new Date().getFullYear() - parseInt(SCHOOL_INFO.established)} years, 
                we have been dedicated to providing exceptional education and nurturing future leaders.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: COLORS.primary[100] }}>
                    <stat.icon className="w-8 h-8" style={{ color: COLORS.primary[600] }} />
                  </div>
                  <div className="text-4xl font-bold mb-2" style={{ color: COLORS.primary[700] }}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20" style={{ backgroundColor: COLORS.background.accent }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6" style={{ color: COLORS.primary[700] }}>
                  Our Mission
                </h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  To provide a comprehensive, innovative, and inclusive educational experience that empowers 
                  students to become critical thinkers, compassionate leaders, and lifelong learners who 
                  contribute positively to their communities and the world.
                </p>
                <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.primary[600] }}>
                  Our Vision
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To be a globally recognized institution that sets the standard for educational excellence, 
                  innovation, and character development, preparing students for success in an ever-evolving world.
                </p>
              </div>
              <div className="relative">
                <Image
                  src="https://ik.imagekit.io/edustack/edustack/Whisk_7a8f83bd16.jpg"
                  alt="Students in classroom"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: COLORS.primary[700] }}>
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do at {SCHOOL_INFO.name}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: COLORS.primary[100] }}>
                    <value.icon className="w-8 h-8" style={{ color: COLORS.primary[600] }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: COLORS.primary[700] }}>
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* History Timeline */}
        <section className="py-20" style={{ backgroundColor: COLORS.background.accent }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: COLORS.primary[700] }}>
                Our Journey
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Key milestones in our educational excellence journey
              </p>
            </div>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full" style={{ backgroundColor: COLORS.primary[300] }}></div>
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="text-2xl font-bold mb-2" style={{ color: COLORS.primary[600] }}>
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary[700] }}>
                          {milestone.event}
                        </h3>
                        <p className="text-gray-600">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS.primary[500] }}></div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: COLORS.primary[700] }}>
                Leadership Team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Meet the dedicated professionals leading our educational mission
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "Dr. Sarah Johnson", role: "Principal", image: "/api/placeholder/300/300" },
                { name: "Prof. Michael Chen", role: "Academic Director", image: "/api/placeholder/300/300" },
                { name: "Ms. Emily Rodriguez", role: "Student Affairs Director", image: "/api/placeholder/300/300" }
              ].map((leader, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-4">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      width={200}
                      height={200}
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.primary[700] }}>
                    {leader.name}
                  </h3>
                  <p className="text-gray-600 font-medium">{leader.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20" style={{ backgroundColor: COLORS.primary[50] }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6" style={{ color: COLORS.primary[700] }}>
              Join Our Community
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover how {SCHOOL_INFO.name} can help your child reach their full potential. 
              We invite you to be part of our educational journey.
            </p>
            <div className="space-x-4">
              <Link
                href="/register"
                className="inline-block px-8 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: COLORS.primary[500] }}
              >
                Apply Now
              </Link>
              <Link
                href="/#contact"
                className="inline-block px-8 py-3 rounded-lg border-2 font-medium transition-all duration-200 hover:shadow-lg"
                style={{ borderColor: COLORS.primary[500], color: COLORS.primary[600] }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}