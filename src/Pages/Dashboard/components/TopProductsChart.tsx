// src/Pages/Dashboard/components/TopProductsChart.tsx
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { getTopProducts } from "../../../services/dashboardService";

export default function TopProductsChart() {
  const {
    data: topProducts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["topProducts"],
    queryFn: () => getTopProducts("month", 5),
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
        Error loading top products: {error.message}
      </Alert>
    );
  }

  const chartData = topProducts.map((item, index) => ({
    id: index,
    name:
      item.product.name.length > 12
        ? item.product.name.substring(0, 12) + "..."
        : item.product.name,
    fullName: item.product.name,
    sales: item.totalQuantity,
    revenue: item.totalRevenue,
    image: item.product.image,
  }));

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 450,
      }}
    >
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}
      >
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Top Products
        </Typography>

        {/* Chart Container */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 250,
            mb: 2,
          }}
        >
          <BarChart
            dataset={chartData}
            xAxis={[
              {
                dataKey: "name",
                scaleType: "band",
                tickLabelStyle: {
                  fontSize: 11,
                  angle: -45,
                  textAnchor: "end",
                },
                tickSize: 5,
              },
            ]}
            yAxis={[
              {
                tickLabelStyle: {
                  fontSize: 11,
                },
              },
            ]}
            series={[
              {
                dataKey: "sales",
                label: "Units Sold",
                color: "#8884d8",
                valueFormatter: (value: number) => value.toString(),
              },
            ]}
            height={250}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            slotProps={{
              legend: {
                hidden: true,
              },
            }}
            sx={{
              "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
                fontSize: 11,
              },
              "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
                fontSize: 11,
              },
            }}
          />
        </Box>

        {/* Product Details List */}
        <Box sx={{ mt: "auto" }}>
          {/* <Typography variant="body2" sx={{ fontWeight: "medium", mb: 1 }}>
            Top Sellers
          </Typography> */}
          {topProducts.slice(0, 3).map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 0.75,
                borderBottom: index < 2 ? 1 : 0,
                borderColor: "divider",
              }}
            >
              <Chip
                label={`#${index + 1}`}
                size="small"
                color="primary"
                sx={{
                  fontWeight: "bold",
                  minWidth: 36,
                  height: 24,
                }}
              />
              <Avatar
                src={item.product.image}
                alt={item.product.name}
                sx={{ width: 32, height: 32 }}
              >
                {item.product.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "medium",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.totalQuantity} sold • ${item.totalRevenue.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
