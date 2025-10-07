// src/Pages/Dashboard/components/OrderStatusChart.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Typography, Box, CircularProgress, Alert, Chip, Stack } from '@mui/material';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { getOrderStatusDistribution } from '../../../services/dashboardService';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#FFC107';
    case 'confirmed':
      return '#2196F3';
    case 'preparing':
      return '#9C27B0';
    case 'ready':
      return '#00BCD4';
    case 'completed':
      return '#4CAF50';
    case 'cancelled':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const size = {
  width: 400,
  height: 200,
};

export default function OrderStatusChart() {
  const {
    data: statusData = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orderStatusDistribution"],
    queryFn: () => getOrderStatusDistribution('month'),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading order status: {error.message}
      </Alert>
    );
  }

  // Transform data for the pie chart
  const chartData = Object.entries(statusData).map(([status, count]) => ({
    id: status,
    value: count as number,
    label: getStatusLabel(status),
    color: getStatusColor(status),
  }));

  // Calculate total orders
  const totalOrders = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom label for pie chart
  const getArcLabel = (params: any) => {
    const percent = params.value / totalOrders;
    return `${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        minHeight: 400,
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Order Status Distribution
        </Typography>
        
        {/* Chart Container */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2
        }}>
          <PieChart
            series={[
              {
                data: chartData,
                innerRadius: 60,
                outerRadius: 90,
                paddingAngle: 2,
                arcLabel: getArcLabel,
                arcLabelMinAngle: 10,
                arcLabelRadius: 0.75,
              }
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: 'white',
                fontSize: 14,
                fontWeight: 'bold',
              },
            }}
            {...size}
          >
          </PieChart>
        </Box>
        
        {/* Status Details */}
        <Box sx={{ mt: 'auto' }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
            Status Breakdown
          </Typography>
          <Stack spacing={1}>
            {chartData.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: item.color,
                    }}
                  />
                  <Typography variant="body2">
                    {item.label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {item.value}
                  </Typography>
                  <Chip
                    label={`${((item.value / totalOrders) * 100).toFixed(1)}%`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}