// src/Pages/Categories/Categories.tsx
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
  getIcons,
} from "../../services/categoryService";
import type {
  Category,
  CreateCategoryData,
  SubCategory,
  IconOption,
} from "../../services/categoryService";
import { getSubCategoryIcons } from "../../services/subcategoryService";


// Extended SubCategory interface to include icon handling
interface ExtendedSubCategory extends SubCategory {
  iconPreview?: string;
}

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
    icon: "",
    status: "active",
    sort_order: 0,
    subcategories: [],
  });
  const [iconPreview, setIconPreview] = useState<string | null>(null);
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

  const { data: icons = [] } = useQuery({
    queryKey: ["icons"],
    queryFn: getIcons,
  });

  // Fetch subcategory icons separately
  const { data: subcategoryIcons = [] } = useQuery({
    queryKey: ["subcategoryIcons"],
    queryFn: getSubCategoryIcons,
  });

  // Helper function to find icon URL by name
  const getIconUrl = (iconName: string, isSubcategory = false) => {
    const iconList = isSubcategory ? subcategoryIcons : icons;
    const icon = iconList.find((i) => i.name === iconName);
    return icon ? icon.url : null;
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      console.log("Category created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "دسته‌بندی با موفقیت ایجاد شد",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Create category error:", error);

      // Try to get more detailed error information
      let errorMessage = "خطا در ایجاد دسته‌بندی";

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
    mutationFn: ({ id, data }: { id: number; data: CreateCategoryData }) =>
      updateCategory(id, data),
    onSuccess: (data) => {
      console.log("Category updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: "دسته‌بندی با موفقیت به‌روزرسانی شد",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Update category error:", error);

      // Try to get more detailed error information
      let errorMessage = "خطا در به‌روزرسانی دسته‌بندی";

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
        message: "دسته‌بندی با موفقیت حذف شد",
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
          "خطا در حذف دسته‌بندی",
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

      // Convert subcategories to extended format with icon handling
      const extendedSubcategories = subcategoriesArray.map((sub, index) => {
        return {
          id: sub.id,
          name: sub.name || "",
          description: sub.description || "",
          icon: sub.icon || "",
          status: sub.status || "active",
          sort_order: sub.sort_order || 0,
          iconPreview: getIconUrl(sub.icon || "", true), // Use subcategory icons
        };
      });

      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "",
        status: category.status || "active",
        sort_order: category.sort_order || 0,
        subcategories: extendedSubcategories,
      });
      setIconPreview(getIconUrl(category.icon || "")); // Use category icons
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "",
        status: "active",
        sort_order: 0,
        subcategories: [],
      });
      setIconPreview(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      status: "active",
      sort_order: 0,
      subcategories: [],
    });
    setIconPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Process subcategories to handle icons
    const processedSubcategories =
      formData.subcategories?.map((sub) => {
        const { iconPreview, ...subData } = sub as any;
        return subData;
      }) || [];

    if (editingCategory) {
      // Create a data object with only the fields we want to check for changes
      const changedData: any = {};
      
      // Check each field individually
      if (formData.name !== editingCategory.name) {
        changedData.name = formData.name;
      }
      
      if (formData.description !== editingCategory.description) {
        changedData.description = formData.description;
      }
      
      if (formData.icon !== editingCategory.icon) {
        changedData.icon = formData.icon;
      }
      
      if (formData.status !== editingCategory.status) {
        changedData.status = formData.status;
      }
      
      if (formData.sort_order !== editingCategory.sort_order) {
        changedData.sort_order = formData.sort_order;
      }
      
      // Only include subcategories if:
      // 1. The original category had subcategories AND
      // 2. We're actually modifying them (not just empty ones from the form)
      const originalHasSubcategories = editingCategory.subcategories && editingCategory.subcategories.length > 0;
      const formHasValidSubcategories = processedSubcategories.some(sub => 
        sub.name || sub.description || sub.icon
      );
      
      console.log('Original has subcategories:', originalHasSubcategories);
      console.log('Form has valid subcategories:', formHasValidSubcategories);
      
      // Only include subcategories if the original had them AND we're modifying them
      if (originalHasSubcategories && formHasValidSubcategories) {
        changedData.subcategories = processedSubcategories;
      }
      
      // Debug logging
      console.log('Final changed data:', changedData);
      
      // Only send the data if there are actual changes
      if (Object.keys(changedData).length > 0) {
        updateMutation.mutate({ id: editingCategory.id, data: changedData });
      } else {
        // No changes to send
        setSnackbar({
          open: true,
          message: "هیچ تغییری برای به‌روزرسانی وجود ندارد",
          severity: "info",
        });
        handleCloseDialog();
      }
    } else {
      // For creating a new category, include all fields
      createMutation.mutate({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        status: formData.status,
        sort_order: formData.sort_order,
        subcategories: processedSubcategories,
      });
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

  const handleIconChange = (iconName: string, iconUrl: string) => {
    setFormData((prev) => ({ ...prev, icon: iconName }));
    setIconPreview(iconUrl);
  };

  const handleAddSubcategory = () => {
    setFormData((prev) => {
      const newSubcategory: ExtendedSubCategory = {
        name: "",
        description: "",
        status: "active",
        sort_order: prev.subcategories?.length || 0,
        icon: "",
        iconPreview: null,
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

  const handleSubcategoryIconChange = (
    index: number,
    iconName: string,
    iconUrl: string
  ) => {
    setFormData((prev) => {
      const updatedSubcategories = [
        ...(prev.subcategories || []),
      ] as ExtendedSubCategory[];
      updatedSubcategories[index] = {
        ...updatedSubcategories[index],
        icon: iconName,
        iconPreview: iconUrl,
      };

      return {
        ...prev,
        subcategories: updatedSubcategories,
      };
    });
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
    if (window.confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟")) {
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
    icon: getIconUrl(category.icon || ""), // Use category icons
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
      field: "subcategories",
      headerName: "زیردسته‌ها",
      width: 120,
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
      headerName: "تاریخ ایجاد",
      width: 120,
    },
    {
      field: "actions",
      headerName: "عملیات",
      width: 120,
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
    console.error("Categories query error:", error);
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        خطا در بارگذاری دسته‌بندی‌ها: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        مدیریت دسته‌بندی‌ها
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }} justifyContent="right">
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                مجموع دسته‌بندی‌ها
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
                دسته‌بندی‌های فعال
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
                مجموع زیردسته‌ها
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
                محصولات در دسته‌بندی‌ها
              </Typography>
              <Typography variant="h4">{stats?.totalProducts || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center" justifyContent="right">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="جستجوی دسته‌بندی‌ها..."
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
                  <MenuItem value="all">همه وضعیت‌ها</MenuItem>
                  <MenuItem value="active">فعال</MenuItem>
                  <MenuItem value="inactive">غیرفعال</MenuItem>
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
                افزودن دسته‌بندی
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
          {editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="نام دسته‌بندی"
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

              {/* Icon Selection for Category */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  انتخاب آیکون دسته‌بندی
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, maxHeight: 200, overflowY: "auto" }}>
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

              {/* Subcategories Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  زیردسته‌ها ({formData.subcategories?.length || 0})
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
                                label="نام"
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
                                label="توضیحات"
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
                                label="ترتیب نمایش"
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
                            <Grid item xs={12} sm={5}>
                              <Typography variant="subtitle2" gutterBottom>
                                انتخاب آیکون زیردسته
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, maxHeight: 120, overflowY: "auto" }}>
                                {subcategoryIcons.map((icon) => (
                                  <Avatar
                                    key={icon.name}
                                    src={icon.url}
                                    alt={icon.name}
                                    variant="rounded"
                                    sx={{
                                      width: 30,
                                      height: 30,
                                      cursor: "pointer",
                                      border: (subcategory as ExtendedSubCategory).icon === icon.name ? "2px solid" : "1px solid",
                                      borderColor: (subcategory as ExtendedSubCategory).icon === icon.name ? "primary.main" : "grey.300",
                                    }}
                                    onClick={() => handleSubcategoryIconChange(index, icon.name, icon.url)}
                                  />
                                ))}
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
                    هنوز زیردسته‌ای اضافه نشده است. روی دکمه + کلیک کنید تا یکی اضافه کنید.
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
            <Button onClick={handleCloseDialog}>انصراف</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingCategory ? "به‌روزرسانی" : "ایجاد"}
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