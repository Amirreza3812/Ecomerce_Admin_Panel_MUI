// src/Pages/Comments/Comments.tsx
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Pagination,
  Rating,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search as SearchIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComments,
  moderateComment,
} from "../../services/commentService";
import { getProducts } from "../../services/productService";
import type {
  Comment,
  CommentResponse,
  CommentFilters,
  ModerateCommentData,
} from "../../services/commentService";
import type { Product } from "../../services/productService";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Comments() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [productFilter, setProductFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [moderateDialogOpen, setModerateDialogOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const queryClient = useQueryClient();

  // Create filters object based on current state
  const filters: CommentFilters = {
    page,
    limit,
    status: statusFilter as 'all' | 'pending' | 'approved' | 'rejected',
    rating: ratingFilter || undefined,
    productId: productFilter || undefined,
  };

  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["comments", filters],
    queryFn: () => getComments(filters),
  });

  // Ensure commentsData is not null
  const commentsResponse: CommentResponse = commentsData || {
    comments: [],
    pagination: { total: 0, page: 1, pages: 0, limit: 20 },
    statistics: { total: 0, pending: 0, approved: 0, rejected: 0 }
  };

  const { data: productsData = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // Ensure products is always an array
  const products = Array.isArray(productsData) ? productsData : [];

  const moderateCommentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ModerateCommentData }) =>
      moderateComment(id, data),
    onSuccess: (data) => {
      console.log("Comment moderated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      setModerateDialogOpen(false);
      setSelectedComment(null);
      setAdminNote("");
      setSnackbar({
        open: true,
        message: "Comment moderated successfully",
        severity: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error moderating comment:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to moderate comment",
        severity: "error",
      });
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Set status filter based on tab
    if (newValue === 0) setStatusFilter("all");
    else if (newValue === 1) setStatusFilter("pending");
    else if (newValue === 2) setStatusFilter("approved");
    else if (newValue === 3) setStatusFilter("rejected");
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSearch = () => {
    // In a real implementation, you would add a search parameter to the API
    // For now, we'll just refetch with current filters
    refetch();
  };

  const handleViewComment = (comment: Comment) => {
    setSelectedComment(comment);
  };

  const handleModerateComment = (comment: Comment, action: 'approve' | 'reject' | 'delete') => {
    setSelectedComment(comment);
    setModerateDialogOpen(true);
    setAdminNote("");
  };

  const handleConfirmModerate = () => {
    if (!selectedComment) return;

    // Determine action based on which button was clicked
    let action: 'approve' | 'reject' | 'delete' = 'approve';
    if (selectedComment.status === 'pending') {
      action = 'approve';
    } else if (selectedComment.status === 'approved') {
      action = 'reject';
    } else {
      action = 'delete';
    }

    moderateCommentMutation.mutate({
      id: selectedComment.id,
      data: { action, adminNote },
    });
  };

  const handleApproveComment = (comment: Comment) => {
    moderateCommentMutation.mutate({
      id: comment.id,
      data: { action: 'approve', adminNote: "" },
    });
  };

  const handleRejectComment = (comment: Comment) => {
    moderateCommentMutation.mutate({
      id: comment.id,
      data: { action: 'reject', adminNote: "" },
    });
  };

  const handleDeleteComment = (comment: Comment) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      moderateCommentMutation.mutate({
        id: comment.id,
        data: { action: 'delete', adminNote: "" },
      });
    }
  };

  const getProductName = (productId: number): string => {
    const product = products.find((p: Product) => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
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
    console.error("Comments query error:", error);
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading comments: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Comments Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Total Comments
              </Typography>
              <Typography variant="h4">
                {commentsResponse.statistics.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {commentsResponse.statistics.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Approved
              </Typography>
              <Typography variant="h4" color="success.main">
                {commentsResponse.statistics.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Rejected
              </Typography>
              <Typography variant="h4" color="error.main">
                {commentsResponse.statistics.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search comments..."
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
                <InputLabel>Product</InputLabel>
                <Select
                  value={productFilter}
                  onChange={(e) => setProductFilter(parseInt(e.target.value) || 0)}
                  label="Product"
                >
                  <MenuItem value={0}>All Products</MenuItem>
                  {products.map((product: Product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Rating</InputLabel>
                <Select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(parseInt(e.target.value) || 0)}
                  label="Rating"
                >
                  <MenuItem value={0}>All Ratings</MenuItem>
                  <MenuItem value={1}>1 Star</MenuItem>
                  <MenuItem value={2}>2 Stars</MenuItem>
                  <MenuItem value={3}>3 Stars</MenuItem>
                  <MenuItem value={4}>4 Stars</MenuItem>
                  <MenuItem value={5}>5 Stars</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Items per page</InputLabel>
                <Select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value) || 20);
                    setPage(1); // Reset to first page when changing limit
                  }}
                  label="Items per page"
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                onClick={handleSearch}
                fullWidth
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for status filtering */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`All (${commentsResponse.statistics.total})`} />
          <Tab label={`Pending (${commentsResponse.statistics.pending})`} />
          <Tab label={`Approved (${commentsResponse.statistics.approved})`} />
          <Tab label={`Rejected (${commentsResponse.statistics.rejected})`} />
        </Tabs>
      </Box>

      {/* Comments Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commentsResponse.comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>{getProductName(comment.productId)}</TableCell>
                    <TableCell>{comment.userName || `User ${comment.userId}`}</TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {comment.content}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Rating value={comment.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={comment.status}
                        color={getStatusColor(comment.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewComment(comment)}
                          title="View"
                        >
                          <ViewIcon />
                        </IconButton>
                        {comment.status === 'pending' && (
                          <>
                            <IconButton
                              color="success"
                              onClick={() => handleApproveComment(comment)}
                              title="Approve"
                            >
                              <ApproveIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleRejectComment(comment)}
                              title="Reject"
                            >
                              <RejectIcon />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteComment(comment)}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={commentsResponse.pagination.pages}
          page={commentsResponse.pagination.page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* View Comment Dialog */}
      <Dialog
        open={!!selectedComment && !moderateDialogOpen}
        onClose={() => setSelectedComment(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Comment Details</DialogTitle>
        <DialogContent>
          {selectedComment && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Product</Typography>
                  <Typography variant="body1">
                    {getProductName(selectedComment.productId)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">User</Typography>
                  <Typography variant="body1">
                    {selectedComment.userName || `User ${selectedComment.userId}`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Rating</Typography>
                  <Rating value={selectedComment.rating} readOnly />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip
                    label={selectedComment.status}
                    color={getStatusColor(selectedComment.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Comment</Typography>
                  <Typography variant="body1">{selectedComment.content}</Typography>
                </Grid>
                {selectedComment.adminNote && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Admin Note</Typography>
                    <Typography variant="body1">{selectedComment.adminNote}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Date</Typography>
                  <Typography variant="body1">
                    {new Date(selectedComment.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedComment(null)}>Close</Button>
          {selectedComment && selectedComment.status === 'pending' && (
            <>
              <Button
                color="success"
                onClick={() => handleApproveComment(selectedComment)}
              >
                Approve
              </Button>
              <Button
                color="error"
                onClick={() => handleRejectComment(selectedComment)}
              >
                Reject
              </Button>
            </>
          )}
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