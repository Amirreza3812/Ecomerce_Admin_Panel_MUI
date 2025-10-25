// src/Pages/Dashboard/components/CustomizedDataGrid.tsx
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { Chip, Box, CircularProgress, Alert, Avatar } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getRecentOrders } from "../../../services/dashboardService";

// Function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Function to generate a color based on name
const stringToColor = (string: string) => {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'info';
    case 'preparing':
      return 'primary';
    case 'ready':
      return 'secondary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const formatStatus = (status: string) => {
  // Convert status to Persian
  switch (status) {
    case 'pending':
      return 'در انتظار';
    case 'confirmed':
      return 'تأیید شده';
    case 'preparing':
      return 'در حال آماده‌سازی';
    case 'ready':
      return 'آماده';
    case 'completed':
      return 'تکمیل شده';
    case 'cancelled':
      return 'لغو شده';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export default function CustomizedDataGrid() {
  const theme = useTheme();
  
  const {
    data: recentOrders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: () => getRecentOrders(20),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        خطا در بارگذاری سفارشات اخیر: {error.message}
      </Alert>
    );
  }

  // Transform the recent orders data to match the DataGrid format
  const rows = recentOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      avatar: {
        name: getInitials(order.customerName),
        color: stringToColor(order.customerName)
      }
    },
    date: new Date(order.createdAt).toLocaleDateString(),
    total: order.totalAmount,
    status: order.status,
  }));

  const columns = [
    { 
      field: 'orderNumber', 
      headerName: 'شماره سفارش', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'customer', 
      headerName: 'مشتری', 
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              backgroundColor: params.value.avatar.color,
              width: 32,
              height: 32,
              fontSize: '0.8rem',
            }}
          >
            {params.value.avatar.name}
          </Avatar>
          <Box>
            <Box sx={{ fontWeight: 'medium' }}>{params.value.name}</Box>
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {params.value.email}
            </Box>
          </Box>
        </Box>
      )
    },
    { 
      field: 'date', 
      headerName: 'تاریخ', 
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'total', 
      headerName: 'مجموع', 
      flex: 1,
      minWidth: 100,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      field: 'status', 
      headerName: 'وضعیت', 
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={formatStatus(params.value)}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      )
    },
  ];

  return (
    <DataGrid
      checkboxSelection
      rows={rows}
      columns={columns}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
      }
      initialState={{
        pagination: { 
          paginationModel: { pageSize: 10 } 
        },
        sorting: {
          sortModel: [{ field: 'date', sort: 'desc' }],
        },
      }}
      pageSizeOptions={[10, 20, 50]}
      disableColumnResize
      density="compact"
      sx={{
        border: 0,
        '& .MuiDataGrid-columnHeaders': {
          backgroundColor: theme.palette.grey[50],
        },
        '& .MuiDataGrid-row': {
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
      }}
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: "outlined",
              size: "small",
            },
            columnInputProps: {
              variant: "outlined",
              size: "small",
              sx: { mt: "auto" },
            },
            operatorInputProps: {
              variant: "outlined",
              size: "small",
              sx: { mt: "auto" },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: "outlined",
                size: "small",
              },
            },
          },
        },
      }}
    />
  );
}