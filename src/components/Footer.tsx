"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--glass-border)] bg-[var(--bg-primary)] py-20 px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group focus-ring rounded-lg">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-violet)] transition-transform duration-200 group-hover:scale-105">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span className="font-bold text-white text-xl">DoseKoPo!</span>
            </Link>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-6 max-w-xs">
              Smart medication dispensing system for modern healthcare facilities.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-base mb-6 tracking-wide">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[var(--text-secondary)] text-sm">
                <svg className="w-5 h-5 text-[var(--accent-cyan)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="leading-relaxed">
                  123 Healthcare Avenue<br />
                  Medical District, MD 12345
                </span>
              </li>
              <li className="flex items-center gap-3 text-[var(--text-secondary)] text-sm">
                <svg className="w-5 h-5 text-[var(--accent-cyan)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:5551234567" className="link-underline hover:text-white">(555) 123-4567</a>
              </li>
              <li className="flex items-center gap-3 text-[var(--text-secondary)] text-sm">
                <svg className="w-5 h-5 text-[var(--accent-cyan)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:contact@dosekopo.com" className="link-underline hover:text-white">contact@dosekopo.com</a>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 className="text-white font-semibold text-base mb-6 tracking-wide">Operating Hours</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <span className="status-dot status-dot-online status-pulse"></span>
                <span className="text-[var(--accent-emerald)] font-medium">24/7 Patient Care</span>
              </li>
              <li className="text-[var(--text-muted)] text-sm pt-2">Administrative Hours</li>
              <li className="text-[var(--text-secondary)] text-sm">Monday — Friday, 8:00 AM — 6:00 PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--glass-border)] flex flex-wrap items-center justify-between gap-4">
          <p className="text-[var(--text-muted)] text-sm m-0">
            &copy; 2025 DoseKoPo! All rights reserved.
          </p>
          <p className="text-[var(--text-dim)] text-sm m-0">
            Smart Medication Dispensing System
          </p>
        </div>
      </div>
    </footer>
  );
}
