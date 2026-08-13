import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";

type StaffRoleContextType = {
  staffRole: string | null;
};

const StaffRoleContext = createContext<StaffRoleContextType>({ staffRole: null });

export const useStaffRole = () => useContext(StaffRoleContext);

export const StaffRoleProvider = ({ children }: { children: React.ReactNode }) => {
  const { admin } = useAuth();

  const staffRole = admin?.staff_role || null;

  return (
    <StaffRoleContext.Provider value={{ staffRole }}>
      {children}
    </StaffRoleContext.Provider>
  );
};