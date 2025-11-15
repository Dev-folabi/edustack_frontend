"use client";

import { useState } from "react";
import { COLORS, SCHOOL_INFO } from "@/constants/config";
import { FaGlobe, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });

      setTimeout(() => setSubmitStatus("idle"), 3000);
    }, 2000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section
      id="contact"
      className="py-20"
      style={{ backgroundColor: COLORS.background.accent }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: COLORS.primary[700] }}
          >
            Contact Us
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with us for admissions, inquiries, or any questions you
            may have.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3
              className="text-2xl font-bold mb-8"
              style={{ color: COLORS.primary[600] }}
            >
              Get In Touch
            </h3>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: COLORS.primary[500] }}
                >
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Address</h4>
                  <p className="text-gray-600">{SCHOOL_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: COLORS.primary[500] }}
                >
                  <FaPhone />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Phone</h4>
                  <p className="text-gray-600">{SCHOOL_INFO.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: COLORS.primary[500] }}
                >
                  <FaEnvelope />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Email</h4>
                  <p className="text-gray-600">{SCHOOL_INFO.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: COLORS.primary[500] }}
                >
                  <FaGlobe />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Website</h4>
                  <p className="text-gray-600">{SCHOOL_INFO.website}</p>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
              <h4
                className="font-bold text-lg mb-4"
                style={{ color: COLORS.primary[600] }}
              >
                Office Hours
              </h4>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3
              className="text-2xl font-bold mb-6"
              style={{ color: COLORS.primary[600] }}
            >
              Send us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={
                      {
                        "--tw-ring-color": COLORS.primary[500],
                      } as React.CSSProperties
                    }
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={
                      {
                        "--tw-ring-color": COLORS.primary[500],
                      } as React.CSSProperties
                    }
                    placeholder="Your email address"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={
                      {
                        "--tw-ring-color": COLORS.primary[500],
                      } as React.CSSProperties
                    }
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={
                      {
                        "--tw-ring-color": COLORS.primary[500],
                      } as React.CSSProperties
                    }
                  >
                    <option value="">Select a subject</option>
                    <option value="admission">Admission Inquiry</option>
                    <option value="general">General Information</option>
                    <option value="academic">Academic Programs</option>
                    <option value="facilities">Facilities</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 resize-vertical"
                  style={
                    {
                      "--tw-ring-color": COLORS.primary[500],
                    } as React.CSSProperties
                  }
                  placeholder="Your message"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: COLORS.primary[500] }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </button>

              {submitStatus === "success" && (
                <div className="text-green-600 text-center font-medium">
                  ✅ Message sent successfully! We&apos;ll get back to you soon.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
