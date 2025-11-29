"use client";
import React, { useEffect, useState } from "react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import type { AboutContent } from "@/types/about";
import { DEFAULT_ABOUT_CONTENT } from "@/data/aboutDefaults";

export default function AboutUs() {
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAbout() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/about");
        if (!res.ok) {
          throw new Error(`Failed to fetch About Us: ${res.status}`);
        }
        const data = await res.json();
        const content = data?.about ?? data;
        if (isMounted && content) {
          setAbout(content);
        }
      } catch (err: any) {
        console.error("Unable to load About Us content", err);
        if (isMounted) {
          setAbout(DEFAULT_ABOUT_CONTENT);
          setError("Showing default About Us content.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAbout();

    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('/images/pbb_hd_logo.webp')",
          backgroundSize: "50%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <div className="max-w-6xl mx-auto p-4 sm:p-8 font-sans">
          {/* About Us Section */}
          <section className="mt-10 mb-16">
            <div className="flex flex-col lg:flex-row lg:space-x-12">
              {/* Text Content */}
              <div className="lg:w-2/3">
                <h1 className="text-5xl sm:text-7xl font-extrabold mb-8 relative inline-block">
                  About us
                </h1>

                {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

                {loading ? (
                  <p className="text-lg text-gray-600">Loading About Us...</p>
                ) : (
                  about.body
                    .split(/\n{2,}/)
                    .filter((para) => para.trim().length > 0)
                    .map((para, idx) => (
                      <p
                        key={idx}
                        className={`text-lg max-w-xl ${
                          idx === 0
                            ? "mb-6"
                            : idx === 1
                            ? "mb-8"
                            : "leading-relaxed"
                        }`}
                      >
                        {para}
                      </p>
                    ))
                )}
              </div>

              {/* Image */}
              <div className="lg:w-1/3 mt-8 lg:mt-0">
                <img
                  src="/images/founder_img.webp"
                  alt="Founder image"
                  className="w-full bg-gray-300 rounded-lg overflow-hidden shadow-xl"
                />
              </div>
            </div>
          </section>

          {/* --- */}

          {/* Awards and Recognition Section */}
          <section className="mb-16 pt-8">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 relative inline-block">
              Awards and Recognition
            </h2>

            <div className="space-y-4">
              {about.awards.map((award) => (
                <div
                  key={award.id}
                  className="flex justify-between items-center text-xl font-medium border-b border-gray-300 pb-2"
                >
                  <span>{award.title}</span>
                  <span className="text-gray-600 font-normal">
                    {award.years}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* --- */}
          <span className="block border-t-3 border-gray-300 my-8"></span>

          {/* Mission & Vision Section */}
          <section className="pt-16 relative">
            <div className="flex flex-col sm:flex-row justify-between text-center relative z-10">
              {/* Mission */}
              <div className="sm:w-1/2 p-4">
                <h3 className="text-4xl sm:text-5xl font-extrabold mb-4 inline-block relative">
                  Mission
                </h3>
                <p className="mt-2 text-base sm:text-lg mx-auto max-w-xs">
                  To inform, inspire, and empower the Bisaya community by
                  promoting cultural pride, local excellence, and authentic
                  experience one story at a time.
                </p>
              </div>

              {/* Divider (Optional, useful for mobile/tablet) */}
              <div className="sm:hidden border-t border-gray-200 my-8"></div>

              {/* Vision */}
              <div className="sm:w-1/2 p-4">
                <h3 className="text-4xl sm:text-5xl font-extrabold mb-4 inline-block relative">
                  Vision
                </h3>
                <p className="mt-2 text-base sm:text-lg mx-auto max-w-xs">
                  To be the leading Cebuano lifestyle and travel hub
                </p>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
}
