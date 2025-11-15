"use client";

import { COLORS, SCHOOL_INFO } from "@/constants/config";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", href: "#about" },
    { name: "Admissions", href: "/register" },
    { name: "Academic Programs", href: "#programs" },
    { name: "Faculty", href: "#faculty" },
    { name: "Student Life", href: "#activities" },
    { name: "Contact", href: "#contact" },
  ];

  const resources = [
    { name: "Student Portal", href: "/login" },
    { name: "Parent Portal", href: "/login" },
    { name: "Staff Portal", href: "/login" },
    { name: "Library", href: "#library" },
    { name: "Calendar", href: "#calendar" },
    { name: "News & Events", href: "#news" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: COLORS.primary[500] }}
              >
                <Image
                  src={SCHOOL_INFO.logo}
                  alt={SCHOOL_INFO.name}
                  width={100}
                  height={100}
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{SCHOOL_INFO.name}</h3>
                <p className="text-gray-400">{SCHOOL_INFO.tagline}</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 max-w-md">
              {SCHOOL_INFO.motto}. Established in {SCHOOL_INFO.established}, we
              continue to provide excellence in education and nurture future
              leaders.
            </p>

            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span className="sr-only">Facebook</span>
                <FaFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span className="sr-only">Twitter</span>
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span className="sr-only">Instagram</span>
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <span className="sr-only">LinkedIn</span>
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Resources</h4>
            <ul className="space-y-3">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
            <div>
              <h5 className="font-semibold text-white mb-2">Address</h5>
              <p>{SCHOOL_INFO.address}</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Contact</h5>
              <p>Phone: {SCHOOL_INFO.phone}</p>
              <p>Email: {SCHOOL_INFO.email}</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Office Hours</h5>
              <p>Mon-Fri: 8:00 AM - 5:00 PM</p>
              <p>Sat: 9:00 AM - 2:00 PM</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            © {currentYear} {SCHOOL_INFO.name}. All rights reserved. |
            <a href="#" className="hover:text-white ml-1">
              Privacy Policy
            </a>{" "}
            |
            <a href="#" className="hover:text-white ml-1">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
