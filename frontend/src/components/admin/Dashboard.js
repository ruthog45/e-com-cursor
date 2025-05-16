import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tab,
  Tabs,
  Button,
} from '@mui/material';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import CustomerAnalytics from './CustomerAnalytics';
import ProductRecommendations from './ProductRecommendations';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

export default function Dashboard() {
  const [value, setValue] = useState(0);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    activeCustomers: 0,
    customerRetentionRate: 0,
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders, customerStats] = await Promise.all([
          fetch('/api/admin/products').then(res => res.json()),
          fetch('/api/admin/orders').then(res => res.json()),
          fetch('/api/admin/dashboard').then(res => res.json())
        ]);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter(order => order.status === 'processing').length,
          lowStockProducts: products.filter(product => product.stock < 10).length,
          activeCustomers: customerStats.activeCustomers,
          customerRetentionRate: customerStats.retentionRate,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Products</Typography>
            <Typography variant="h4">{stats.totalProducts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Orders</Typography>
            <Typography variant="h4">{stats.totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: stats.pendingOrders > 0 ? '#fff3e0' : 'white' }}>
            <Typography variant="h6">Pending Orders</Typography>
            <Typography variant="h4">{stats.pendingOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: stats.lowStockProducts > 0 ? '#ffebee' : 'white' }}>
            <Typography variant="h6">Low Stock Items</Typography>
            <Typography variant="h4">{stats.lowStockProducts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Active Customers</Typography>
            <Typography variant="h4">{stats.activeCustomers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Customer Retention</Typography>
            <Typography variant="h4">{(stats.customerRetentionRate * 100).toFixed(1)}%</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Management Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Product Management" />
          <Tab label="Order Management" />
          <Tab label="Customer Analytics" />
          <Tab label="Recommendations" />
        </Tabs>
        
        <TabPanel value={value} index={0}>
          <ProductManagement />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <OrderManagement />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <CustomerAnalytics />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <ProductRecommendations />
        </TabPanel>
      </Paper>
    </Container>
  );
} 