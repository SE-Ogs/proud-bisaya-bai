"use client";
import React, { useEffect } from "react";
import Footer from "@/app/components/Footer";
import Header from "../components/Header";

export default function ContactUsPage() {
  useEffect(() => {
    // Handle smooth scroll to our-services section when hash is present
    const handleScroll = () => {
      if (window.location.hash === "#our-services") {
        const element = document.getElementById("our-services");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // Try scrolling immediately
    handleScroll();

    // Also try after a short delay in case the page is still loading
    const timeout = setTimeout(handleScroll, 300);

    return () => clearTimeout(timeout);
  }, []);
  const packages = [
    {
      name: "Media & Content Creation",
      features: [
        { text: "Video, Photography, and Graphic Design" },
        { text: "Social Media Management" },
        {
          text: "Vlogs and Short-Form Content",
          note: "(Reels, Tiktok, YouTube Shorts)",
        },
        { text: "Branding and Visual Storytelling" },
      ],
      cta: "Get Started",
    },
    {
      name: "Promotions & Digital Marketing",
      features: [
        { text: "Local Business Features" },
        { text: "Tourism and Cultural Campaigns" },
        { text: "Influencer Collaborations" },
        { text: "Online Giveaways and Product Launches" },
      ],
      cta: "Get Started",
    },
    {
      name: "Events & Coverage",
      features: [
        { text: "Event Hosting", note: "(Onsite and Online)" },
        { text: "Coverage of Festivals, Launches, and Ceremonies" },
        { text: "Press and Media Kit Preparation" },
      ],
      cta: "Get Started",
    },
    {
      name: "Photography & Videography",
      features: [
        { text: "Lifestyle and Portrait Sessions" },
        { text: "Product Photography" },
        { text: "Aerial Drone Coverage" },
        { text: "Editorial and Conceptual Shots" },
      ],
      cta: "Get Started",
    },
  ];

  const goToContact = (e?: React.MouseEvent) => {
    e?.preventDefault();
    document
      .getElementById("contact-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Advertising Packages */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--custom-brown)] to-[var(--custom-orange)]">
            Join our growing community — Advertise with us today
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Showcase your brand to a vibrant, engaged Bisaya audience.
          </p>

          <div className="flex justify-center mt-6">
            <a
              href="#contact-form"
              onClick={goToContact}
              className="inline-flex items-center rounded-lg bg-[var(--custom-red)] px-8 py-4 text-white text-base font-semibold shadow-sm transition-transform transform hover:scale-105 hover:shadow-xl"
            >
              Get featured now!
            </a>
          </div>
        </div>
      </section>

      {/* Our Services (has grayish background) */}
      <section id="our-services" className="relative mt-16 bg-gradient-to-b from-gray-50 via-white to-gray-100 py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Our Services
          </h2>
          <div className="h-1.5 w-16 bg-[var(--custom-orange)] rounded-full mx-auto mt-3 mb-4" />
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Explore a variety of creative and digital marketing services
            designed to amplify your brand’s story and connect with proud Bisaya
            audiences.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="mx-auto mt-12 max-w-6xl grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 px-6">
          {[
            {
              name: "Media & Content Creation",
              description:
                "Crafting authentic visuals and stories that spark engagement.",
              features: [
                "Video, Photography, and Graphic Design",
                "Social Media Management",
                "Vlogs and Short-Form Content (Reels, Tiktok, YouTube Shorts)",
                "Branding and Visual Storytelling",
              ],
            },
            {
              name: "Promotions & Digital Marketing",
              description:
                "Building visibility through creative online campaigns.",
              features: [
                "Local Business Features",
                "Tourism and Cultural Campaigns",
                "Influencer Collaborations",
                "Online Giveaways and Product Launches",
              ],
            },
            {
              name: "Events & Coverage",
              description:
                "Bringing your moments to life with energy and precision.",
              features: [
                "Event Hosting (Onsite and Online)",
                "Coverage of Festivals, Launches, and Ceremonies",
                "Press and Media Kit Preparation",
              ],
            },
            {
              name: "Photography & Videography",
              description:
                "Capturing your brand story through vibrant visuals.",
              features: [
                "Lifestyle and Portrait Sessions",
                "Product Photography",
                "Aerial Drone Coverage",
                "Editorial and Conceptual Shots",
              ],
            },
          ].map((service, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center rounded-2xl bg-white border border-gray-100 shadow-md p-8 transition-all transform hover:-translate-y-2 hover:shadow-xl hover:border-[var(--custom-orange)]"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                {service.description}
              </p>

              <ul className="space-y-3 text-left w-full max-w-sm mx-auto">
                {service.features.map((f, subIdx) => (
                  <li key={subIdx} className="flex items-start gap-3">
                    <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--custom-orange)] flex-shrink-0" />
                    <p className="text-sm text-gray-700">{f}</p>
                  </li>
                ))}
              </ul>

              <a
                href="#contact-form"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact-form")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-8 inline-block w-full rounded-md bg-gradient-to-r from-[var(--custom-brown)] to-[var(--custom-orange)] text-white px-6 py-3 text-sm font-semibold transition-transform transform hover:scale-105 hover:shadow-lg"
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact-form"
        className="mx-auto max-w-6xl px-4 py-20 border-t border-gray-100"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Left */}
          <aside className="lg:col-span-2">
            <h3 className="text-4xl font-extrabold text-gray-900 mb-6">
              <span className="inline-block w-1.5 h-6 md:h-7 rounded-full bg-[var(--custom-orange)] mr-2" />
              Contact Us
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Let’s collaborate! Whether you’re looking to advertise, sponsor,
              or share your story — we’d love to hear from you.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <img
                  src="/images/yellow-phone.webp"
                  alt="Phone"
                  width={20}
                  height={20}
                />
                <span className="text-gray-800">0966 176 5800</span>
              </li>
              <li className="flex items-center gap-3">
                <img
                  src="/images/yellow-email.webp"
                  alt="Email"
                  width={20}
                  height={20}
                />
                <span className="text-gray-800">
                  proudbisayabai.ph@gmail.com
                </span>
              </li>
              <li className="flex items-center gap-3">
                <img
                  src="/images/yellow-facebook.webp"
                  alt="Facebook"
                  width={20}
                  height={20}
                />
                <span className="text-gray-800">Proud Bisaya Bai</span>
              </li>
            </ul>
          </aside>

          {/* Right - Form */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                We’d love to hear from you!
              </h4>
              <p className="text-sm text-gray-600 mb-6">
                Send us a message and we’ll get back soon.
              </p>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = Object.fromEntries(
                    new FormData(e.currentTarget as HTMLFormElement)
                  );
                  alert("Thanks! We received your message.");
                  console.log("Form payload:", data);
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      name="fullName"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--custom-orange)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone number
                    </label>
                    <div className="flex">
                      <select
                        name="dial"
                        defaultValue="+63"
                        className="w-24 rounded-l-md border border-gray-300 bg-gray-50 px-2 py-2 text-sm outline-none"
                      >
                        <option value="+63">+63</option>
                        <option value="+1">+1</option>
                        <option value="+61">+61</option>
                      </select>
                      <input
                        name="phone"
                        placeholder="9xx xxx xxxx"
                        className="w-full rounded-r-md border border-l-0 border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--custom-orange)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      name="company"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--custom-orange)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="proudbisayabai@gmail.com"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--custom-orange)] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Your message
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Type your message here..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--custom-orange)] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 rounded-md bg-[var(--custom-red)] text-white px-4 py-3 text-sm font-semibold transition-transform transform hover:scale-105 hover:shadow-lg"
                >
                  Send message
                </button>

                <p className="mt-2 text-center text-[11px] text-gray-500">
                  By messaging us, you agree to our{" "}
                  <a
                    href="/privacy-and-support"
                    className="font-medium text-gray-700 underline"
                  >
                    Privacy & Support
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
