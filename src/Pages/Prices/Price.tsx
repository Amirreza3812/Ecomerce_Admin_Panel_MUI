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
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
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
  PriceAnalytics,
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
        message: "Prices increased successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error increasing prices:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to increase prices",
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
        message: "Discount applied successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error applying discount:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to apply discount",
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
        message: "Prices updated successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error updating bulk prices:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update prices",
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
    return category ? category.name : "Unknown";
  };

  const getSubcategoryName = (subcategoryId: number): string => {
    const subcategory = subcategories.find(
      (sub: SubCategory) => sub.id === subcategoryId
    );
    return subcategory ? subcategory.name : "Unknown";
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
        Error loading price analytics: {analyticsError.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Price Management
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(parseInt(e.target.value) || 0);
                    setSelectedSubcategory(0);
                  }}
                  label="Category"
                >
                  <MenuItem value={0}>All Categories</MenuItem>
                  {categories.map((category: Category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={selectedSubcategory}
                  onChange={(e) =>
                    setSelectedSubcategory(parseInt(e.target.value) || 0)
                  }
                  label="Subcategory"
                  disabled={
                    !selectedCategory || categorySubcategories.length === 0
                  }
                >
                  <MenuItem value={0}>All Subcategories</MenuItem>
                  {categorySubcategories.map((subcategory: SubCategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  initializeBulkUpdates();
                  setBulkPriceDialogOpen(true);
                }}
                fullWidth
              >
                Set Bulk Prices
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Price Analytics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Total Products
              </Typography>
              <Typography variant="h4">
                {analytics?.overview?.totalProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Min Price
              </Typography>
              <Typography variant="h4">
                ${analytics?.overview?.minPrice || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Max Price
              </Typography>
              <Typography variant="h4">
                ${analytics?.overview?.maxPrice || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Avg Price
              </Typography>
              <Typography variant="h4">
                ${analytics?.overview?.avgPrice || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Price Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Increase Prices
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Increase prices by a percentage for selected
                category/subcategory
              </Typography>
              <Button
                variant="contained"
                color="success"
                startIcon={<TrendingUpIcon />}
                onClick={() => setIncreaseDialogOpen(true)}
                fullWidth
              >
                Increase Prices
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Apply Discount
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Apply a discount by percentage for selected category/subcategory
              </Typography>
              <Button
                variant="contained"
                color="warning"
                startIcon={<TrendingDownIcon />}
                onClick={() => setDiscountDialogOpen(true)}
                fullWidth
              >
                Apply Discount
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Statistics */}
      {analytics?.categoryStats &&
        Object.keys(analytics.categoryStats).length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Statistics
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Products</TableCell>
                      <TableCell align="right">Min Price</TableCell>
                      <TableCell align="right">Max Price</TableCell>
                      <TableCell align="right">Avg Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(analytics.categoryStats).map(
                      ([categoryName, stats]) => (
                        <TableRow key={categoryName}>
                          <TableCell>{categoryName}</TableCell>
                          <TableCell align="right">
                            {stats.productCount}
                          </TableCell>
                          <TableCell align="right">${stats.minPrice}</TableCell>
                          <TableCell align="right">${stats.maxPrice}</TableCell>
                          <TableCell align="right">${stats.avgPrice}</TableCell>
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
        <DialogTitle>Increase Prices</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Percentage"
            type="number"
            fullWidth
            variant="standard"
            value={increasePercentage}
            onChange={(e) =>
              setIncreasePercentage(parseInt(e.target.value) || 0)
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
          {selectedCategory > 0 && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              This will apply to: {getCategoryName(selectedCategory)}
              {selectedSubcategory > 0 &&
                ` > ${getSubcategoryName(selectedSubcategory)}`}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncreaseDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleIncreasePrices}
            variant="contained"
            disabled={increasePricesMutation.isPending}
          >
            Increase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Apply Discount Dialog */}
      <Dialog
        open={discountDialogOpen}
        onClose={() => setDiscountDialogOpen(false)}
      >
        <DialogTitle>Apply Discount</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Percentage"
            type="number"
            fullWidth
            variant="standard"
            value={discountPercentage}
            onChange={(e) =>
              setDiscountPercentage(parseInt(e.target.value) || 0)
            }
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
          {selectedCategory > 0 && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              This will apply to: {getCategoryName(selectedCategory)}
              {selectedSubcategory > 0 &&
                ` > ${getSubcategoryName(selectedSubcategory)}`}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleApplyDiscount}
            variant="contained"
            disabled={applyDiscountMutation.isPending}
          >
            Apply
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
        <DialogTitle>Set Bulk Prices</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Update prices for multiple products at once
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">New Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bulkUpdates.updates.map((update) => {
                  const product = products.find(
                    (p: Product) => p.id === update.productId
                  );
                  return (
                    <TableRow key={update.productId}>
                      <TableCell>
                        {product?.name || "Unknown Product"}
                      </TableCell>
                      <TableCell align="right">
                        $
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
          <Button onClick={() => setBulkPriceDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSetBulkPrices}
            variant="contained"
            disabled={setBulkPricesMutation.isPending}
          >
            Update Prices
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
