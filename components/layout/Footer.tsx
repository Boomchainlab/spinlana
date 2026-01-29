'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container-main py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-2">Spinlana</h3>
            <p className="text-muted text-sm">
              The fastest wheel in the ecosystem. Play, win, and earn rewards.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted hover:text-foreground transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/play" className="text-muted hover:text-foreground transition">
                  Play
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-muted hover:text-foreground transition">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted hover:text-foreground transition">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-foreground transition">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-muted hover:text-foreground transition">
                  Telegram
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted hover:text-foreground transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-foreground transition">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-foreground transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted text-sm">
            © {currentYear} Spinlana. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="text-muted hover:text-foreground transition">
              Status
            </a>
            <a href="#" className="text-muted hover:text-foreground transition">
              API
            </a>
            <a href="#" className="text-muted hover:text-foreground transition">
              Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
