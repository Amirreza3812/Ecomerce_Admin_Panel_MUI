import { useState } from "react";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
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
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import OrderStatusChart from "../Dashboard/components/OrderStatusChart";
import PageViewsBarChart from "../Dashboard/components/PageViewsBarChart";
import {
  getOrders,
  updateOrderStatus,
  updateOrderPayment,
  type OrderStatus,
  type PaymentMethod,
} from "../../services/orderService";
import {
  STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "../../utils/orderLabels";

export default function Orders() {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<{
    start: Dayjs | null;
    end: Dayjs | null;
  }>({ start: null, end: null });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", page, pageSize, statusFilter, searchTerm],
    queryFn: () =>
      getOrders({
        page: page + 1,
        limit: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
      }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSnackbar({
        open: true,
        message: "وضعیت سفارش به‌روز شد",
        severity: "success",
      });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "خطا در به‌روزرسانی وضعیت",
        severity: "error",
      }),
  });

  const paymentMut = useMutation({
    mutationFn: ({
      id,
      payment_status,
      payment_method,
    }: {
      id: number;
      payment_status?: "paid" | "pending";
      payment_method?: PaymentMethod;
    }) =>
      updateOrderPayment(id, {
        payment_status,
        payment_method,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseStats"] });
      setSnackbar({
        open: true,
        message: "پرداخت ثبت شد (درآمد + باشگاه مشتریان)",
        severity: "success",
      });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "خطا در ثبت پرداخت",
        severity: "error",
      }),
  });

  const orders = data?.orders || [];

  const rows = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber || order.order_number || "—",
    customerName: order.customerName || order.customer_name || "—",
    totalAmount: Number(order.totalAmount ?? order.final_amount ?? 0),
    status: order.status,
    payment_status: order.payment_status || "pending",
    payment_method: order.payment_method || null,
    createdAt: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("fa-IR")
      : "—",
  }));

  const columns: GridColDef[] = [
    { field: "orderNumber", headerName: "شماره سفارش", width: 140 },
    { field: "customerName", headerName: "مشتری", width: 140 },
    {
      field: "totalAmount",
      headerName: "مبلغ",
      width: 110,
      valueFormatter: (v: number) =>
        v != null ? Number(v).toLocaleString("fa-IR") : "—",
    },
    {
      field: "status",
      headerName: "وضعیت",
      width: 130,
      renderCell: (p: GridRenderCellParams) => (
        <Chip
          label={STATUS_LABELS[p.value as string] || p.value}
          size="small"
          color={
            p.value === "completed"
              ? "success"
              : p.value === "cancelled"
              ? "error"
              : p.value === "preparing"
              ? "warning"
              : "info"
          }
        />
      ),
    },
    {
      field: "payment_status",
      headerName: "پرداخت",
      width: 120,
      renderCell: (p: GridRenderCellParams) => (
        <Chip
          label={PAYMENT_STATUS_LABELS[p.value as string] || p.value}
          size="small"
          color={p.value === "paid" ? "success" : "warning"}
        />
      ),
    },
    {
      field: "payment_method",
      headerName: "روش",
      width: 100,
      valueFormatter: (v: string) => (v ? PAYMENT_METHOD_LABELS[v] || v : "—"),
    },
    { field: "createdAt", headerName: "تاریخ", width: 110 },
    {
      field: "actions",
      headerName: "عملیات",
      width: 220,
      sortable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={p.row.status}
              onChange={(e) =>
                statusMut.mutate({
                  id: p.row.id,
                  status: e.target.value as OrderStatus,
                })
              }
            >
              {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((value) => (
                <MenuItem key={value} value={value}>
                  {STATUS_LABELS[value]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {p.row.payment_status !== "paid" && (
            <IconButton
              size="small"
              color="success"
              title="ثبت پرداخت"
              onClick={() =>
                paymentMut.mutate({
                  id: p.row.id,
                  payment_status: "paid",
                  payment_method:
                    (p.row.payment_method as PaymentMethod) || "cash",
                })
              }
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, maxWidth: "100%", overflowX: "hidden" }}>
        <Typography variant="h4" gutterBottom>
          مدیریت سفارش‌ها
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  placeholder="جستجوی سفارش یا مشتری..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
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
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="all">همه وضعیت‌ها</MenuItem>
                    {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(
                      (value) => (
                        <MenuItem key={value} value={value}>
                          {STATUS_LABELS[value]}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <DatePicker
                  label="از تاریخ"
                  value={dateRange.start}
                  onChange={(v) =>
                    setDateRange((prev) => ({ ...prev, start: v }))
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <DatePicker
                  label="تا تاریخ"
                  value={dateRange.end}
                  onChange={(v) =>
                    setDateRange((prev) => ({ ...prev, end: v }))
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button variant="contained" fullWidth>
                  اعمال فیلتر
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="لیست سفارش‌ها" />
            <Tab label="آمار" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Card>
            <CardContent sx={{ p: 0 }}>
              {error ? (
                <Alert severity="error" sx={{ m: 2 }}>
                  خطا در بارگذاری سفارش‌ها — آیا GET /admin/orders فعال است؟
                </Alert>
              ) : (
                <DataGrid
                  rows={rows}
                  columns={columns}
                  loading={isLoading}
                  rowCount={data?.pagination?.total ?? rows.length}
                  paginationMode={data?.pagination ? "server" : "client"}
                  paginationModel={{ page, pageSize }}
                  onPaginationModelChange={(m) => {
                    setPage(m.page);
                    setPageSize(m.pageSize);
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  disableRowSelectionOnClick
                  autoHeight
                />
              )}
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

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
