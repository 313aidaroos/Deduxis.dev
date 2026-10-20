"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ApixisWalletChip } from "@/components/ApixisWalletChip";
import { socialProfiles } from "@/lib/social";
import { IxisCompanies } from "@/components/IxisCompanies";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="site-nav container">
        <Link className="wordmark" href="/" aria-label="Deduxis home">
          <Image
            src="/brand/logo-full.png"
            alt=""
            width={2592}
            height={747}
            priority
          />
        </Link>
        <nav
          aria-label="Main navigation"
          className={open ? "main-nav open" : "main-nav"}
        >
          <Link onClick={() => setOpen(false)} href="/#how-it-works">
            How it works
          </Link>
          <Link onClick={() => setOpen(false)} href="/#features">
            Features
          </Link>
          <Link onClick={() => setOpen(false)} href="/recover">
            Recover
          </Link>
          <Link onClick={() => setOpen(false)} href="/companies">Apixis Companies</Link>
          <Link onClick={() => setOpen(false)} href="/feed">Feed</Link>
          <Link onClick={() => setOpen(false)} href="/pricing">
            Pricing
          </Link>
          <Link onClick={() => setOpen(false)} href="/demo">
            Explore the workspace
          </Link>
        </nav>
        <div className="nav-actions">
          <ApixisWalletChip hideSignedOut />
          <Link className="sign-in" href="/login">
            Sign in
          </Link>
          <Link className="button primary small" href="/login">
            Get started <span aria-hidden>↗</span>
          </Link>
          <button
            className="menu-toggle"
            aria-expanded={open}
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen(!open)}
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer container">
      <div>
        <Link href="/" className="wordmark">
          Deduxis<span className="brand-dot">.</span>
        </Link>
        <span className="family">Part of the Apixis family</span>
        <a
          className="footer-social"
          href={socialProfiles.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Deduxis on Instagram"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" />
          </svg>
        </a>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/recover">Recover</Link>
        <Link href="/#faq">Questions & answers</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/chat">Ask Cixy</Link>
        <Link href="/support">Support</Link>
        <IxisCompanies />
      </nav>
      <p>
        Organize with confidence. Confirm filing decisions with your tax
        professional.
      </p>
    </footer>
  );
}
