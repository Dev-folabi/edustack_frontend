"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { NotificationBanner } from "@/components/dashboard/NotificationBanner";
import { Loader } from "@/components/ui/Loader";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCHOOL_INFO } from "@/constants/config";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, token, isLoading } = useAuthStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && (!user || !token)) {
      router.push("/login");
    }
  }, [user, token, isLoading, router]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Show a loader while auth state is loading or if user is not yet available
  if (isLoading || !user || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <Loader />
          <p className="text-gray-600 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${isSidebarCollapsed ? "md:w-20" : "md:w-64"}
          w-64
          bg-white border-r border-gray-200 shadow-xl md:shadow-none
        `}
      >
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Sidebar isCollapsed={isSidebarCollapsed} />

        {/* Desktop Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all z-10"
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-300 ${
              isSidebarCollapsed ? "" : "rotate-180"
            }`}
          />
        </Button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar - Mobile */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Mobile Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-lg font-bold text-gray-900">
                {SCHOOL_INFO.name}
              </h1>
            </div>

            {/* Mobile User Avatar Placeholder */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Banner */}
        <NotificationBanner />

        {/* Desktop Header */}
        <div className="hidden md:block sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <Header />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-full">
              {/* Breadcrumb could go here */}
              <div className="mb-6 hidden md:block">
                {/* Optional: Add breadcrumb navigation */}
              </div>

              {/* Page Content */}
              <div className="animate-fadeIn">{children}</div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-auto border-t border-gray-200 bg-white py-6">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600">
                  © {new Date().getFullYear()} School Management System. All
                  rights reserved.
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Help
                  </a>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Privacy
                  </a>
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Terms
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

// Scroll to Top Component
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 z-30 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full w-12 h-12"
        >
          <ChevronRight className="w-5 h-5 -rotate-90" />
        </Button>
      )}
    </>
  );
};

export default DashboardLayout;
