import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { trackProductInteraction } from '../../utils/analytics';

const steps = ['Shipping Information', 'Review Order', 'Payment'];

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product information');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateForm = () => {
    const requiredFields = [
      'fullName',
      'email',
      'phone',
      'address',
      'city',
      'state',
      'zipCode',
      'country',
    ];
    
    const emptyFields = requiredFields.filter(field => !formData[field]);
    if (emptyFields.length > 0) {
      setError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          productId: id,
          quantity: 1,
          shippingInfo: formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        trackProductInteraction(id, 'purchase');
        navigate(`/order-confirmation/${data.orderId}`);
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('An error occurred while placing your order');
    }
  };

  const renderShippingForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State/Province"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="ZIP/Postal Code"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        />
      </Grid>
    </Grid>
  );

  const renderOrderReview = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      {product && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quantity: 1
          </Typography>
          <Typography variant="h6" color="primary">
            ${product.price}
          </Typography>
        </Box>
      )}
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Shipping Information
      </Typography>
      <Typography variant="body1">
        {formData.fullName}
      </Typography>
      <Typography variant="body2">
        {formData.address}
      </Typography>
      <Typography variant="body2">
        {`${formData.city}, ${formData.state} ${formData.zipCode}`}
      </Typography>
      <Typography variant="body2">
        {formData.country}
      </Typography>
      <Typography variant="body2">
        {formData.email}
      </Typography>
      <Typography variant="body2">
        {formData.phone}
      </Typography>
    </Box>
  );

  const renderPayment = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Method
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Payment will be handled securely on the next step.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        sx={{ mt: 2 }}
      >
        Place Order
      </Button>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderShippingForm();
      case 1:
        return renderOrderReview();
      case 2:
        return renderPayment();
      default:
        return 'Unknown step';
    }
  };

  if (!product && id) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 