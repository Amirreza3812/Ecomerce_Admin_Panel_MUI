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
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
  getWorkerStats,
  type Worker,
  type CreateWorkerData,
} from "../../services/workerService";

const emptyForm: CreateWorkerData = {
  name: "",
  phone: "",
  email: "",
  job_title: "",
  hire_date: "",
  base_salary: 0,
  status: "active",
  notes: "",
};

export default function Personnel() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [form, setForm] = useState<CreateWorkerData>(emptyForm);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["workers", page, pageSize, statusFilter, searchTerm],
    queryFn: () =>
      getWorkers({
        page: page + 1,
        limit: pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ["workerStats"],
    queryFn: getWorkerStats,
  });

  const createMut = useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["workerStats"] });
      handleClose();
      setSnackbar({
        open: true,
        message: "کارمند اضافه شد",
        severity: "success",
      });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "خطا در ایجاد",
        severity: "error",
      }),
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateWorkerData>;
    }) => updateWorker(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["workerStats"] });
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
        message: err.response?.data?.message || "خطا در به‌روزرسانی",
        severity: "error",
      }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      queryClient.invalidateQueries({ queryKey: ["workerStats"] });
      setSnackbar({
        open: true,
        message: "کارمند غیرفعال شد",
        severity: "success",
      });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "خطا در حذف",
        severity: "error",
      }),
  });

  const handleOpen = (worker?: Worker) => {
    if (worker) {
      setEditing(worker);
      setForm({
        name: worker.name,
        phone: worker.phone || "",
        email: worker.email || "",
        job_title: worker.job_title || "",
        hire_date: worker.hire_date || "",
        base_salary: Number(worker.base_salary) || 0,
        status: worker.status,
        notes: worker.notes || "",
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editing) {
      updateMut.mutate({ id: editing.id, data: form });
    } else {
      createMut.mutate(form);
    }
  };

  const rows = (data?.workers || []).map((w) => ({
    id: w.id,
    name: w.name,
    phone: w.phone || "—",
    job_title: w.job_title || "—",
    base_salary: Number(w.base_salary) || 0,
    status: w.status,
    hire_date: w.hire_date
      ? new Date(w.hire_date).toLocaleDateString("fa-IR")
      : "—",
    raw: w,
  }));

  const columns: GridColDef[] = [
    { field: "name", headerName: "نام", width: 160 },
    { field: "phone", headerName: "تلفن", width: 130 },
    { field: "job_title", headerName: "سمت", width: 120 },
    {
      field: "base_salary",
      headerName: "حقوق پایه",
      width: 120,
      valueFormatter: (v: number) => (v ? v.toLocaleString("fa-IR") : "—"),
    },
    {
      field: "status",
      headerName: "وضعیت",
      width: 100,
      renderCell: (p: GridRenderCellParams) => (
        <Chip
          label={p.value === "active" ? "فعال" : "غیرفعال"}
          color={p.value === "active" ? "success" : "default"}
          size="small"
        />
      ),
    },
    { field: "hire_date", headerName: "تاریخ استخدام", width: 120 },
    {
      field: "notes",
      headerName: "یادداشت",
      flex: 1,
      minWidth: 160,
      valueGetter: (_value, row) => row.raw?.notes || "—",
    },
    {
      field: "actions",
      headerName: "عملیات",
      width: 120,
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
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              if (window.confirm("غیرفعال کردن این کارمند؟")) {
                deleteMut.mutate(p.row.id);
              }
            }}
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
        خطا در بارگذاری کارمندان
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        مدیریت کارمندان
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                مجموع
              </Typography>
              <Typography variant="h4">{stats?.total ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                فعال
              </Typography>
              <Typography variant="h4">{stats?.active ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                غیرفعال
              </Typography>
              <Typography variant="h4">{stats?.inactive ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                placeholder="جستجو نام، تلفن، سمت..."
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
                  <MenuItem value="all">همه</MenuItem>
                  <MenuItem value="active">فعال</MenuItem>
                  <MenuItem value="inactive">غیرفعال</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
              >
                افزودن کارمند
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editing ? "ویرایش کارمند" : "افزودن کارمند"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  required
                  label="نام"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="تلفن"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="ایمیل"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="سمت"
                  value={form.job_title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, job_title: e.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="حقوق پایه"
                  type="number"
                  value={form.base_salary}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      base_salary: Number(e.target.value) || 0,
                    }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="تاریخ استخدام"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.hire_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hire_date: e.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>وضعیت</InputLabel>
                  <Select
                    label="وضعیت"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as "active" | "inactive",
                      }))
                    }
                  >
                    <MenuItem value="active">فعال</MenuItem>
                    <MenuItem value="inactive">غیرفعال</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="یادداشت"
                  multiline
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
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
              {editing ? "ذخیره" : "ایجاد"}
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
