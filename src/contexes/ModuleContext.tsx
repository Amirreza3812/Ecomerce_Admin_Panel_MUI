import React, { createContext, useContext } from "react";
import { useLicense } from "./LicenseContext";
import type { LicenseModules } from "../config/license";

type ModuleContextType = {
  modules: LicenseModules | undefined;
  isLoading: boolean;
  isError: boolean;
};

const ModuleContext = createContext<ModuleContextType>({
  modules: undefined,
  isLoading: false,
  isError: false,
});

export const useModules = () => useContext(ModuleContext);

export const ModuleProvider = ({ children }: { children: React.ReactNode }) => {
  const { modules, license } = useLicense();

  return (
    <ModuleContext.Provider
      value={{
        modules: license.expired ? { ...modules, /* all false optional */ } : modules,
        isLoading: false,
        isError: false,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
};