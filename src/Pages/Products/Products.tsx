// src/Pages/Products/Products.tsx
import { useState, useRef, useEffect } from "react";
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
  useTheme,
  useMediaQuery,
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
import { getSubCategories } from "../../services/subcategoryService";
import type {
  Product,
  CreateProductData,
} from "../../services/productService";
import type { Category } from "../../services/categoryService";
import type { SubCategory } from "../../services/subcategoryService";

export default function Products() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Ensure categories is always an array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  
  // Debug: Log categories data
  console.log('Categories data:', categories);

  // Fetch subcategories separately
  const { data: subcategoriesData } = useQuery({
    queryKey: ["subcategories"],
    queryFn: getSubCategories,
  });

  // Ensure subcategories is always an array
  const subcategories = Array.isArray(subcategoriesData) ? subcategoriesData : [];

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["productStats"],
    queryFn: getProductStats,
  });

  // Create a helper function to get category name by ID
  const getCategoryName = (categoryId: number): string => {
    console.log(`Looking for category with ID: ${categoryId}`);
    console.log('Available categories:', categories);
    const category = categories.find(cat => cat.id === categoryId);
    const categoryName = category ? category.name : "ناشناس";
    console.log(`Found category name: ${categoryName}`);
    return categoryName;
  };

  // Create a helper function to get subcategory name by ID
  const getSubcategoryName = (subcategoryId: number): string => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : "ناشناس";
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      console.log("Product created successfully:", data);
      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Wait a moment before refetching to ensure the server has processed the data
      setTimeout(() => {
        refetchProducts();
      }, 500);
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "محصول با موفقیت ایجاد شد",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Create product error:", error);

      // Try to get more detailed error information
      let errorMessage = "خطا در ایجاد محصول";

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
      setTimeout(() => {
        refetchProducts();
      }, 500);
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "محصول با موفقیت به‌روزرسانی شد",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Update product error:", error);

      // Try to get more detailed error information
      let errorMessage = "خطا در به‌روزرسانی محصول";

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
      setTimeout(() => {
        refetchProducts();
      }, 500);
      setSnackbar({
        open: true,
        message: "محصول با موفقیت حذف شد",
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
          "خطا در حذف محصول",
        severity: "error",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleProductStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setTimeout(() => {
        refetchProducts();
      }, 500);
      setSnackbar({
        open: true,
        message: "وضعیت محصول با موفقیت به‌روزرسانی شد",
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
          "خطا در به‌روزرسانی وضعیت محصول",
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
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
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
    // For FormData with PATCH, we need to identify which fields have changed
    // and only append those to the FormData
    const changedData = new FormData();
    
    // Check each field for changes
    if (editingProduct.name !== formData.name) {
      changedData.append("name", formData.name);
    }
    
    if (editingProduct.description !== formData.description) {
      changedData.append("description", formData.description);
    }
    
    if (editingProduct.price !== formData.price) {
      changedData.append("price", formData.price.toString());
    }
    
    if (editingProduct.category_id !== formData.category_id) {
      changedData.append("category_id", formData.category_id.toString());
    }
    
    if (editingProduct.subcategory_id !== formData.subcategory_id) {
      changedData.append("subcategory_id", formData.subcategory_id.toString());
    }
    
    if (editingProduct.status !== formData.status) {
      changedData.append("status", formData.status);
    }
    
    if (editingProduct.stock !== formData.stock) {
      changedData.append("stock", formData.stock.toString());
    }
    
    if (editingProduct.ingredients !== formData.ingredients) {
      changedData.append("ingredients", formData.ingredients);
    }
    
    // Always include image if a new one is selected
    if (imageFile) {
      changedData.append("image", imageFile);
    }
    
    updateMutation.mutate({ id: editingProduct.id, data: changedData });
  } else {
    createMutation.mutate(data);
  }
};

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "price" || name === "stock" || name === "category_id" || name === "subcategory_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value) || 0,
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
    if (window.confirm("آیا از حذف این محصول مطمئن هستید؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  // Get subcategories for selected category
  const categorySubcategories = subcategories.filter(sub => sub.category_id === formData.category_id);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || product.category_id.toString() === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Transform data for DataGrid with category and subcategory names
  const rows = filteredProducts.map((product) => {
    // Debug: Log product data
    console.log('Processing product:', product);
    
    return {
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      category_name: getCategoryName(product.category_id),
      subcategory_name: getSubcategoryName(product.subcategory_id),
      status: product.status,
      stock: product.stock,
      ingredients: product.ingredients || "",
      image: product.image || "",
    };
  });

  // Define columns based on screen size
  const getColumns = () => {
    const baseColumns = [
      {
        field: "name",
        headerName: "نام",
        width: isMobile ? 120 : 150,
        flex: isMobile ? 1 : 0,
      },
      {
        field: "price",
        headerName: "قیمت",
        width: isMobile ? 70 : 80,
        renderCell: (params) => `$${params.value}`,
      },
      {
        field: "status",
        headerName: "وضعیت",
        width: isMobile ? 70 : 80,
        renderCell: (params) => (
          <Chip
            label={params.value === "active" ? "فعال" : "غیرفعال"}
            color={params.value === "active" ? "success" : "error"}
            size="small"
          />
        ),
      },
      {
        field: "stock",
        headerName: "موجودی",
        width: isMobile ? 70 : 80,
        renderCell: (params) => (
          <Chip
            label={params.value}
            color={params.value > 0 ? "primary" : "error"}
            size="small"
          />
        ),
      },
    ];

    if (!isMobile) {
      baseColumns.push(
        {
          field: "category_name",
          headerName: "دسته‌بندی",
          width: 120,
        },
        {
          field: "subcategory_name",
          headerName: "زیردسته‌بندی",
          width: 120,
        },
        {
          field: "image",
          headerName: "تصویر",
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
        }
      );
    }

    baseColumns.push({
      field: "actions",
      headerName: "عملیات",
      width: isMobile ? 150 : 180,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
            title="ویرایش"
            size={isMobile ? "small" : "medium"}
          >
            <EditIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            title="حذف"
            size={isMobile ? "small" : "medium"}
          >
            <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
          <FormControlLabel
            control={
              <Switch
                checked={params.row.status === "active"}
                onChange={() => handleToggleStatus(params.row.id)}
                color="primary"
                size={isMobile ? "small" : "medium"}
              />
            }
            label=""
          />
        </Box>
      ),
    });

    return baseColumns;
  };

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
        خطا در بارگذاری محصولات: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3, maxWidth: 'calc(100vw - 280px)' }}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
        مدیریت محصولات
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }} justifyContent="right">
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Typography variant="h6" color="text.secondary">
                مجموع محصولات
              </Typography>
              <Typography variant="h4">
                {stats?.totalProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Typography variant="h6" color="text.secondary">
                محصولات فعال
              </Typography>
              <Typography variant="h4">
                {stats?.activeProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Typography variant="h6" color="text.secondary">
                ناموجود
              </Typography>
              <Typography variant="h4">
                {stats?.outOfStockProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1 : 2 }}>
              <Typography variant="h6" color="text.secondary">
                ارزش کل موجودی
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
          <Grid container spacing={2} alignItems="center" justifyContent="right">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="جستجوی محصولات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="all">همه وضعیت‌ها</MenuItem>
                  <MenuItem value="active">فعال</MenuItem>
                  <MenuItem value="inactive">غیرفعال</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  displayEmpty
                  size={isMobile ? "small" : "medium"}
                >
                  <MenuItem value="all">همه دسته‌بندی‌ها</MenuItem>
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
                size={isMobile ? "small" : "medium"}
              >
                افزودن محصول
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={rows}
              columns={getColumns()}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: isMobile ? 5 : 10,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              autoHeight
              density={isMobile ? "compact" : "standard"}
              sx={{
                '& .MuiDataGrid-root': {
                  border: 'none',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                },
                '& .MuiDataGrid-columnSeparator': {
                  display: 'none',
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
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="نام محصول"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="قیمت"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ترکیبات"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="تعداد موجودی"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  inputProps={{ min: 0 }}
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>دسته‌بندی</InputLabel>
                  <Select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: parseInt(e.target.value) || 0,
                        subcategory_id: 0, // Reset subcategory when category changes
                      }))
                    }
                    size={isMobile ? "small" : "medium"}
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
                  <InputLabel>زیردسته‌بندی</InputLabel>
                  <Select
                    value={formData.subcategory_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subcategory_id: parseInt(e.target.value) || 0,
                      }))
                    }
                    disabled={!formData.category_id || categorySubcategories.length === 0}
                    size={isMobile ? "small" : "medium"}
                  >
                    {categorySubcategories.map((subcategory) => (
                      <MenuItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                    size={isMobile ? "small" : "medium"}
                  >
                    <MenuItem value="active">فعال</MenuItem>
                    <MenuItem value="inactive">غیرفعال</MenuItem>
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
                    size={isMobile ? "small" : "medium"}
                  >
                    بارگذاری تصویر
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
            <Button onClick={handleCloseDialog} size={isMobile ? "small" : "medium"}>
              انصراف
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
              size={isMobile ? "small" : "medium"}
            >
              {editingProduct ? "به‌روزرسانی" : "ایجاد"}
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