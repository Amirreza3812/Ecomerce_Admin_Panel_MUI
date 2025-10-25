// src/Pages/Dashboard/components/MainGrid.tsx
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import TopProductsChart from "./TopProductsChart.tsx";
import OrderStatusChart from "./OrderStatusChart.tsx";
import CustomizedTreeView from "./CustomizedTreeView.tsx";
import CustomizedDataGrid from "./CustomizedDataGrid.tsx";
import HighlightedCard from "./HighlightedCard.tsx";
import SessionsChart from "./SessionsChart.tsx";
import StatCard from "./StatCard.tsx";
import type { StatCardProps } from "./StatCard.tsx";
import { getDashboardOverview, getRecentOrders, getSessionsData } from "../../../services/dashboardService";

export default function MainGrid() {
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: getDashboardOverview,
  });

  const {
    data: recentOrders = [],
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: () => getRecentOrders(5), // Reduced to 5 for dashboard
  });

  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    error: sessionsError,
  } = useQuery({
    queryKey: ["sessionsData"],
    queryFn: () => getSessionsData('week'),
  });

  if (isDashboardLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (dashboardError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        خطا در بارگذاری داده‌های داشبورد: {dashboardError.message}
      </Alert>
    );
  }

  // Transform the backend data to match the StatCardProps format
  const statCardsData: StatCardProps[] = [
    {
      title: "مشتریان جدید",
      value: dashboardData?.newCustomers.value.toString() || "0",
      interval: "۳۰ روز گذشته",
      trend: dashboardData?.newCustomers.change > 0 ? "up" : 
             dashboardData?.newCustomers.change < 0 ? "down" : "neutral",
      data: [], // We'll need to add this data from the backend
      change: dashboardData?.newCustomers.change,
    },
    {
      title: "مجموع سفارشات",
      value: dashboardData?.totalOrders.value.toString() || "0",
      interval: "۳۰ روز گذشته",
      trend: dashboardData?.totalOrders.change > 0 ? "up" : 
             dashboardData?.totalOrders.change < 0 ? "down" : "neutral",
      data: [], // We'll need to add this data from the backend
      change: dashboardData?.totalOrders.change,
    },
    {
      title: "درآمد کل",
      value: `$${dashboardData?.totalRevenue.value || 0}`,
      interval: "۳۰ روز گذشته",
      trend: dashboardData?.totalRevenue.change > 0 ? "up" : 
             dashboardData?.totalRevenue.change < 0 ? "down" : "neutral",
      data: [], // We'll need to add this data from the backend
      change: dashboardData?.totalRevenue.change,
    },
    {
      title: "محصولات فعال",
      value: dashboardData?.activeProducts.value.toString() || "0",
      interval: "همه زمان‌ها",
      trend: dashboardData?.activeProducts.change > 0 ? "up" : 
             dashboardData?.activeProducts.change < 0 ? "down" : "neutral",
      data: [], // We'll need to add this data from the backend
      change: dashboardData?.activeProducts.change,
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" }, direction:"rtl" }}>
      {/* cards */}
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        نمای کلی
      </Typography>
      <Grid
        container
        spacing={2}
        columns={12}
        sx={{ mb: (theme) => theme.spacing(2) }}
      >
        {statCardsData.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
        {/* <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <HighlightedCard />
        </Grid> */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SessionsChart data={sessionsData} isLoading={isSessionsLoading} error={sessionsError} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TopProductsChart />
        </Grid>
      </Grid>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        فعالیت‌های اخیر
      </Typography>
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <CustomizedDataGrid 
            recentOrders={recentOrders} 
            isLoading={isOrdersLoading}
            error={ordersError}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          {/* <Stack gap={2} direction={{ xs: "column", sm: "row", lg: "column" }}>
            <CustomizedTreeView />
          </Stack> */}
        </Grid>
      </Grid>
    </Box>
  );
}