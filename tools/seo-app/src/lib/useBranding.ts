"use client";

import { useState, useEffect, useCallback } from "react";
import type { BrandingConfig } from "./seoTypes";

const STORAGE_KEY = "seo_audit_branding";

const DEFAULT_BRANDING: BrandingConfig = { agencyName: "", logoUrl: "" };

export function useBranding() {
  const [branding, setBrandingState] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBrandingState(JSON.parse(raw) as BrandingConfig);
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const saveBranding = useCallback((config: BrandingConfig) => {
    setBrandingState(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, []);

  return { branding, saveBranding, loaded };
}
