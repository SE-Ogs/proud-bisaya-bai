"use client";
import React, { useEffect, useState } from "react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

export default function AboutUs() {
  const [description, setDescription] = useState("");
  const [teamMembers, setTeamMembers] = useState<
    Array<{
      id: string;
      photo_url: string | null;
      name: string;
      company_title: string | null;
      display_order: number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAbout() {
      try {
        setLoading(true);
        setError(null);

        const [contentRes, teamRes] = await Promise.all([
          fetch("/api/about-us-content"),
          fetch("/api/team-members"),
        ]);

        if (!contentRes.ok) {
          throw new Error(`Failed to fetch About Us: ${contentRes.status}`);
        }

        const contentData = await contentRes.json();
        if (isMounted) {
          setDescription(contentData?.description || "");
        }

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          if (isMounted) {
            setTeamMembers(Array.isArray(teamData) ? teamData : []);
          }
        }
      } catch (err: any) {
        console.error("Unable to load About Us content", err);
        if (isMounted) {
          setError("Unable to load About Us content.");
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
            <div>
              {/* Text Content */}
              <div>
                <h1 className="text-5xl sm:text-7xl font-extrabold mb-8 relative inline-block">
                  About us
                </h1>

                {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

                {loading ? (
                  <p className="text-lg text-gray-600">Loading About Us...</p>
                ) : description ? (
                  <div
                    className="prose prose-lg max-w-none text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                ) : null}
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

          {/* --- */}
          <span className="block border-t-3 border-gray-300 my-8"></span>

          {/* Team Members Section */}
          {teamMembers.length > 0 && (
            <section className="mb-16 pt-8">
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 relative inline-block">
                Meet the Team!
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="text-center p-4 rounded-lg border-2 border-[var(--custom-orange)] bg-white"
                  >
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center text-gray-400">
                        No Photo
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-black mb-1">
                      {member.name}
                    </h3>
                    {member.company_title && (
                      <p className="text-gray-600">{member.company_title}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}
