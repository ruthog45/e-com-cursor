import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Box,
  Chip,
} from '@mui/material';
import {
  Timeline,
  Person,
  ShoppingCart,
  Search,
  Favorite,
} from '@mui/icons-material';

export default function CustomerAnalytics() {
  const [customerProfiles, setCustomerProfiles] = useState([]);
  const [behaviorData, setBehaviorData] = useState({
    searchTerms: [],
    viewedProducts: [],
    purchasePatterns: [],
  });

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const [profiles, behavior] = await Promise.all([
        fetch('/api/admin/customer-insights').then(res => res.json()),
        fetch('/api/admin/customer-behavior').then(res => res.json())
      ]);

      setCustomerProfiles(profiles);
      setBehaviorData(behavior);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const getCustomerSegmentColor = (segment) => {
    const colors = {
      'high_value': 'success',
      'regular': 'primary',
      'occasional': 'warning',
      'at_risk': 'error',
    };
    return colors[segment] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Customer Analytics
      </Typography>

      {/* Customer Segments Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Segments
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(customerProfiles.segments || {}).map(([segment, count]) => (
                <Grid item xs={12} sm={3} key={segment}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {segment.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="h4">
                        {count}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Customer Profiles Table */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Segment</TableCell>
                  <TableCell>Lifetime Value</TableCell>
                  <TableCell>Last Purchase</TableCell>
                  <TableCell>Purchase Frequency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customerProfiles.customers?.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.segment}
                        color={getCustomerSegmentColor(customer.segment)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${customer.lifetimeValue.toFixed(2)}</TableCell>
                    <TableCell>{new Date(customer.lastPurchase).toLocaleDateString()}</TableCell>
                    <TableCell>{customer.purchaseFrequency} orders/month</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Behavior Analysis */}
      <Grid container spacing={3}>
        {/* Popular Search Terms */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Search sx={{ mr: 1 }} />
              <Typography variant="h6">Popular Search Terms</Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Term</TableCell>
                  <TableCell align="right">Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {behaviorData.searchTerms.map((term) => (
                  <TableRow key={term.term}>
                    <TableCell>{term.term}</TableCell>
                    <TableCell align="right">{term.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Most Viewed Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Favorite sx={{ mr: 1 }} />
              <Typography variant="h6">Most Viewed Products</Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Views</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {behaviorData.viewedProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">{product.views}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 