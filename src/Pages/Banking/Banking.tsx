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
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  markExpensePaid,
  type Expense,
  type CreateExpenseData,
} from "../../services/expenseService";
import { getWorkers } from "../../services/workerService";

const CATEGORIES = [
  { value: "milk", label: "شیر / لبنیات" },
  { value: "supplies", label: "ملزومات" },
  { value: "utilities", label: "قبوض" },
  { value: "rent", label: "اجاره" },
  { value: "salary_advance", label: "مساعده حقوق" },
  { value: "other", label: "سایر" },
];

const METHODS = [
  { value: "cash", label: "نقد" },
  { value: "card", label: "کارت" },
  { value: "bank", label: "بانک" },
  { value: "worker_paid", label: "پرداخت توسط کارمند" },
  { value: "online", label: "آنلاین" },
];

const emptyForm: CreateExpenseData = {
  worker_id: null,
  amount: 0,
  category: "other",
  description: "",
  expense_date: new Date().toISOString().slice(0, 10),
  payment_method: "cash",
  payment_status: "paid",
};

export default function Banking() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<CreateExpenseData>(emptyForm);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "expenses",
      page,
      pageSize,
      categoryFilter,
      paymentStatusFilter,
      typeFilter,
      fromDate,
      toDate,
      searchTerm,
    ],
    queryFn: () =>
      getExpenses({
        page: page + 1,
        limit: pageSize,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        payment_status:
          paymentStatusFilter === "all" ? undefined : paymentStatusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
        from: fromDate || undefined,
        to: toDate || undefined,
        search: searchTerm || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ["expenseStats", fromDate, toDate],
    queryFn: () =>
      getExpenseStats({
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
  });

  const { data: workersData } = useQuery({
    queryKey: ["workers", "active"],
    queryFn: () => getWorkers({ status: "active", limit: 100 }),
  });

  const createMut = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseStats"] });
      handleClose();
      setSnackbar({ open: true, message: "هزینه ثبت شد", severity: "success" });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "خطا در ثبت",
        severity: "error",
      }),
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateExpenseData>;
    }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseStats"] });
      handleClose();
      setSnackbar({
        open: true,
        message: "به‌روزرسانی شد",
        severity: "success",
      });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "خطا",
        severity: "error",
      }),
  });

  const markPaidMut = useMutation({
    mutationFn: markExpensePaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseStats"] });
      setSnackbar({
        open: true,
        message: "علامت پرداخت شد",
        severity: "success",
      });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "خطا",
        severity: "error",
      }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseStats"] });
      setSnackbar({ open: true, message: "حذف شد", severity: "success" });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "خطا در حذف",
        severity: "error",
      }),
  });

  const handleOpen = (expense?: Expense) => {
    if (expense) {
      setEditing(expense);
      setForm({
        worker_id: expense.worker_id ?? null,
        amount: Number(expense.amount),
        category: expense.category,
        description: expense.description || "",
        expense_date: expense.expense_date,
        payment_method: expense.payment_method,
        payment_status: expense.payment_status || "paid",
      });
      setReceiptFile(null);
      setReceiptPreview(expense.receipt_url || null);
    } else {
      setEditing(null);
      setForm({
        ...emptyForm,
        expense_date: new Date().toISOString().slice(0, 10),
      });
      setReceiptFile(null);
      setReceiptPreview(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) return;
    const payload: CreateExpenseData = {
      ...form,
      worker_id: form.worker_id || null,
      receipt: receiptFile || undefined,
    };
    if (editing) {
      updateMut.mutate({ id: editing.id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const categoryLabel = (v: string) =>
    CATEGORIES.find((c) => c.value === v)?.label || v;
  const methodLabel = (v: string) =>
    METHODS.find((m) => m.value === v)?.label || v;

  const rows = (data?.expenses || []).map((e) => ({
    id: e.id,
    type: e.type || "expense",
    date: e.expense_date
      ? new Date(e.expense_date).toLocaleDateString("fa-IR")
      : "—",
    worker: e.worker?.name || "— (عمومی)",
    category: categoryLabel(e.category),
    amount: Number(e.amount),
    method: methodLabel(e.payment_method),
    payment_status: e.payment_status || "paid",
    description: e.description || "—",
    receipt_url: e.receipt_url || null,
    raw: e,
  }));

  const columns: GridColDef[] = [
    { field: "date", headerName: "تاریخ", width: 100 },
    { field: "worker", headerName: "کارمند", width: 120 },
    { field: "category", headerName: "دسته", width: 100 },
    {
      field: "amount",
      headerName: "مبلغ",
      width: 110,
      valueFormatter: (v: number) => (v ? v.toLocaleString("fa-IR") : "0"),
    },
    { field: "method", headerName: "پرداخت", width: 110 },
    {
      field: "payment_status",
      headerName: "وضعیت",
      width: 110,
      renderCell: (p: GridRenderCellParams) => (
        <Chip
          label={p.value === "paid" ? "پرداخت شده" : "پرداخت نشده"}
          color={p.value === "paid" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    { field: "description", headerName: "توضیح", flex: 1, minWidth: 100 },
    {
      field: "receipt_url",
      headerName: "رسید",
      width: 70,
      sortable: false,
      renderCell: (p: GridRenderCellParams) =>
        p.value ? (
          <IconButton
            size="small"
            component="a"
            href={p.value}
            target="_blank"
            rel="noopener noreferrer"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        ) : (
          "—"
        ),
    },
    {
      field: "actions",
      headerName: "عملیات",
      width: 130,
      sortable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleOpen(p.row.raw)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {p.row.payment_status === "unpaid" && (
            <IconButton
              size="small"
              color="success"
              title="علامت پرداخت شده"
              onClick={() => markPaidMut.mutate(p.row.id)}
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              if (window.confirm("حذف این رکورد؟")) deleteMut.mutate(p.row.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "type",
      headerName: "نوع",
      width: 100,
      renderCell: (p: GridRenderCellParams) => (
        <Chip
          size="small"
          label={p.value === "income" ? "درآمد" : "هزینه"}
          color={p.value === "income" ? "success" : "default"}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          height: 400,
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        خطا در بارگذاری هزینه‌ها
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "hidden", // stop page-level horizontal scroll
      }}
    >
      <Typography variant="h4" gutterBottom>
        حسابداری / ثبت هزینه‌ها
      </Typography>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                مجموع
              </Typography>
              <Typography variant="h5">
                {(stats?.totalAmount ?? 0).toLocaleString("fa-IR")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                پرداخت شده
              </Typography>
              <Typography variant="h5" color="success.main">
                {(stats?.paidTotal ?? 0).toLocaleString("fa-IR")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                پرداخت نشده
              </Typography>
              <Typography variant="h5" color="warning.main">
                {(stats?.unpaidTotal ?? 0).toLocaleString("fa-IR")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <FormControl fullWidth>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as "all" | "income" | "expense");
                setPage(0);
              }}
            >
              <MenuItem value="all">همه تراکنش‌ها</MenuItem>
              <MenuItem value="income">درآمد (فروش)</MenuItem>
              <MenuItem value="expense">هزینه</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                تعداد بدهی
              </Typography>
              <Typography variant="h5">{stats?.unpaidCount ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                placeholder="جستجو در توضیحات..."
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
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="از تاریخ"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="تا تاریخ"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth>
                <Select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">همه دسته‌ها</MenuItem>
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl fullWidth>
                <Select
                  value={paymentStatusFilter}
                  onChange={(e) => {
                    setPaymentStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="all">همه وضعیت‌ها</MenuItem>
                  <MenuItem value="paid">پرداخت شده</MenuItem>
                  <MenuItem value="unpaid">پرداخت نشده</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                sx={{ minWidth: 0, px: 1 }}
              >
                جدید
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
            rowCount={data?.pagination?.total ?? 0}
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

      {/* Create / Edit dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editing ? "ویرایش هزینه" : "ثبت هزینه"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <FormControl fullWidth>
                  <InputLabel>کارمند (اختیاری)</InputLabel>
                  <Select
                    label="کارمند (اختیاری)"
                    value={
                      form.worker_id === null || form.worker_id === undefined
                        ? ""
                        : String(form.worker_id)
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((f) => ({
                        ...f,
                        worker_id: v === "" ? null : Number(v),
                      }));
                    }}
                  >
                    <MenuItem value="">— بدون کارمند (هزینه عمومی) —</MenuItem>
                    {(workersData?.workers || []).map((w) => (
                      <MenuItem key={w.id} value={String(w.id)}>
                        {w.name}
                        {w.job_title ? ` (${w.job_title})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="مبلغ"
                  type="number"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      amount: Number(e.target.value) || 0,
                    }))
                  }
                  inputProps={{ min: 0, step: 1000 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="تاریخ"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.expense_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expense_date: e.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>دسته</InputLabel>
                  <Select
                    label="دسته"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>روش پرداخت</InputLabel>
                  <Select
                    label="روش پرداخت"
                    value={form.payment_method}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        payment_method: e.target
                          .value as CreateExpenseData["payment_method"],
                      }))
                    }
                  >
                    {METHODS.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>وضعیت پرداخت</InputLabel>
                  <Select
                    label="وضعیت پرداخت"
                    value={form.payment_status || "paid"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        payment_status: e.target.value as "paid" | "unpaid",
                      }))
                    }
                  >
                    <MenuItem value="paid">پرداخت شده</MenuItem>
                    <MenuItem value="unpaid">پرداخت نشده</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="توضیحات"
                  multiline
                  rows={2}
                  placeholder="مثلاً: خرید شیر توسط علی برای کافی‌شاپ"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </Grid>
              <Grid size={12}>
                <Button variant="outlined" component="label" fullWidth>
                  {receiptFile ? receiptFile.name : "آپلود تصویر رسید پرداخت"}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setReceiptFile(file);
                      if (file) {
                        setReceiptPreview(URL.createObjectURL(file));
                      } else if (editing?.receipt_url) {
                        setReceiptPreview(editing.receipt_url);
                      } else {
                        setReceiptPreview(null);
                      }
                    }}
                  />
                </Button>
                {receiptPreview && (
                  <Box
                    component="img"
                    src={receiptPreview}
                    alt="receipt"
                    sx={{
                      mt: 1,
                      maxHeight: 160,
                      maxWidth: "100%",
                      borderRadius: 1,
                      display: "block",
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>انصراف</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {editing ? "ذخیره" : "ثبت"}
            </Button>
          </DialogActions>
        </form>
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
