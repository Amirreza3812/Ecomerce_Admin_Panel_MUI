// src/Pages/Orders/Orders.tsx
import { useState } from "react";
import type { GridRenderCellParams } from "@mui/x-data-grid";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Chip,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import OrderStatusChart from "../Dashboard/components/OrderStatusChart";
import PageViewsBarChart from "../Dashboard/components/PageViewsBarChart";
import {
  getRecentOrders,
  getOrderStatusDistribution,
  getSalesChart,
} from "../../services/dashboardService";
import type { Dayjs } from "dayjs";

export default function Orders() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{
    start: Dayjs | null;
    end: Dayjs | null;
  }>({ start: null, end: null });

  const {
    data: recentOrders = [],
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: () => getRecentOrders(50),
  });

  const { data: statusData = {}, isLoading: isStatusLoading } = useQuery({
    queryKey: ["orderStatusDistribution"],
    queryFn: () => getOrderStatusDistribution("month"),
  });

  const { data: salesData, isLoading: isSalesLoading } = useQuery({
    queryKey: ["salesChart"],
    queryFn: () => getSalesChart("month"),
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter orders based on search and status
  const filteredOrders = recentOrders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Transform data for DataGrid
  const rows = filteredOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: new Date(order.createdAt).toLocaleDateString(),
  }));

  const columns = [
    { field: "orderNumber", headerName: "Order #", width: 130 },
    { field: "customerName", headerName: "Customer", width: 150 },
    {
      field: "totalAmount",
      headerName: "Total",
      width: 100,
      valueFormatter: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={
            params.value === "completed"
              ? "success"
              : params.value === "cancelled"
              ? "error"
              : params.value === "preparing"
              ? "warning"
              : "info"
          }
          size="small"
        />
      ),
    },
    { field: "createdAt", headerName: "Date", width: 120 },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Orders Management
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="preparing">Preparing</MenuItem>
                    <MenuItem value="ready">Ready</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.start}
                  onChange={(newValue) =>
                    setDateRange((prev) => ({ ...prev, start: newValue }))
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <DatePicker
                  label="End Date"
                  value={dateRange.end}
                  onChange={(newValue) =>
                    setDateRange((prev) => ({ ...prev, end: newValue }))
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button variant="contained" fullWidth>
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Orders List" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                autoHeight
              />
            </CardContent>
          </Card>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <OrderStatusChart />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PageViewsBarChart />
            </Grid>
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  );
}
