"use client";
import React from "react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

export default function AboutUs() {
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

                <p className="text-lg mb-6 max-w-xl">
                  <span className="font-bold">Proud Bisaya Bai</span> is a
                  Cebu-based media and creative agency dedicated to amplifying
                  authentic Bisaya stories.
                </p>

                <p className="text-lg mb-8 max-w-xl">
                  We specialize in producing impactful content and campaigns
                  that highlight culture, creativity, and community, serving
                  clients across the country.
                </p>

                <p className="text-lg leading-relaxed">
                  Proud Bisaya Bai was founded on July 22, 2020. The ultimate
                  Bisaya lifestyle and culture blog celebrates, promotes, and
                  preserves Bisaya culture through compelling content on travel,
                  food, events, entertainment, and news. What started as a
                  humble platform has grown into a vibrant site powered by a
                  dynamic team of 16 young, creative individuals. We cover more
                  than just Cebu, exploring and amplifying stories from all over
                  the Philippines where Bisaya thrives, with the goal of uniting
                  communities and inspiring pride in our heritage.
                </p>
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
              <div className="flex justify-between items-center text-xl font-medium border-b border-gray-300 pb-2">
                <span>Best Cebu Blogs</span>
                <span className="text-gray-600 font-normal">2023 - 2024</span>
              </div>
              <div className="flex justify-between items-center text-xl font-medium  pb-2">
                <span>Best Cebu Travel Blog</span>
                <span className="text-gray-600 font-normal">2023</span>
              </div>
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
