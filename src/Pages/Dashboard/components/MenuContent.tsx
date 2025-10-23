// src/Pages/Dashboard/components/MenuContent.tsx

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
// ... all your icon imports
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
import { NavLink } from "react-router-dom";
import { useModules } from "../../../contexes/ModuleContext.tsx";

// The list of items remains the same, with a unique 'key' for each
const mainListItems = [
  { key: "home", text: "Home", icon: <HomeRoundedIcon />, path: "/dashboard" },

  {
    key: "categories",
    text: "Categories",
    icon: <CategoryIcon />,
    path: "/dashboard/categories",
  },
  {
    key: "subcategories",
    text: "SubCategories",
    icon: <KeyboardDoubleArrowDownIcon />,
    path: "/dashboard/subcategories",
  },
  {
    key: "products",
    text: "Products",
    icon: <RealEstateAgentIcon />,
    path: "/dashboard/products",
  },
  {
    key: "prices",
    text: "Prices",
    icon: <PriceChangeIcon />,
    path: "/dashboard/prices",
  },
  {
    key: "orders",
    text: "Orders",
    icon: <AssignmentRoundedIcon />,
    path: "/dashboard/orders",
  },
  {
    key: "customers",
    text: "Customer",
    icon: <PersonIcon />,
    path: "/dashboard/customers",
  },
  {
    key: "comments",
    text: "Comment",
    icon: <CommentIcon />,
    path: "/dashboard/comments",
  },
  {
    key: "banking",
    text: "Banking",
    icon: <AccountBalanceIcon />,
    path: "/dashboard/banking",
  },
  {
    key: "personnel",
    text: "Personnel",
    icon: <PeopleRoundedIcon />,
    path: "/dashboard/personnel",
  },
];

const secondaryListItems = [
  {
    key: "settings",
    text: "Settings",
    icon: <SettingsRoundedIcon />,
    path: "/dashboard/settings",
  },
  {
    key: "about",
    text: "About",
    icon: <InfoRoundedIcon />,
    path: "/dashboard/about",
  },
  {
    key: "feedback",
    text: "Feedback",
    icon: <HelpRoundedIcon />,
    path: "/dashboard/feedback",
  },
];

export default function MenuContent() {
  const { modules } = useModules();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {/* --- CHANGE: We map over the full list and determine disabled status inside --- */}
        {mainListItems.map((item) => {
          // Determine if this item should be disabled
          const isDisabled =
            item.key === "home" ? false : !(modules && modules[item.key]);

          return (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                // --- CONDITIONAL PROPS BASED ON isDisabled ---
                component={isDisabled ? undefined : NavLink}
                to={isDisabled ? undefined : item.path}
                disabled={isDisabled}
                // The 'end' prop for the Home link still works
                {...(item.text === "Home" && { end: true })}
                sx={{
                  "&.active": {
                    backgroundColor: "action.selected",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                  },
                  // --- RE-ADD THE DISABLED STYLES ---
                  "&.Mui-disabled": {
                    color: "text.disabled",
                    "& .MuiListItemIcon-root": {
                      color: "text.disabled",
                    },
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <List dense>
        {/* --- SAME CHANGE FOR THE SECONDARY LIST --- */}
        {secondaryListItems.map((item) => {
          const isDisabled = !(modules && modules[item.key]);

          return (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={isDisabled ? undefined : NavLink}
                to={isDisabled ? undefined : item.path}
                disabled={isDisabled}
                sx={{
                  "&.active": {
                    backgroundColor: "action.selected",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": {
                      color: "primary.main",
                    },
                  },
                  "&.Mui-disabled": {
                    color: "text.disabled",
                    "& .MuiListItemIcon-root": {
                      color: "text.disabled",
                    },
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}
