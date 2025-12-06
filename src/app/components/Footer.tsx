"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    // FIX 1: Removed h-dvh. This allows content to flow naturally on mobile.
    <footer
      className="text-white mt-16 w-full"
      style={{ backgroundColor: "var(--custom-blue)" }}
    >
      {/* Top section - full width edge-to-edge */}
      <div className="max-w-screen-xl mx-auto w-full px-3 pt-25 py-10 md:px-8 lg:px-16">

        {/* GRID: Newsletter | Filler | Blogs + About + Contact */}
        {/* Adjusted to grid-cols-1 by default (mobile).
            On large screens (lg), it uses grid-cols-3: [Newsletter] [Empty Space] [Blogs/About/Contact] 
            This replaces the function of lg:left-79 without using relative positioning. */}
        <div className="max-w-screen grid grid-cols-1 gap-10 lg:grid-cols-3 items-start">

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-4xl font-bold text-[var(--custom-orange)]">Newsletter</h3>
            <p className="mt-5 text-lg text-white/90">
              Subscribe to our newsletter and get updated to our hottest news
            </p>

            <form
              className="mt-4 flex"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full min-w-0 rounded-l-md bg-white px-3 py-3 text-sm text-black outline-none placeholder:text-gray-500"
                required
              />
              <button
                type="submit"
                className="rounded-r-md bg-[var(--custom-orange)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Join
              </button>
            </form>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              {[
                { href: 'https://www.facebook.com/proudbisayabai', src: '/images/fb_svg.webp', alt: 'Facebook' },
                { href: 'https://www.instagram.com/proudbisayabai', src: '/images/ig_svg.webp', alt: 'Instagram' },
                { href: 'https://x.com/Proudbisayabai', src: '/images/twitter_svg.webp', alt: 'Twitter' },
                { href: 'https://www.youtube.com/channel/UCfVuNpZ2yr3OsVVkYojUsUg', src: '/images/yt_svg.webp', alt: 'YouTube' },
                { href: 'https://www.tiktok.com/@proudbisayabai', src: '/images/tiktok_icon.svg', alt: 'TikTok' },
              ].map((s) => (
                <Link key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.alt}>
                  <div className="w-15 h-15 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Image src={s.src} alt={s.alt} width={30} height={30} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Filler Column: This creates the gap on desktop */}
          <div className="hidden lg:block lg:col-span-1" aria-hidden="true" />
          


          {/* Blogs + About + Contact (Original structure restored - now uses lg:col-span-1) */}
          <div className="text-left mt-10 lg:mt-0">
            {/* Inner sections are organized below */}
            
            {/* Blogs */}
            <div>
              <h3 className="text-4xl font-bold text-[var(--custom-orange)]">Blogs</h3>
              <ul className="mt-5 space-y-4 text-white/90 text-lg">
                <li>
                  <Link href="/articles/destinations" className="hover:text-[var(--custom-orange)] transition-colors">
                    Destinations
                  </Link>
                </li>
                <li>
                  <Link href="/articles/brands-and-products" className="hover:text-[var(--custom-orange)] transition-colors">
                    Brands &amp; Products
                  </Link>
                </li>
                <li>
                  <Link href="/articles/stories" className="hover:text-[var(--custom-orange)] transition-colors">
                    Stories
                  </Link>
                </li>
                <li>
                  <Link href="/articles/news-and-entertainment" className="hover:text-[var(--custom-orange)] transition-colors">
                    News &amp; Entertainment
                  </Link>
                </li>
                <li>
                  <Link href="/articles/food" className="hover:text-[var(--custom-orange)] transition-colors">
                    Food
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div className="mt-10">
              <h3 className="text-4xl font-bold text-[var(--custom-orange)]">About</h3>
              <ul className="mt-5 space-y-4 text-white/90 text-lg">
                <li>
                  <Link href="/about-us" className="hover:text-[var(--custom-orange)] transition-colors">
                    Proud Bisaya Bai
                  </Link>
                </li>
                <li>
                  <Link href="/contact-us#our-services" className="hover:text-[var(--custom-orange)] transition-colors">
                    Hire Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact-us#contact-form" className="hover:text-[var(--custom-orange)] transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-and-support" className="hover:text-[var(--custom-orange)] transition-colors">
                    Privacy &amp; Support
                  </Link>
                </li>
                <li>
                  <Link href="/contact-us" className="hover:text-[var(--custom-orange)] transition-colors">
                    Get Featured
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Contact Us */}
            <div className="mt-10">
              <h3 className="text-4xl font-bold text-[var(--custom-orange)]">Contact Us</h3>
              <div className="mt-5 space-y-4 text-white/90">
                <div>
                  <span>📧:</span>{" "}
                  <a href="mailto:proudbisayabai@gmail.com" className="hover:text-white">
                    proudbisayabai@gmail.com
                  </a>
                </div>
                <div>
                  <span>📞:</span>{" "}
                  <a href="tel:+639123456789" className="hover:text-white">
                    +63 912 345 6789
                  </a>
                </div>
                <div>
                  <span>📍:</span>{" "}
                  <span>Cebu City, Philippines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="mt-15 h-px w-full bg-white/30" />

        {/* Bottom row (Original structure) */}
        <div className="mt-4 flex flex-col items-start justify-between gap-2 text-xs text-white/80 sm:flex-row">
          <span>© {new Date().getFullYear()}, Proud Bisaya Bai</span>
          <span>Powered by JSE | All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;