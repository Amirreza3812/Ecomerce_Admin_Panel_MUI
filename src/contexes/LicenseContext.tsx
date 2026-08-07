import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  type LicenseInfo,
  type LicenseModules,
  defaultLicenseConfig,
  normalizeLicense,
} from "../config/license";

type LicenseContextType = {
  license: LicenseInfo;
  modules: LicenseModules;
  setLicense: (lic: Partial<LicenseInfo> | null) => void;
  isModuleEnabled: (key: keyof LicenseModules) => boolean;
  canCreateAdmins: boolean;
};

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

const STORAGE_KEY = "app_license";

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [license, setLicenseState] = useState<LicenseInfo>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return normalizeLicense(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    return normalizeLicense(defaultLicenseConfig);
  });

  const setLicense = (lic: Partial<LicenseInfo> | null) => {
    const next = normalizeLicense(lic || defaultLicenseConfig);
    setLicenseState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  // Recompute days_left occasionally
  useEffect(() => {
    setLicenseState((prev) => normalizeLicense(prev));
  }, []);

  const value = useMemo(
    () => ({
      license,
      modules: license.modules,
      setLicense,
      isModuleEnabled: (key: keyof LicenseModules) =>
        !license.expired && !!license.modules[key],
      canCreateAdmins: license.can_create_admins,
    }),
    [license]
  );

  return (
    <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>
  );
}

export function useLicense() {
  const ctx = useContext(LicenseContext);
  if (!ctx) {
    throw new Error("useLicense must be used within LicenseProvider");
  }
  return ctx;
}