import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
// import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// import SelectContent from "./SelectContent.tsx";
import MenuContent from "./MenuContent.tsx";
import CardAlert from "./CardAlert.tsx";
import OptionsMenu from "./OptionsMenu.tsx";
import { useAuth } from "../../../contexes/AuthContext.tsx";
import { useQuery } from "@tanstack/react-query";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  const { token } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminMe"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/v1/admin/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch admin info");
      const json = await res.json();
      return json.data as {
        name: string;
        email: string;
        avatar: string | null;
      };
    },
    enabled: !!token,
  });

  const adminName = isLoading
    ? "در حال بارگذاری..."
    : isError
    ? "خطا در دریافت نام"
    : data?.name || "ادمین";

  const adminEmail = isLoading ? "" : isError ? "" : data?.email || "";

  const adminAvatar =
    isLoading || isError
      ? "/static/images/avatar/7.jpg" // آواتار پیش‌فرض
      : data?.avatar || "/static/images/avatar/7.jpg";

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      {/* <Box
        sx={{
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <SelectContent />
      </Box> */}
      {/* <Divider /> */}
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent />
        <CardAlert />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sizes="small"
          alt={adminName}
          src={adminAvatar}
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: "auto" }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, lineHeight: "16px" }}
          >
            {adminName}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {adminEmail}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
