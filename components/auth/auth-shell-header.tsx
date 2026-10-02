"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Globe2, MessageCircle } from "lucide-react";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/brand-config";
import { restartFromGate } from "@/lib/restart-gate";

export function AuthShellHeader() {
  return (
    <header className="global-header" role="banner">
      <div className="header-content">
        <div className="header-left">
          {/* Mobile menu hidden — restore via docs/HIDDEN-auth-shell-header-mobile-menu.md */}
          <div className="brand-container">
            <Link
              href="/"
              aria-label={`${BRAND_LOGO_ALT} benefits home`}
              onClick={restartFromGate}
            >
              <Image
                src={BRAND_LOGO_SRC}
                alt={BRAND_LOGO_ALT}
                className="brand-logo"
                width={300}
                height={52}
                priority
              />
            </Link>
          </div>
        </div>
        <div className="header-right">
          <button className="language-selector" type="button" aria-label="Language: English">
            <Globe2 aria-hidden="true" />
            <span>EN</span>
            <ChevronDown aria-hidden="true" />
          </button>
          <button className="virtual-assistant-button" type="button">
            <span className="assistant-icon" aria-hidden="true">
              <MessageCircle />
              <span>•••</span>
            </span>
            <span>Virtual Assistant</span>
          </button>
        </div>
        {/* Header search hidden — restore via docs/HIDDEN-auth-shell-header-search.md */}
      </div>
    </header>
  );
}
