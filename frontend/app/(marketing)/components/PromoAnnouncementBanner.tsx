'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Tag, Check, Copy } from 'lucide-react';
import { fetchPublicBanner } from '../../../lib/pricing-plans';

export default function PromoAnnouncementBanner() {
  const [banner, setBanner] = useState<{ isEnabled: boolean; text?: string; couponCode?: string; badgeText?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchPublicBanner().then((data) => {
      if (data && data.isEnabled) {
        setBanner(data);
      }
    });
  }, []);

  if (!banner || !banner.isEnabled || dismissed) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white py-2.5 px-4 text-xs font-medium shadow-sm transition relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-center sm:text-left">
          <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-200 inline" />
            <span>{banner.badgeText || 'SPECIAL OFFER'}</span>
          </span>
          <span className="font-semibold text-white/95">{banner.text}</span>
        </div>

        {banner.couponCode && (
          <div className="flex items-center space-x-2 shrink-0">
            <div className="bg-white text-slate-900 rounded-lg px-2.5 py-1 flex items-center space-x-1.5 font-mono text-[11px] font-black border border-white/40 shadow-xs">
              <Tag className="w-3 h-3 text-orange-600" />
              <span>{banner.couponCode}</span>
            </div>
            <button
              onClick={() => handleCopy(banner.couponCode!)}
              className="bg-black/30 hover:bg-black/50 text-white rounded-lg px-2.5 py-1 font-bold text-[11px] transition flex items-center space-x-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-300" />
                  <span className="text-emerald-200">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
