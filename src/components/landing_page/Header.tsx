"use client";

import { useState } from "react";
import Link from "next/link";
import { COLORS, SCHOOL_INFO } from "@/constants/colors";
import Image from "next/image";

interface HeaderProps {
  isLoggedIn: boolean;
}

export default function Header({ isLoggedIn }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
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
              <h1
                className="text-xl font-bold"
                style={{ color: COLORS.primary[700] }}
              >
                {SCHOOL_INFO.name}
              </h1>
              <p className="text-xs text-gray-500">{SCHOOL_INFO.tagline}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="font-medium transition-colors duration-200"
                style={{ 
                  color: COLORS.gray[700] 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLORS.primary[600];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLORS.gray[700];
                }}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 rounded-full text-white font-medium transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: COLORS.primary[500] }}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 font-medium transition-colors duration-200"
                  style={{ color: COLORS.gray[700] }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.primary[600];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = COLORS.gray[700];
                  }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 rounded-full text-white font-medium transition-all duration-200 hover:shadow-lg"
                  style={{ backgroundColor: COLORS.primary[500] }}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMobileMenuOpen
                    ? "rotate-45 translate-y-1"
                    : "-translate-y-0.5"
                }`}
                style={{ backgroundColor: COLORS.gray[700] }}
              ></span>
              <span
                className={`block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
                style={{ backgroundColor: COLORS.gray[700] }}
              ></span>
              <span
                className={`block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMobileMenuOpen
                    ? "-rotate-45 -translate-y-1"
                    : "translate-y-0.5"
                }`}
                style={{ backgroundColor: COLORS.gray[700] }}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="font-medium transition-colors duration-200"
                  style={{ color: COLORS.gray[700] }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-200">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="block w-full text-center px-6 py-2 rounded-full text-white font-medium"
                    style={{ backgroundColor: COLORS.primary[500] }}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="block w-full text-center px-4 py-2 font-medium"
                      style={{ color: COLORS.gray[700] }}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full text-center px-6 py-2 rounded-full text-white font-medium"
                      style={{ backgroundColor: COLORS.primary[500] }}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
