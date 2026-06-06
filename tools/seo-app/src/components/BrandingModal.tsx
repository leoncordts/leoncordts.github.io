"use client";

import { useState } from "react";
import type { BrandingConfig } from "@/lib/seoTypes";

interface Props {
  current: BrandingConfig;
  onSave: (cfg: BrandingConfig) => void;
  onClose: () => void;
}

export default function BrandingModal({ current, onSave, onClose }: Props) {
  const [agencyName, setAgencyName] = useState(current.agencyName);
  const [logoUrl, setLogoUrl] = useState(current.logoUrl);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSave({ agencyName: agencyName.trim(), logoUrl: logoUrl.trim() });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-white font-bold text-lg">Agentur-Branding</h2>
            <p className="text-slate-500 text-xs mt-0.5">Wird im PDF-Report angezeigt</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Agentur-Name
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="z. B. Schmidt Marketing GmbH"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                         text-slate-100 placeholder-slate-600 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Logo-URL
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://ihre-agentur.de/logo.png"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                         text-slate-100 placeholder-slate-600 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <p className="text-slate-600 text-xs mt-1.5">
              Direktlink zu einem PNG oder JPEG (empfohlen: 200 × 50 px)
            </p>
          </div>

          {/* Logo-Vorschau */}
          {logoUrl && (
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Logo-Vorschau"
                className="h-8 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-slate-400 text-xs">Vorschau</span>
            </div>
          )}

          {/* Active branding indicator */}
          {(agencyName || logoUrl) && (
            <div className="flex items-center gap-2 p-3 bg-indigo-950/50 border border-indigo-800/50 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
              <p className="text-indigo-300 text-xs">
                White-Label aktiv — PDFs erscheinen unter Ihrem Markennamen
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400
                         hover:text-slate-200 hover:border-slate-600 transition text-sm font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500
                         text-white font-semibold text-sm transition"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
