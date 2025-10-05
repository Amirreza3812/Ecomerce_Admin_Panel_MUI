// src/Pages/Dashboard/components/MenuContent.tsx

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
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

const mainListItems = [
  {
    text: "Home",
    icon: <HomeRoundedIcon />,
    path: "/dashboard",
    disabled: false,
  },
  {
    text: "Orders",
    icon: <AssignmentRoundedIcon />,
    path: "/dashboard/orders",
    disabled: false,
  },
  {
    text: "Categories",
    icon: <CategoryIcon />,
    path: "/dashboard/categories",
    disabled: false,
  },
  {
    text: "SubCategories",
    icon: <KeyboardDoubleArrowDownIcon />,
    path: "/dashboard/subcategories",
    disabled: false,
  },
  {
    text: "Products",
    icon: <RealEstateAgentIcon />,
    path: "/dashboard/products",
    disabled: false,
  },
  {
    text: "Prices",
    icon: <PriceChangeIcon />,
    path: "/dashboard/prices",
    disabled: false,
  },
  {
    text: "Customer",
    icon: <PersonIcon />,
    path: "/dashboard/customers",
    disabled: true,
  },
  {
    text: "Comment",
    icon: <CommentIcon />,
    path: "/dashboard/comments",
    disabled: true,
  },
  {
    text: "Banking",
    icon: <AccountBalanceIcon />,
    path: "/dashboard/banking",
    disabled: true,
  },
  {
    text: "Personnel",
    icon: <PeopleRoundedIcon />,
    path: "/dashboard/personnel",
    disabled: true,
  },
];

const secondaryListItems = [
  {
    text: "Settings",
    icon: <SettingsRoundedIcon />,
    path: "/dashboard/settings",
    disabled: false,
  },
  {
    text: "About",
    icon: <InfoRoundedIcon />,
    path: "/dashboard/about",
    disabled: false,
  },
  {
    text: "Feedback",
    icon: <HelpRoundedIcon />,
    path: "/dashboard/feedback",
    disabled: false,
  },
];

export default function MenuContent() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              // --- KEY CHANGES ARE HERE ---
              // If disabled, render as a normal button. Otherwise, render as NavLink.
              component={item.disabled ? undefined : NavLink}
              to={item.disabled ? undefined : item.path}
              disabled={item.disabled}
              // The 'end' prop for the Home link still works
              {...(item.text === "Home" && { end: true })}
              sx={{
                // Style for the active state
                "&.active": {
                  backgroundColor: "action.selected",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": {
                    color: "primary.main",
                  },
                },
                // --- NEW: Style for the disabled state ---
                "&.Mui-disabled": {
                  color: "text.disabled",
                  "& .MuiListItemIcon-root": {
                    color: "text.disabled",
                  },
                  // Prevent any background change on hover for disabled items
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
        ))}
      </List>

      <List dense>
        {secondaryListItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              component={item.disabled ? undefined : NavLink}
              to={item.disabled ? undefined : item.path}
              disabled={item.disabled}
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
        ))}
      </List>
    </Stack>
  );
}
