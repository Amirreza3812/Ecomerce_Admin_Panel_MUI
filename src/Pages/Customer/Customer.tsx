// src/Pages/Customer/Customer.tsx
import { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Sms as SmsIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  getCustomers,
  getCustomerProfile,
  getCustomerAnalytics,
  updateCustomerStatus,
  deleteCustomer,
  sendCustomerSms,
  type Customer,
  type CustomerProfile,
} from "../../services/customerService";
import { useModules } from "../../contexes/ModuleContext";

export default function Customer() {
  const { modules } = useModules();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState(0);

  const [smsOpen, setSmsOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
 
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Show phone / SMS only when module allows (use customers module for now;
  // later switch to modules.sms when super-admin controls it)
  const canSeePhone = modules?.customers !== false;
  const canSendSms = modules?.customers !== false; // change to modules?.sms later

  const {
    data: listData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customers", page, pageSize, statusFilter, searchTerm],
    queryFn: () =>
      getCustomers({
        page: page + 1,
        limit: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
      }),
  });

  const { data: analytics } = useQuery({
    queryKey: ["customerAnalytics"],
    queryFn: getCustomerAnalytics,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["customerProfile", selectedId],
    queryFn: () => getCustomerProfile(selectedId!),
    enabled: !!selectedId && detailOpen,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "active" | "inactive" | "banned";
    }) => updateCustomerStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSnackbar({
        open: true,
        message: "وضعیت به‌روزرسانی شد",
        severity: "success",
      });
    },
    onError: (err: any) => {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "خطا در تغییر وضعیت",
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSnackbar({ open: true, message: "مشتری حذف شد", severity: "success" });
    },
    onError: (err: any) => {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "خطا در حذف",
        severity: "error",
      });
    },
  });

 // Customer.tsx
const smsMutation = useMutation({
  mutationFn: (message: string) => sendBulkCustomerSms(message),
  onSuccess: (data) => {
    setSmsOpen(false);
    setSmsMessage("");
    setSnackbar({
      open: true,
      message: data.message || `پیام به ${data.sent ?? 0} مشتری ارسال شد`,
      severity: "success",
    });
  },
  onError: (err: any) => {
    setSnackbar({
      open: true,
      message: err.response?.data?.message || "خطا در ارسال پیامک گروهی",
      severity: "error",
    });
  },
});

  const openDetail = (id: number) => {
    setSelectedId(id);
    setDetailTab(0);
    setDetailOpen(true);
  };

  // const openSms = (customer: Customer) => {
  //   if (!customer.phone) {
  //     setSnackbar({
  //       open: true,
  //       message: "این مشتری شماره تلفن ندارد",
  //       severity: "error",
  //     });
  //     return;
  //   }
  //   setSmsMessage("");
  //   setSmsOpen(true);
  // };

  const rows = (listData?.users || []).map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || "—",
    status: c.status,
    totalOrders: c.statistics?.totalOrders ?? 0,
    totalSpent: c.statistics?.totalSpent ?? 0,
    createdAt: new Date(c.createdAt).toLocaleDateString("fa-IR"),
    raw: c,
  }));

  const columns: GridColDef[] = [
    { field: "name", headerName: "نام", width: 150 },
    { field: "email", headerName: "ایمیل", width: 200, flex: 1 },
    ...(canSeePhone
      ? [{ field: "phone", headerName: "تلفن", width: 130 } as GridColDef]
      : []),
    {
      field: "status",
      headerName: "وضعیت",
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={
            params.value === "active"
              ? "فعال"
              : params.value === "banned"
              ? "مسدود"
              : "غیرفعال"
          }
          color={
            params.value === "active"
              ? "success"
              : params.value === "banned"
              ? "error"
              : "default"
          }
          size="small"
        />
      ),
    },
    { field: "totalOrders", headerName: "سفارش‌ها", width: 90 },
    {
      field: "totalSpent",
      headerName: "مجموع خرید",
      width: 110,
      valueFormatter: (value: number) => `$${Number(value || 0).toFixed(0)}`,
    },
    { field: "createdAt", headerName: "عضویت", width: 110 },
    {
      field: "actions",
      headerName: "عملیات",
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => openDetail(params.row.id)}
            title="جزئیات"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {/* {canSendSms && (
            <IconButton
              size="small"
              color="secondary"
              onClick={() => openSms(params.row.raw)}
              title="ارسال پیامک"
            >
              <SmsIcon fontSize="small" />
            </IconButton>
          )} */}
          <IconButton
            size="small"
            color={params.row.status === "active" ? "warning" : "success"}
            onClick={() =>
              statusMutation.mutate({
                id: params.row.id,
                status: params.row.status === "active" ? "inactive" : "active",
              })
            }
            title="تغییر وضعیت"
          >
            {params.row.status === "active" ? (
              <BlockIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              if (window.confirm("آیا از حذف این مشتری مطمئن هستید؟")) {
                deleteMutation.mutate(params.row.id);
              }
            }}
            title="حذف"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        خطا در بارگذاری مشتریان
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        مدیریت مشتریان
      </Typography>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                مجموع مشتریان
              </Typography>
              <Typography variant="h4">
                {analytics?.overview?.totalCustomers ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                فعال
              </Typography>
              <Typography variant="h4">
                {analytics?.overview?.activeCustomers ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                جدید (۳۰ روز)
              </Typography>
              <Typography variant="h4">
                {analytics?.overview?.newCustomers ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                غیرفعال
              </Typography>
              <Typography variant="h4">
                {analytics?.overview?.inactiveCustomers ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="جستجو نام، ایمیل یا تلفن..."
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
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">همه وضعیت‌ها</MenuItem>
                  <MenuItem value="active">فعال</MenuItem>
                  <MenuItem value="inactive">غیرفعال</MenuItem>
                  <MenuItem value="banned">مسدود</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SmsIcon />}
                fullWidth
                onClick={() => {
                  setSmsMessage("");
                  setSmsOpen(true);
                }}
                disabled={!canSendSms}
              >
                ارسال پیامک به همه
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={listData?.pagination?.total ?? 0}
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => {
              setPage(m.page);
              setPageSize(m.pageSize);
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>جزئیات مشتری</DialogTitle>
        <DialogContent dividers>
          {profileLoading || !profile ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">{profile.customer.name}</Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                  <Chip
                    icon={<EmailIcon />}
                    label={profile.customer.email}
                    size="small"
                  />
                  {canSeePhone && profile.customer.phone && (
                    <Chip
                      icon={<PhoneIcon />}
                      label={profile.customer.phone}
                      size="small"
                    />
                  )}
                  <Chip
                    label={profile.customer.status}
                    color={
                      profile.customer.status === "active"
                        ? "success"
                        : "default"
                    }
                    size="small"
                  />
                </Box>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={3}>
                    <Typography variant="body2" color="text.secondary">
                      سفارش‌ها
                    </Typography>
                    <Typography variant="h6">
                      {profile.statistics.totalOrders}
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" color="text.secondary">
                      مجموع خرید
                    </Typography>
                    <Typography variant="h6">
                      ${profile.statistics.totalSpent}
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" color="text.secondary">
                      علاقه‌مندی‌ها
                    </Typography>
                    <Typography variant="h6">
                      {profile.statistics.totalFavorites}
                    </Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" color="text.secondary">
                      نظرات
                    </Typography>
                    <Typography variant="h6">
                      {profile.statistics.totalComments}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Tabs
                value={detailTab}
                onChange={(_, v) => setDetailTab(v)}
                sx={{ mb: 2 }}
              >
                <Tab label="علاقه‌مندی‌ها" />
                <Tab label="سفارش‌ها" />
                <Tab label="نظرات" />
              </Tabs>

              {detailTab === 0 && (
                <List dense>
                  {profile.favoriteProducts?.length ? (
                    profile.favoriteProducts.map((f) => (
                      <ListItem key={f.id}>
                        <ListItemAvatar>
                          <Avatar src={f.product?.image} variant="rounded">
                            <FavoriteIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={f.product?.name}
                          secondary={`$${f.product?.price} — ${new Date(
                            f.createdAt
                          ).toLocaleDateString("fa-IR")}`}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      علاقه‌مندی ثبت نشده
                    </Typography>
                  )}
                </List>
              )}

              {detailTab === 1 && (
                <List dense>
                  {profile.orderHistory?.length ? (
                    profile.orderHistory.map((o) => (
                      <ListItem key={o.id}>
                        <ListItemText
                          primary={`${o.orderNumber} — $${o.totalAmount}`}
                          secondary={`${o.status} / ${
                            o.paymentStatus
                          } — ${new Date(o.createdAt).toLocaleDateString(
                            "fa-IR"
                          )}`}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography color="text.secondary">سفارشی نیست</Typography>
                  )}
                </List>
              )}

              {detailTab === 2 && (
                <List dense>
                  {profile.recentComments?.length ? (
                    profile.recentComments.map((c: any) => (
                      <ListItem key={c.id} alignItems="flex-start">
                        <ListItemText
                          primary={c.product?.name || "محصول"}
                          secondary={c.comment || c.content || "—"}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography color="text.secondary">نظری نیست</Typography>
                  )}
                </List>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          {/* {canSendSms && profile?.customer?.phone && (
            <Button
              startIcon={<SmsIcon />}
              onClick={() => {
                setDetailOpen(false);
                openSms(profile.customer);
              }}
            >
              ارسال پیامک
            </Button>
          )} */}
          <Button onClick={() => setDetailOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>

      {/* SMS dialog */}
      <Dialog
        open={smsOpen}
        onClose={() => setSmsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ارسال پیامک به همه مشتریان</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            این پیام به همه مشتریان فعال که شماره تلفن دارند ارسال می‌شود.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="متن پیام"
            value={smsMessage}
            onChange={(e) => setSmsMessage(e.target.value)}
            inputProps={{ maxLength: 320 }}
            helperText={`${smsMessage.length}/320`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSmsOpen(false)}>انصراف</Button>
          <Button
            variant="contained"
            disabled={!smsMessage.trim() || smsMutation.isPending}
            onClick={() => smsMutation.mutate(smsMessage.trim())}
          >
            ارسال به همه
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
