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

// UPDATED PATHS: Added /admin prefix to all paths
const mainListItems = [
  { key: "home", text: "Home", icon: <HomeRoundedIcon />, path: "/admin/dashboard" },

  {
    key: "categories",
    text: "Categories",
    icon: <CategoryIcon />,
    path: "/admin/dashboard/categories",
  },
  {
    key: "subcategories",
    text: "SubCategories",
    icon: <KeyboardDoubleArrowDownIcon />,
    path: "/admin/dashboard/subcategories",
  },
  {
    key: "products",
    text: "Products",
    icon: <RealEstateAgentIcon />,
    path: "/admin/dashboard/products",
  },
  {
    key: "prices",
    text: "Prices",
    icon: <PriceChangeIcon />,
    path: "/admin/dashboard/prices",
  },
  {
    key: "orders",
    text: "Orders",
    icon: <AssignmentRoundedIcon />,
    path: "/admin/dashboard/orders",
  },
  {
    key: "customers",
    text: "Customer",
    icon: <PersonIcon />,
    path: "/admin/dashboard/customers",
  },
  {
    key: "comments",
    text: "Comment",
    icon: <CommentIcon />,
    path: "/admin/dashboard/comments",
  },
  {
    key: "banking",
    text: "Banking",
    icon: <AccountBalanceIcon />,
    path: "/admin/dashboard/banking",
  },
  {
    key: "personnel",
    text: "Personnel",
    icon: <PeopleRoundedIcon />,
    path: "/admin/dashboard/personnel",
  },
];

// UPDATED PATHS: Added /admin prefix to all paths
const secondaryListItems = [
  {
    key: "settings",
    text: "Settings",
    icon: <SettingsRoundedIcon />,
    path: "/admin/dashboard/settings",
  },
  {
    key: "about",
    text: "About",
    icon: <InfoRoundedIcon />,
    path: "/admin/dashboard/about",
  },
  {
    key: "feedback",
    text: "Feedback",
    icon: <HelpRoundedIcon />,
    path: "/admin/dashboard/feedback",
  },
];

export default function MenuContent() {
  const { modules } = useModules();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item) => {
          const isDisabled =
            item.key === "home" ? false : !(modules && modules[item.key]);

          return (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={isDisabled ? undefined : NavLink}
                to={isDisabled ? undefined : item.path}
                disabled={isDisabled}
                {...(item.text === "Home" && { end: true })}
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

      <List dense>
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