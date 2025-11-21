"use client";

import React, { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { subscribeToNewsletter } from "@/app/api/newsletter/route";

const Footer: React.FC = () => {
  const [state, action, isPending] = useActionState(subscribeToNewsletter, null);
  return (
    <footer
      className="text-white mt-16 w-full"
      style={{ backgroundColor: "var(--custom-blue)" }}
    >
      {/* Top section - full width edge-to-edge */}
      <div className="w-full px-4 py-12 md:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Newsletter */}
          <div>
            <h3 className="text-2xl font-bold text-white">Newsletter</h3>
            <p className="mt-1 text-sm text-white/90">
              Subscribe to our newsletter and get updated to our hottest news
            </p>

            {/* If successful, show a success message instead of the form */}
            {state?.success ? (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-md text-green-100 text-sm">
                ✅ Success! Please check your email to confirm your subscription.
              </div>
            ) : (
              <form className="mt-4 flex flex-col gap-2" action={action}>
                <div className="flex">
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full min-w-0 rounded-l-md bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-gray-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-r-md bg-[var(--custom-orange)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Joining...' : 'Join'}
                  </button>
                </div>
                {/* Error Message Display */}
                {state?.error && (
                  <p className="text-red-300 text-xs">{state.error}</p>
                )}
              </form>
            )}

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-4">
              <Link
                href="https://www.facebook.com/proudbisayabai"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/images/fb_svg.webp"
                  alt="Facebook"
                  width={32}
                  height={32}
                  className="hover:opacity-80 transition-opacity"
                />
              </Link>
              <Link
                href="https://www.instagram.com/proudbisayabai"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/images/ig_svg.webp"
                  alt="Instagram"
                  width={32}
                  height={32}
                  className="hover:opacity-80 transition-opacity"
                />
              </Link>
              <Link
                href="https://x.com/Proudbisayabai"
                aria-label="Twitter/X"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/images/twitter_svg.webp"
                  alt="Twitter/X"
                  width={32}
                  height={32}
                  className="hover:opacity-80 transition-opacity"
                />
              </Link>
              <Link
                href="https://www.youtube.com/channel/UCfVuNpZ2yr3OsVVkYojUsUg"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/images/yt_svg.webp"
                  alt="YouTube"
                  width={32}
                  height={32}
                  className="hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
          </div>

          {/* Blogs */}
          <div className="md:mx-auto">
            <h3 className="text-2xl font-bold text-white">Blogs</h3>
            <ul className="mt-3 space-y-2 text-white/90">
              <li>
                <Link
                  href="/articles/destinations"
                  className="hover:text-[var(--custom-orange)] transition-colors"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/brands-and-products"
                  className="hover:text-[var(--custom-orange)] transition-colors"
                >
                  Brands &amp; Products
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/stories"
                  className="hover:text-[var(--custom-orange)] transition-colors"
                >
                  Stories
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/news-and-entertainment"
                  className="hover:text-[var(--custom-orange)] transition-colors"
                >
                  News &amp; Entertainment
                </Link>
              </li>
              <li>
                <Link
                  href="/articles/food"
                  className="hover:text-[var(--custom-orange)] transition-colors"
                >
                  Food
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="md:ml-auto">
            <h3 className="text-2xl font-bold text-white">About</h3>
            <ul className="mt-3 space-y-2 text-white/90">
              <li>
                <Link
                  href="/about-us"
                  className="hover:text-[var(--custom-orange)] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="hover:text-[var(--custom-orange)] transition-colors"
                >
                  Hire Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us#contact-form"
                  className="hover:text-[var(--custom-orange)] transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-and-support"
                  className="hover:text-[var(--custom-orange)] transition-colors"
                >
                  Privacy &amp; Support
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="hover:text-[var(--custom-orange)] transition-colors"
                >
                  Be Featured
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 h-px w-full bg-white/30" />

        {/* Bottom row */}
        <div className="mt-4 flex flex-col items-start justify-between gap-2 text-xs text-white/80 sm:flex-row">
          <span>© {new Date().getFullYear()}, Proud Bisaya Bai</span>
          <span>Powered by JSE | All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
