// src/Pages/Prices/Prices.tsx
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
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPriceAnalytics,
  increasePrices,
  applyDiscount,
  setBulkPrices,
} from "../../services/priceService";
import { getCategories } from "../../services/categoryService";
import { getSubCategories } from "../../services/subcategoryService";
import { getProducts } from "../../services/productService";
import type { Category } from "../../services/categoryService";
import type { SubCategory } from "../../services/subcategoryService";
import type { Product } from "../../services/productService";
import type {
  PriceIncreaseData,
  PriceDiscountData,
  BulkPriceUpdateData,
} from "../../services/priceService";

export default function Prices() {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number>(0);
  const [increaseDialogOpen, setIncreaseDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [bulkPriceDialogOpen, setBulkPriceDialogOpen] = useState(false);
  const [increasePercentage, setIncreasePercentage] = useState<number>(10);
  const [discountPercentage, setDiscountPercentage] = useState<number>(10);
  const [discountDuration, setDiscountDuration] = useState<number>(7); // Added duration state
  const [bulkUpdates, setBulkUpdates] = useState<BulkPriceUpdateData>({
    updates: [],
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const queryClient = useQueryClient();

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["priceAnalytics", selectedCategory, selectedSubcategory],
    queryFn: () =>
      getPriceAnalytics(
        selectedCategory || undefined,
        selectedSubcategory || undefined
      ),
  });

  const { data: categoriesData = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Ensure categories is always an array
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Debug: Log categories data
  console.log("Categories data in Prices:", categories);

  const { data: subcategoriesData = [] } = useQuery({
    queryKey: ["subcategories"],
    queryFn: getSubCategories,
  });

  // Ensure subcategories is always an array
  const subcategories = Array.isArray(subcategoriesData)
    ? subcategoriesData
    : [];

  const { data: productsData = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // Ensure products is always an array
  const products = Array.isArray(productsData) ? productsData : [];

  // Debug: Log products data
  console.log("Products data in Prices:", products);

  // Filter products based on selected category and subcategory
  const filteredProducts = products.filter((product: Product) => {
    const matchesCategory =
      !selectedCategory || product.category_id === selectedCategory;
    const matchesSubcategory =
      !selectedSubcategory || product.subcategory_id === selectedSubcategory;
    return matchesCategory && matchesSubcategory;
  });

  // Initialize bulk updates with filtered products
  const initializeBulkUpdates = () => {
    const updates = filteredProducts.map((product: Product) => ({
      productId: product.id,
      price:
        typeof product.price === "string"
          ? parseFloat(product.price)
          : product.price,
    }));
    setBulkUpdates({ updates });
  };

  const increasePricesMutation = useMutation({
    mutationFn: (data: PriceIncreaseData) => increasePrices(data),
    onSuccess: (data) => {
      console.log("Prices increased successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["priceAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIncreaseDialogOpen(false);
      setSnackbar({
        open: true,
        message: "قیمت‌ها با موفقیت افزودن یافت",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error increasing prices:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "خطا در افزایش قیمت‌ها",
        severity: "error",
      });
    },
  });

  const applyDiscountMutation = useMutation({
    mutationFn: (data: PriceDiscountData) => applyDiscount(data),
    onSuccess: (data) => {
      console.log("Discount applied successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["priceAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDiscountDialogOpen(false);
      setSnackbar({
        open: true,
        message: "تخفیف با موفقیت اعمال شد",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error applying discount:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "خطا در اعمال تخفیف",
        severity: "error",
      });
    },
  });

  const setBulkPricesMutation = useMutation({
    mutationFn: (data: BulkPriceUpdateData) => setBulkPrices(data),
    onSuccess: (data) => {
      console.log("Bulk prices updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["priceAnalytics"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setBulkPriceDialogOpen(false);
      setSnackbar({
        open: true,
        message: "قیمت‌ها با موفقیت به‌روزرسانی شدند",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error updating bulk prices:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "خطا در به‌روزرسانی قیمت‌ها",
        severity: "error",
      });
    },
  });

  const handleIncreasePrices = () => {
    const data: PriceIncreaseData = {
      percentage: increasePercentage,
    };
    if (selectedCategory) data.categoryId = selectedCategory;
    if (selectedSubcategory) data.subcategoryId = selectedSubcategory;

    increasePricesMutation.mutate(data);
  };

  const handleApplyDiscount = () => {
    const data: PriceDiscountData = {
      percentage: discountPercentage,
      duration: discountDuration, // Added duration to the request
    };
    if (selectedCategory) data.categoryId = selectedCategory;
    if (selectedSubcategory) data.subcategoryId = selectedSubcategory;

    applyDiscountMutation.mutate(data);
  };

  const handleSetBulkPrices = () => {
    setBulkPricesMutation.mutate(bulkUpdates);
  };

  const handleBulkPriceChange = (productId: number, newPrice: string) => {
    const price = parseFloat(newPrice) || 0;
    setBulkUpdates((prev) => ({
      updates: prev.updates.map((update) =>
        update.productId === productId ? { ...update, price } : update
      ),
    }));
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category ? category.name : "ناشناس";
  };

  const getSubcategoryName = (subcategoryId: number): string => {
    const subcategory = subcategories.find(
      (sub: SubCategory) => sub.id === subcategoryId
    );
    return subcategory ? subcategory.name : "ناشناس";
  };

  const categorySubcategories = subcategories.filter(
    (sub: SubCategory) => sub.category_id === selectedCategory
  );

  if (isAnalyticsLoading) {
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

  if (analyticsError) {
    console.error("Price analytics error:", analyticsError);
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        خطا در بارگذاری تحلیل قیمت‌ها: {analyticsError.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        مدیریت قیمت‌ها
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="right"
          >
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>دسته‌بندی</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(Number(e.target.value) || 0);
                    setSelectedSubcategory(0);
                  }}
                  label="دسته‌بندی"
                >
                  <MenuItem value={0}>همه دسته‌بندی‌ها</MenuItem>
                  {categories.map((category: Category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>زیردسته‌بندی</InputLabel>
                <Select
                  value={selectedSubcategory}
                  onChange={(e) =>
                    setSelectedSubcategory(Number(e.target.value) || 0)
                  }
                  label="زیردسته‌بندی"
                  disabled={
                    !selectedCategory || categorySubcategories.length === 0
                  }
                >
                  <MenuItem value={0}>همه زیردسته‌بندی‌ها</MenuItem>
                  {categorySubcategories.map((subcategory: SubCategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  initializeBulkUpdates();
                  setBulkPriceDialogOpen(true);
                }}
                fullWidth
              >
                تنظیم قیمت‌های عمده
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Price Analytics */}
      <Grid container spacing={3} sx={{ mb: 3 }} justifyContent="right">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                مجموع محصولات
              </Typography>
              <Typography variant="h4">
                {analytics?.overview?.totalProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                حداقل قیمت
              </Typography>
              <Typography variant="h4">
                ${analytics?.overview?.minPrice || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                حداکثر قیمت
              </Typography>
              <Typography variant="h4">
                ${analytics?.overview?.maxPrice || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                میانگین قیمت
              </Typography>
              <Typography variant="h4">
                ${analytics?.overview?.avgPrice || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Price Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }} justifyContent="right">
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ direction: "rtl" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                افزایش قیمت‌ها
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                افزایش قیمت‌ها بر اساس درصد برای دسته‌بندی/زیردسته‌بندی انتخاب
                شده
              </Typography>
              <Button
                variant="contained"
                color="success"
                startIcon={<TrendingUpIcon />}
                onClick={() => setIncreaseDialogOpen(true)}
                fullWidth
              >
                افزایش قیمت‌ها
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ direction: "rtl" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                اعمال تخفیف
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                اعمال تخفیف بر اساس درصد برای دسته‌بندی/زیردسته‌بندی انتخاب شده
              </Typography>
              <Button
                variant="contained"
                color="warning"
                startIcon={<TrendingDownIcon />}
                onClick={() => setDiscountDialogOpen(true)}
                fullWidth
              >
                اعمال تخفیف
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Statistics */}
      {analytics?.categoryStats &&
        Object.keys(analytics.categoryStats).length > 0 && (
          <Card sx={{ mb: 3, direction: "rtl" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                آمار دسته‌بندی‌ها
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">دسته‌بندی</TableCell>
                      <TableCell align="center">محصولات</TableCell>
                      <TableCell align="center">حداقل قیمت</TableCell>
                      <TableCell align="center">حداکثر قیمت</TableCell>
                      <TableCell align="center">میانگین قیمت</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(analytics.categoryStats).map(
                      ([categoryName, stats]) => (
                        <TableRow key={categoryName}>
                          <TableCell align="center">{categoryName}</TableCell>
                          <TableCell align="center">
                            {stats.productCount}
                          </TableCell>
                          <TableCell align="center">
                            ${stats.minPrice}
                          </TableCell>
                          <TableCell align="center">
                            ${stats.maxPrice}
                          </TableCell>
                          <TableCell align="center">
                            ${stats.avgPrice}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

      {/* Increase Prices Dialog */}
      <Dialog
        open={increaseDialogOpen}
        onClose={() => setIncreaseDialogOpen(false)}
      >
        <DialogTitle>افزایش قیمت‌ها</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="درصد"
            type="number"
            fullWidth
            variant="standard"
            value={increasePercentage}
            onChange={(e) => setIncreasePercentage(Number(e.target.value) || 0)}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
          {selectedCategory > 0 && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              این تغییر اعمال خواهد شد بر: {getCategoryName(selectedCategory)}
              {selectedSubcategory > 0 &&
                ` > ${getSubcategoryName(selectedSubcategory)}`}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncreaseDialogOpen(false)}>انصراف</Button>
          <Button
            onClick={handleIncreasePrices}
            variant="contained"
            disabled={increasePricesMutation.isPending}
          >
            افزایش
          </Button>
        </DialogActions>
      </Dialog>

      {/* Apply Discount Dialog */}
      <Dialog
        open={discountDialogOpen}
        onClose={() => setDiscountDialogOpen(false)}
      >
        <DialogTitle>اعمال تخفیف</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="درصد"
            type="number"
            fullWidth
            variant="standard"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(Number(e.target.value) || 0)}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
          <TextField
            margin="dense"
            label="مدت زمان (روز)"
            type="number"
            fullWidth
            variant="standard"
            value={discountDuration}
            onChange={(e) => setDiscountDuration(Number(e.target.value) || 0)}
            InputProps={{
              endAdornment: <InputAdornment position="end">روز</InputAdornment>,
            }}
            sx={{ mt: 2 }}
          />
          {selectedCategory > 0 && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              این تغییر اعمال خواهد شد بر: {getCategoryName(selectedCategory)}
              {selectedSubcategory > 0 &&
                ` > ${getSubcategoryName(selectedSubcategory)}`}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountDialogOpen(false)}>انصراف</Button>
          <Button
            onClick={handleApplyDiscount}
            variant="contained"
            disabled={applyDiscountMutation.isPending}
          >
            اعمال
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Price Update Dialog */}
      <Dialog
        open={bulkPriceDialogOpen}
        onClose={() => setBulkPriceDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>تنظیم قیمت‌های عمده</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            به‌روزرسانی قیمت‌ها برای چندین محصول به صورت همزمان
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>محصول</TableCell>
                  <TableCell align="right">قیمت فعلی</TableCell>
                  <TableCell align="right">قیمت جدید</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bulkUpdates.updates.map((update) => {
                  const product = products.find(
                    (p: Product) => p.id === update.productId
                  );
                  return (
                    <TableRow key={update.productId}>
                      <TableCell>{product?.name || "محصول ناشناس"}</TableCell>
                      <TableCell align="right">
                        ${" "}
                        {typeof product?.price === "string"
                          ? parseFloat(product.price)
                          : product?.price || 0}
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={update.price}
                          onChange={(e) =>
                            handleBulkPriceChange(
                              update.productId,
                              e.target.value
                            )
                          }
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkPriceDialogOpen(false)}>انصراف</Button>
          <Button
            onClick={handleSetBulkPrices}
            variant="contained"
            disabled={setBulkPricesMutation.isPending}
          >
            به‌روزرسانی قیمت‌ها
          </Button>
        </DialogActions>
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
