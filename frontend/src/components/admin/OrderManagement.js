import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Chip,
} from '@mui/material';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    shippingInfo: {
      carrier: '',
      trackingNumber: '',
    },
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOpen = (order) => {
    setSelectedOrder(order);
    setFormData({
      status: order.status,
      shippingInfo: order.shippingInfo || {
        carrier: '',
        trackingNumber: '',
      },
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('shippingInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingInfo: {
          ...prev.shippingInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchOrders();
        handleClose();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'processing': 'warning',
      'shipped': 'info',
      'delivered': 'success',
      'cancelled': 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Order Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{order.userId}</TableCell>
                <TableCell>${order.totalAmount}</TableCell>
                <TableCell>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(order.orderDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpen(order)}
                  >
                    Update Status
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          {formData.status === 'shipped' && (
            <>
              <TextField
                margin="dense"
                name="shippingInfo.carrier"
                label="Shipping Carrier"
                fullWidth
                value={formData.shippingInfo.carrier}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="shippingInfo.trackingNumber"
                label="Tracking Number"
                fullWidth
                value={formData.shippingInfo.trackingNumber}
                onChange={handleInputChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 