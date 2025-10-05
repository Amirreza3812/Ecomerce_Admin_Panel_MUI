import React from "react";
import Navbar from "../Pages/Dashboard/components/AppNavbar";
import Sidebar from "../Pages/Dashboard/components/SideMenu";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar />
        <main style={{ padding: "20px" }}>{children}</main>
      </div>
    </div>
  );
}
