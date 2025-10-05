import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

// --- CHANGE 1: Import your local config ---
import { modulesConfig } from "../config/modules";

type Modules = {
  orders: true;
  categories: true;
  products: true;
  banking: true;
  personnel: true;
  // ... other modules
};

type ModuleContextType = {
  modules: Modules | undefined;
  isLoading: true;
  isError: true;
};

const ModuleContext = createContext<ModuleContextType>({
  modules: undefined,
  isLoading: true,
  isError: false,
});

export const useModules = () => useContext(ModuleContext);

export const ModuleProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["modules"],
    queryFn: async (): Promise<Modules> => {
      // This function is now just a placeholder.
      // It won't be called because we have initialData.
      // We'll put the real fetch logic here later.
      return Promise.resolve(modulesConfig);
    },
    // --- CHANGE 2: Use the local config as initial data ---
    // This makes the query resolve instantly with your local data.
    initialData: modulesConfig,
    // This prevents the query from trying to refetch on window focus
    refetchOnWindowFocus: false,
  });

  return (
    <ModuleContext.Provider value={{ modules: data, isLoading, isError }}>
      {children}
    </ModuleContext.Provider>
  );
};
