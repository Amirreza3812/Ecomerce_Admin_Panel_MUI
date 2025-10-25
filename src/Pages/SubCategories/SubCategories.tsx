// src/Pages/SubCategories/SubCategories.tsx
import { useState, useRef } from "react";
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
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  toggleSubCategoryStatus,
  getIcons,
} from "../../services/subcategoryService";
import type {
  SubCategory,
  CreateSubCategoryData,
  IconOption,
} from "../../services/subcategoryService";
import { getCategories } from "../../services/categoryService";
import type { Category } from "../../services/categoryService";

export default function SubCategories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);
  const [formData, setFormData] = useState<CreateSubCategoryData>({
    name: "",
    description: "",
    icon: "",
    status: "active",
    sort_order: 0,
    category_id: 0,
  });
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const queryClient = useQueryClient();

  const {
    data: subcategories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subcategories"],
    queryFn: getSubCategories,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: icons = [] } = useQuery({
    queryKey: ["icons"],
    queryFn: getIcons,
  });

  const createMutation = useMutation({
    mutationFn: createSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "زیردسته‌بندی با موفقیت ایجاد شد",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Create subcategory error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "خطا در ایجاد زیردسته‌بندی",
        severity: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & CreateSubCategoryData) =>
      updateSubCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "زیردسته‌بندی با موفقیت به‌روزرسانی شد",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Update subcategory error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "خطا در به‌روزرسانی زیردسته‌بندی",
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      setSnackbar({
        open: true,
        message: "زیردسته‌بندی با موفقیت حذف شد",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Delete subcategory error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "خطا در حذف زیردسته‌بندی",
        severity: "error",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleSubCategoryStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      setSnackbar({
        open: true,
        message: "وضعیت زیردسته‌بندی با موفقیت به‌روزرسانی شد",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Toggle subcategory status error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "خطا در به‌روزرسانی وضعیت زیردسته‌بندی",
        severity: "error",
      });
    },
  });

  const handleOpenDialog = (subcategory?: SubCategory) => {
    if (subcategory) {
      setEditingSubCategory(subcategory);
      setFormData({
        name: subcategory.name,
        description: subcategory.description || "",
        icon: subcategory.icon || "",
        status: subcategory.status || "active",
        sort_order: subcategory.sort_order || 0,
        category_id: subcategory.category_id,
      });
      setIconPreview(subcategory.icon || null);
    } else {
      setEditingSubCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "",
        status: "active",
        sort_order: 0,
        category_id: categories.length > 0 ? categories[0].id : 0,
      });
      setIconPreview(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      status: "active",
      sort_order: 0,
      category_id: categories.length > 0 ? categories[0].id : 0,
    });
    setIconPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSubCategory) {
      updateMutation.mutate({
        id: editingSubCategory.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "sort_order" || name === "category_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleIconChange = (iconName: string, iconUrl: string) => {
    setFormData((prev) => ({ ...prev, icon: iconName }));
    setIconPreview(iconUrl);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("آیا از حذف این زیردسته‌بندی مطمئن هستید؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // Filter subcategories
  const filteredSubcategories = subcategories.filter((subcategory) => {
    const matchesSearch =
      subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subcategory.description &&
        subcategory.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (subcategory.category?.name &&
        subcategory.category.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || subcategory.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      subcategory.category_id === parseInt(categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

    // Helper function to find icon URL by name
  const getIconUrl = (iconName: string) => {
    const icon = icons.find((i) => i.name === iconName);
    return icon ? icon.url : null;
  };


  // Transform data for DataGrid
  const rows = filteredSubcategories.map((subcategory) => ({
    id: subcategory.id,
    name: subcategory.name,
    description: subcategory.description || "",
    status: subcategory.status,
    sort_order: subcategory.sort_order || 0,
    category: subcategory.category?.name || "ناشناس",
    categoryId: subcategory.category_id,
    createdAt: new Date(subcategory.createdAt).toLocaleDateString(),
    icon: getIconUrl(subcategory.icon || ""),
  }));

  const columns = [
    {
      field: "name",
      headerName: "نام",
      width: 200,
    },
    {
      field: "description",
      headerName: "توضیحات",
      width: 300,
      flex: 1,
    },
    {
      field: "category",
      headerName: "دسته‌بندی",
      width: 150,
    },
    {
      field: "status",
      headerName: "وضعیت",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === "active" ? "فعال" : "غیرفعال"}
          color={params.value === "active" ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      field: "sort_order",
      headerName: "ترتیب نمایش",
      width: 100,
    },
    {
      field: "icon",
      headerName: "آیکون",
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Avatar
            src={params.value}
            alt="Subcategory"
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          />
        ) : (
          <Avatar variant="rounded" sx={{ width: 40, height: 40 }}>
            <ImageIcon />
          </Avatar>
        ),
    },
    {
      field: "createdAt",
      headerName: "تاریخ ایجاد",
      width: 120,
    },
    {
      field: "actions",
      headerName: "عملیات",
      width: 180,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
            title="ویرایش"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color={params.row.status === "active" ? "warning" : "success"}
            onClick={() => handleToggleStatus(params.row.id)}
            title={params.row.status === "active" ? "غیرفعال کردن" : "فعال کردن"}
          >
            {params.row.status === "active" ? (
              <ToggleOffIcon />
            ) : (
              <ToggleOnIcon />
            )}
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            title="حذف"
          >
            <DeleteIcon />
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
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error("Subcategories query error:", error);
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        خطا در بارگذاری زیردسته‌بندی‌ها: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        مدیریت زیردسته‌بندی‌ها
      </Typography>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center" justifyContent="right">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="جستجوی زیردسته‌بندی‌ها..."
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>دسته‌بندی</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="دسته‌بندی"
                >
                  <MenuItem value="all">همه دسته‌بندی‌ها</MenuItem>
                  {categories.map((category: Category) => (
                    <MenuItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="وضعیت"
                >
                  <MenuItem value="all">همه وضعیت‌ها</MenuItem>
                  <MenuItem value="active">فعال</MenuItem>
                  <MenuItem value="inactive">غیرفعال</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                fullWidth
              >
                افزودن زیردسته‌بندی
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Subcategories Table */}
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
              sorting: {
                sortModel: [{ field: "sort_order", sort: "asc" }],
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingSubCategory ? "ویرایش زیردسته‌بندی" : "افزودن زیردسته‌بندی جدید"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>دسته‌بندی</InputLabel>
                  <Select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: parseInt(e.target.value) || 0,
                      }))
                    }
                    label="دسته‌بندی"
                  >
                    {categories.map((category: Category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="نام زیردسته‌بندی"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="توضیحات"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>

              {/* Icon Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  انتخاب آیکون
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {icons.map((icon) => (
                    <Box
                      key={icon.name}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        border: formData.icon === icon.name ? "2px solid" : "1px solid",
                        borderColor: formData.icon === icon.name ? "primary.main" : "grey.300",
                        borderRadius: 1,
                        p: 1,
                      }}
                      onClick={() => handleIconChange(icon.name, icon.url)}
                    >
                      <Avatar
                        src={icon.url}
                        alt={icon.name}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      />
                      <Typography variant="caption">{icon.name}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ترتیب نمایش"
                  name="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>وضعیت</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as "active" | "inactive",
                      }))
                    }
                  >
                    <MenuItem value="active">فعال</MenuItem>
                    <MenuItem value="inactive">غیرفعال</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>انصراف</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingSubCategory ? "به‌روزرسانی" : "ایجاد"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}