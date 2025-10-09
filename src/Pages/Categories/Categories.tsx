// src/Pages/Categories/Categories.tsx
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Fab,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} from "../../services/categoryService";
import type {
  Category,
  CreateCategoryData,
  SubCategory,
} from "../../services/categoryService";

// SubCategoryImage interface to handle file and preview
interface SubCategoryImage {
  file?: File;
  preview?: string;
  url?: string; // Existing URL from database
}

// Extended SubCategory interface to include image handling
interface ExtendedSubCategory extends SubCategory {
  imageFile?: File;
  imagePreview?: string;
}

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
    image: "",
    status: "active",
    sort_order: 0,
    subcategories: [],
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
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["categoryStats"],
    queryFn: getCategoryStats,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      console.log("Category created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "Category created successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Create category error:", error);

      // Try to get more detailed error information
      let errorMessage = "Failed to create category";

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
      updateCategory(id, data),
    onSuccess: (data) => {
      console.log("Category updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "Category updated successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Update category error:", error);

      // Try to get more detailed error information
      let errorMessage = "Failed to update category";

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
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setSnackbar({
        open: true,
        message: "Category deleted successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Delete category error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete category",
        severity: "error",
      });
    },
  });

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);

      // Ensure subcategories is always an array
      let subcategoriesArray: any[] = [];

      // Check if subcategories exists and is an array
      if (category.subcategories && Array.isArray(category.subcategories)) {
        subcategoriesArray = category.subcategories;
      } else if (category.subcategories) {
        // If it's not an array, try to parse it if it's a string
        try {
          if (typeof category.subcategories === "string") {
            subcategoriesArray = JSON.parse(category.subcategories);
          } else {
            // If it's an object, convert it to an array
            subcategoriesArray = [category.subcategories];
          }
        } catch (e) {
          console.error("Error parsing subcategories:", e);
          subcategoriesArray = [];
        }
      }

      // Convert subcategories to extended format with image handling
      const extendedSubcategories = subcategoriesArray.map((sub, index) => {
        return {
          id: sub.id,
          name: sub.name || "",
          description: sub.description || "",
          image: sub.image || "",
          status: sub.status || "active",
          sort_order: sub.sort_order || 0,
          imagePreview: sub.image || null,
          imageFile: undefined,
        };
      });

      setFormData({
        name: category.name,
        description: category.description || "",
        image: category.image || "",
        status: category.status || "active",
        sort_order: category.sort_order || 0,
        subcategories: extendedSubcategories,
      });
      setImagePreview(category.image || null);
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        image: "",
        status: "active",
        sort_order: 0,
        subcategories: [],
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      image: "",
      status: "active",
      sort_order: 0,
      subcategories: [],
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
  if (formData.status) data.append("status", formData.status);
  if (formData.sort_order !== undefined)
    data.append("sort_order", formData.sort_order.toString());

  // Process subcategories to handle images
  const processedSubcategories =
    formData.subcategories?.map((sub) => {
      const { imageFile, imagePreview, ...subData } = sub as any;
      return subData;
    }) || [];

  // Add subcategories as JSON string
  if (processedSubcategories.length > 0) {
    data.append("subcategories", JSON.stringify(processedSubcategories));
  }

  // Add category image file if selected
  if (imageFile) {
    data.append("image", imageFile);
  }

  // Add subcategory images
  formData.subcategories?.forEach((sub, index) => {
    const extendedSub = sub as ExtendedSubCategory;
    if (extendedSub.imageFile) {
      data.append(`subcategoryImage_${index}`, extendedSub.imageFile);
    }
  });

  if (editingCategory) {
    // Pass FormData directly to the mutation
    updateMutation.mutate({ id: editingCategory.id, data });
  } else {
    // Pass FormData directly to the mutation (without wrapping in an object)
    createMutation.mutate(data);
  }
};

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "sort_order") {
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

  const handleAddSubcategory = () => {
    setFormData((prev) => {
      const newSubcategory: ExtendedSubCategory = {
        name: "",
        description: "",
        status: "active",
        sort_order: prev.subcategories?.length || 0,
        image: "",
        imagePreview: null,
        imageFile: undefined,
      };

      return {
        ...prev,
        subcategories: [...(prev.subcategories || []), newSubcategory],
      };
    });
  };

  const handleSubcategoryChange = (
    index: number,
    field: keyof SubCategory,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedSubcategories = [
        ...(prev.subcategories || []),
      ] as ExtendedSubCategory[];
      updatedSubcategories[index] = {
        ...updatedSubcategories[index],
        [field]: value,
      };

      return {
        ...prev,
        subcategories: updatedSubcategories,
      };
    });
  };

  const handleSubcategoryImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setFormData((prev) => {
        const updatedSubcategories = [
          ...(prev.subcategories || []),
        ] as ExtendedSubCategory[];

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          // Update with preview after file is read
          setFormData((currentPrev) => {
            const currentSubcategories = [
              ...(currentPrev.subcategories || []),
            ] as ExtendedSubCategory[];
            currentSubcategories[index] = {
              ...currentSubcategories[index],
              imagePreview: reader.result as string,
              imageFile: file,
            };
            return {
              ...currentPrev,
              subcategories: currentSubcategories,
            };
          });
        };
        reader.readAsDataURL(file);

        return {
          ...prev,
          subcategories: updatedSubcategories,
        };
      });
    }
  };

  const handleRemoveSubcategory = (index: number) => {
    setFormData((prev) => {
      const updatedSubcategories = [...(prev.subcategories || [])];
      updatedSubcategories.splice(index, 1);
      return {
        ...prev,
        subcategories: updatedSubcategories,
      };
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Transform data for DataGrid
  const rows = filteredCategories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description || "",
    status: category.status,
    sort_order: category.sort_order || 0,
    subcategories: Array.isArray(category.subcategories)
      ? category.subcategories.length
      : 0,
    createdAt: new Date(category.createdAt).toLocaleDateString(),
    image: category.image || "",
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
      field: "subcategories",
      headerName: "Subcategories",
      width: 120,
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
            alt="Category"
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
      width: 120,
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
    console.error("Categories query error:", error);
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading categories: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Categories Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Total Categories
              </Typography>
              <Typography variant="h4">
                {stats?.totalCategories || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Active Categories
              </Typography>
              <Typography variant="h4">
                {stats?.activeCategories || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Total Subcategories
              </Typography>
              <Typography variant="h4">
                {stats?.totalSubcategories || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Products in Categories
              </Typography>
              <Typography variant="h4">{stats?.totalProducts || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search categories..."
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                fullWidth
              >
                Add Category
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Categories Table */}
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? "Edit Category" : "Add New Category"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category Name"
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
                      alt="Category preview"
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

              {/* Subcategories Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Subcategories ({formData.subcategories?.length || 0})
                </Typography>
                {formData.subcategories && formData.subcategories.length > 0 ? (
                  <List>
                    {formData.subcategories.map((subcategory, index) => (
                      <Box key={index}>
                        <ListItem>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                label="Name"
                                value={subcategory.name || ""}
                                onChange={(e) =>
                                  handleSubcategoryChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                label="Description"
                                value={subcategory.description || ""}
                                onChange={(e) =>
                                  handleSubcategoryChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <TextField
                                fullWidth
                                label="Sort Order"
                                type="number"
                                value={subcategory.sort_order || 0}
                                onChange={(e) =>
                                  handleSubcategoryChange(
                                    index,
                                    "sort_order",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                size="small"
                                inputProps={{ min: 0 }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  component="label"
                                  size="small"
                                  startIcon={<ImageIcon />}
                                >
                                  Image
                                  <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleSubcategoryImageChange(index, e)
                                    }
                                  />
                                </Button>
                                {(subcategory as ExtendedSubCategory)
                                  .imagePreview && (
                                  <Avatar
                                    src={
                                      (subcategory as ExtendedSubCategory)
                                        .imagePreview
                                    }
                                    alt="Subcategory preview"
                                    variant="rounded"
                                    sx={{ width: 30, height: 30 }}
                                  />
                                )}
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={1}>
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveSubcategory(index)}
                              >
                                <RemoveIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </ListItem>
                        <Divider />
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2 }}
                  >
                    No subcategories added yet. Click the + button to add one.
                  </Typography>
                )}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Fab
                    size="small"
                    color="primary"
                    aria-label="add"
                    onClick={handleAddSubcategory}
                  >
                    <AddIcon />
                  </Fab>
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
              {editingCategory ? "Update" : "Create"}
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
