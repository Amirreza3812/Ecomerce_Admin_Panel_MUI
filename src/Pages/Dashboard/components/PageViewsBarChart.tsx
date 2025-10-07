// src/Pages/Dashboard/components/PageViewsBarChart.tsx
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress, Box, Alert } from "@mui/material";
import { getSalesChart } from "../../../services/dashboardService";

export default function PageViewsBarChart() {
  const theme = useTheme();

  const {
    data: salesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["salesChart"],
    queryFn: () => getSalesChart("month"),
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading sales data: {error.message}
      </Alert>
    );
  }

  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];

  // Get the chart data from the API response
  const chartData = salesData?.chartData || [];

  // Calculate totals for the header
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  // Use the revenueChange from the backend response
  const revenueChange = salesData?.revenueChange || 0;

  // Extract just the period labels for the x-axis
  const periods = chartData.map((item) => {
    // Format date to a shorter format like "Jan 1" or just "Jan"
    const date = new Date(item.period);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  return (
    <Card variant="outlined" sx={{ width: "100%" }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Sales Performance
        </Typography>
        <Stack sx={{ justifyContent: "space-between" }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: "center", sm: "flex-start" },
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p">
              ${totalRevenue.toFixed(0)}
            </Typography>
            <Chip
              size="small"
              color={revenueChange > 0 ? "success" : "error"}
              label={`${revenueChange > 0 ? "+" : ""}${revenueChange}%`}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Orders and revenue for the last {chartData.length} days
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[
            {
              scaleType: "band",
              categoryGapRatio: 0.5,
              data: periods,
              height: 24,
            },
          ]}
          yAxis={[{ width: 50 }]}
          series={[
            {
              id: "orders",
              label: "Orders",
              data: chartData.map((item) => item.orders),
              stack: "A",
            },
            {
              id: "revenue",
              label: "Revenue ($)",
              data: chartData.map((item) => item.revenue),
              stack: "A",
            },
          ]}
          height={250}
          margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
          grid={{ horizontal: true }}
          hideLegend
        />
      </CardContent>
    </Card>
  );
}
