// src/Pages/Products/Products.tsx
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
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductStats,
} from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import type { Product, CreateProductData } from "../../services/productService";
import type { Category } from "../../services/categoryService";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    description: "",
    price: 0,
    category_id: 0,
    subcategory_id: 0,
    image: "",
    status: "active",
    stock: 0,
    ingredients: "",
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
    data: productsData,
    isLoading,
    error,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // Ensure products is always an array
  const products = Array.isArray(productsData) ? productsData : [];

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["productStats"],
    queryFn: getProductStats,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      console.log("Product created successfully:", data);
      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refetchProducts(); // Explicitly refetch to ensure we get the latest data
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "Product created successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Create product error:", error);

      // Try to get more detailed error information
      let errorMessage = "Failed to create product";

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.errors) {
          errorMessage = error.response.data.errors
            .map((e: any) => e.msg)
            .join(", ");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      updateProduct(id, data),
    onSuccess: (data) => {
      console.log("Product updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refetchProducts(); // Explicitly refetch to ensure we get the latest data
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "Product updated successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Update product error:", error);

      // Try to get more detailed error information
      let errorMessage = "Failed to update product";

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.errors) {
          errorMessage = error.response.data.errors
            .map((e: any) => e.msg)
            .join(", ");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refetchProducts(); // Explicitly refetch to ensure we get the latest data
      setSnackbar({
        open: true,
        message: "Product deleted successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Delete product error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete product",
        severity: "error",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleProductStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refetchProducts(); // Explicitly refetch to ensure we get the latest data
      setSnackbar({
        open: true,
        message: "Product status updated successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Toggle product status error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update product status",
        severity: "error",
      });
    },
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id,
        image: product.image,
        status: product.status,
        stock: product.stock,
        ingredients: product.ingredients || "",
      });
      setImagePreview(product.image || null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category_id: 0,
        subcategory_id: 0,
        image: "",
        status: "active",
        stock: 0,
        ingredients: "",
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      category_id: 0,
      subcategory_id: 0,
      image: "",
      status: "active",
      stock: 0,
      ingredients: "",
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData for file upload
    const data = new FormData();

    // Add form fields
    data.append("name", formData.name);
    if (formData.description) data.append("description", formData.description);
    data.append("price", formData.price.toString());
    data.append("category_id", formData.category_id.toString());
    data.append("subcategory_id", formData.subcategory_id.toString());
    data.append("status", formData.status);
    data.append("stock", formData.stock.toString());
    if (formData.ingredients) data.append("ingredients", formData.ingredients);

    // Add product image file if selected
    if (imageFile) {
      data.append("image", imageFile);
    }

    if (editingProduct) {
      // Pass FormData directly to the mutation
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      // Pass FormData directly to the mutation
      createMutation.mutate(data);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (
      name === "price" ||
      name === "stock" ||
      name === "category_id" ||
      name === "subcategory_id"
    ) {
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
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // Get subcategories for selected category
  const selectedCategory = categories.find(
    (cat) => cat.id === formData.category_id
  );
  const subcategories = selectedCategory?.subcategories || [];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      product.category_id.toString() === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Transform data for DataGrid
  const rows = filteredProducts.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    category_name: product.category_name || "",
    subcategory_name: product.subcategory_name || "",
    status: product.status,
    stock: product.stock,
    ingredients: product.ingredients || "",
    image: product.image || "",
  }));

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "price",
      headerName: "Price",
      width: 80,
      renderCell: (params) => `$${params.value}`,
    },
    {
      field: "category_name",
      headerName: "Category",
      width: 120,
    },
    {
      field: "subcategory_name",
      headerName: "Subcategory",
      width: 120,
    },
    {
      field: "status",
      headerName: "Status",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "active" ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      field: "stock",
      headerName: "Stock",
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value > 0 ? "primary" : "error"}
          size="small"
        />
      ),
    },
    {
      field: "image",
      headerName: "Image",
      width: 80,
      renderCell: (params) =>
        params.value ? (
          <Avatar
            src={params.value}
            alt="Product"
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
            color="error"
            onClick={() => handleDelete(params.row.id)}
            title="Delete"
          >
            <DeleteIcon />
          </IconButton>
          <FormControlLabel
            control={
              <Switch
                checked={params.row.status === "active"}
                onChange={() => handleToggleStatus(params.row.id)}
                color="primary"
              />
            }
            label=""
          />
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
    console.error("Products query error:", error);
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading products: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "calc(100vw - 280px)" }}>
      <Typography variant="h4" gutterBottom>
        Products Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Total Products
              </Typography>
              <Typography variant="h4">{stats?.totalProducts || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Active Products
              </Typography>
              <Typography variant="h4">{stats?.activeProducts || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Out of Stock
              </Typography>
              <Typography variant="h4">
                {stats?.outOfStockProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Total Stock Value
              </Typography>
              <Typography variant="h4">
                ${stats?.totalStockValue || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products..."
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                fullWidth
              >
                Add Product
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ width: "100%", overflowX: "auto" }}>
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
              sx={{
                "& .MuiDataGrid-root": {
                  border: "none",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: parseInt(e.target.value) || 0,
                        subcategory_id: 0, // Reset subcategory when category changes
                      }))
                    }
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Subcategory</InputLabel>
                  <Select
                    value={formData.subcategory_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subcategory_id: parseInt(e.target.value) || 0,
                      }))
                    }
                    disabled={
                      !formData.category_id || subcategories.length === 0
                    }
                  >
                    {subcategories.map((subcategory) => (
                      <MenuItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                      alt="Product preview"
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    />
                  )}
                </Box>
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
              {editingProduct ? "Update" : "Create"}
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
