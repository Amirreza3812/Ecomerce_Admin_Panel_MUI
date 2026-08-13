import React, { createContext, useContext, useState, useEffect } from "react";
import { useLicense } from "./LicenseContext";
import { useStaffRole } from "./StaffRoleContext";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import CategoryIcon from "@mui/icons-material/Category";
import CommentIcon from "@mui/icons-material/Comment";
import PersonIcon from "@mui/icons-material/Person";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import RealEstateAgentIcon from "@mui/icons-material/RealEstateAgent";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const ALL_MENU_ITEMS = [
  {
    key: "home",
    text: "Home",
    path: "/admin/dashboard",
    module: "home",
    icon: <HomeRoundedIcon />,
  },
  {
    key: "categories",
    text: "Categories",
    path: "/admin/dashboard/categories",
    module: "categories",
    icon: <CategoryIcon />,
  },
  {
    key: "subcategories",
    text: "SubCategories",
    path: "/admin/dashboard/subcategories",
    module: "subcategories",
    icon: <KeyboardDoubleArrowDownIcon />,
  },
  {
    key: "products",
    text: "Products",
    path: "/admin/dashboard/products",
    module: "products",
    icon: <RealEstateAgentIcon />,
  },
  {
    key: "prices",
    text: "Prices",
    path: "/admin/dashboard/prices",
    module: "prices",
    icon: <PriceChangeIcon />,
  },
  {
    key: "orders",
    text: "Orders",
    path: "/admin/dashboard/orders",
    module: "orders",
    icon: <AssignmentRoundedIcon />,
  },
  {
    key: "customers",
    text: "Customers",
    path: "/admin/dashboard/customers",
    module: "customers",
    icon: <PersonIcon />,
  },
  {
    key: "comments",
    text: "Comments",
    path: "/admin/dashboard/comments",
    module: "comments",
    icon: <CommentIcon />,
  },
  {
    key: "banking",
    text: "Banking",
    path: "/admin/dashboard/banking",
    module: "banking",
    icon: <AccountBalanceIcon />,
  },
  {
    key: "personnel",
    text: "Personnel",
    path: "/admin/dashboard/personnel",
    module: "personnel",
    icon: <PeopleRoundedIcon />,
  },
  {
    key: "settings",
    text: "Settings",
    path: "/admin/dashboard/settings",
    module: "settings",
    icon: <SettingsRoundedIcon />,
  },
  {
    key: "about",
    text: "About",
    path: "/admin/dashboard/about",
    module: "about",
    icon: <InfoRoundedIcon />,
  },
  {
    key: "feedback",
    text: "Feedback",
    path: "/admin/dashboard/feedback",
    module: "feedback",
    icon: <HelpRoundedIcon />,
  },
];

type MenuContextType = {
  menuItems: typeof ALL_MENU_ITEMS;
  isLoading: boolean;
  isError: boolean;
  toggleMenu: (id: string) => void;
  isOpen: (id: string) => boolean;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error("useMenu must be used inside MenuProvider");
  return context;
};

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const { license } = useLicense();
  const staffRole = useStaffRole();

  const [menuItems, setMenuItems] = useState(ALL_MENU_ITEMS);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    console.log(license.modules, staffRole.staffRole);

    if (!license || !staffRole) {
      setMenuItems([]);
      setIsLoading(false);
      return;
    }

    let allowed = ALL_MENU_ITEMS;

    // License modules
    const enabledModules = Object.keys(license.modules).filter(
      (k) => license.modules[k as keyof typeof license.modules]
    );
    allowed = allowed.filter((item) => enabledModules.includes(item.module));

    // Staff role
    const roleMap: Record<string, string[]> = {
      owner: [
        "home",
        "categories",
        "subcategories",
        "products",
        "prices",
        "orders",
        "customers",
        "comments",
        "banking",
        "personnel",
        "settings",
        "about",
        "feedback",
      ],
      manager: [
        "home",
        "categories",
        "subcategories",
        "products",
        "prices",
        "orders",
        "comments",
        "settings",
      ],
      barista: [
        "home",
        "categories",
        "subcategories",
        "products",
        "orders",
        "comments",
      ],
      cashier: ["home", "categories", "subcategories", "products", "orders"],
      accountant: ["home", "banking", "personnel", "orders"],
      custom: [],
    };

    const allowedForRole = roleMap[staffRole.staffRole as string] || []; // <-- fixed type
    allowed = allowed.filter((item) => allowedForRole.includes(item.module));

    setMenuItems(allowed);
    setIsLoading(false);
  }, [license, staffRole]);

  const toggleMenu = (id: string) => {
    console.log("Menu toggled:", id);
  };

  const isOpen = (id: string) => false;

  return (
    <MenuContext.Provider
      value={{ menuItems, isLoading, isError, toggleMenu, isOpen }}
    >
      {children}
    </MenuContext.Provider>
  );
};
