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
} from "../../services/subcategoryService";
import type {
  SubCategory,
  CreateSubCategoryData,
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
    image: "",
    status: "active",
    sort_order: 0,
    category_id: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const createMutation = useMutation({
    mutationFn: createSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "Subcategory created successfully",
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
          "Failed to create subcategory",
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
        message: "Subcategory updated successfully",
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
          "Failed to update subcategory",
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
        message: "Subcategory deleted successfully",
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
          "Failed to delete subcategory",
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
        message: "Subcategory status updated successfully",
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
          "Failed to update subcategory status",
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
        image: subcategory.image || "",
        status: subcategory.status || "active",
        sort_order: subcategory.sort_order || 0,
        category_id: subcategory.category_id,
      });
      setImagePreview(subcategory.image || null);
    } else {
      setEditingSubCategory(null);
      setFormData({
        name: "",
        description: "",
        image: "",
        status: "active",
        sort_order: 0,
        category_id: categories.length > 0 ? categories[0].id : 0,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubCategory(null);
    setFormData({
      name: "",
      description: "",
      image: "",
      status: "active",
      sort_order: 0,
      category_id: categories.length > 0 ? categories[0].id : 0,
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSubCategory) {
      updateMutation.mutate({
        id: editingSubCategory.id,
        ...formData,
        imageFile,
      });
    } else {
      createMutation.mutate({ ...formData, imageFile });
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
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

  // Transform data for DataGrid
  const rows = filteredSubcategories.map((subcategory) => ({
    id: subcategory.id,
    name: subcategory.name,
    description: subcategory.description || "",
    status: subcategory.status,
    sort_order: subcategory.sort_order || 0,
    category: subcategory.category?.name || "Unknown",
    categoryId: subcategory.category_id,
    createdAt: new Date(subcategory.createdAt).toLocaleDateString(),
    image: subcategory.image || "",
  }));

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      flex: 1,
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "active" ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      field: "sort_order",
      headerName: "Sort Order",
      width: 100,
    },
    {
      field: "image",
      headerName: "Image",
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
      headerName: "Created",
      width: 120,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
            title="Edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color={params.row.status === "active" ? "warning" : "success"}
            onClick={() => handleToggleStatus(params.row.id)}
            title={params.row.status === "active" ? "Deactivate" : "Activate"}
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
            title="Delete"
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
        Error loading subcategories: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Subcategories Management
      </Typography>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search subcategories..."
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
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
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
                Add Subcategory
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
          {editingSubCategory ? "Edit Subcategory" : "Add New Subcategory"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: parseInt(e.target.value) || 0,
                      }))
                    }
                    label="Category"
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
                  label="Subcategory Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                    />
                  </Button>
                  {imagePreview && (
                    <Avatar
                      src={imagePreview}
                      alt="Subcategory preview"
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sort Order"
                  name="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as "active" | "inactive",
                      }))
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingSubCategory ? "Update" : "Create"}
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
