import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Rating,
  TextField,
  Divider,
  IconButton,
  ImageList,
  ImageListItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { trackProductInteraction } from '../../utils/analytics';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkFavorite();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
      setSelectedImage(0);
      trackProductInteraction(id, 'view');
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${id}/reviews`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await fetch('/api/user/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setIsFavorite(data.some(fav => fav.productId === id));
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const handleBuyNow = () => {
    trackProductInteraction(id, 'purchase');
    navigate(`/checkout/${id}`);
  };

  const addToCart = async () => {
    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          productId: id,
          quantity: 1,
        }),
      });
      trackProductInteraction(id, 'add_to_cart');
      setSnackbar({
        open: true,
        message: 'Added to cart successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add to cart',
        severity: 'error',
      });
    }
  };

  const toggleFavorite = async () => {
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      await fetch(`/api/user/favorites/${id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newReview),
      });
      
      if (response.ok) {
        setNewReview({ rating: 0, comment: '' });
        fetchReviews();
        setSnackbar({
          open: true,
          message: 'Review submitted successfully',
          severity: 'success',
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit review',
        severity: 'error',
      });
    }
  };

  if (!product) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              style={{ width: '100%', height: 'auto' }}
            />
            <ImageList sx={{ mt: 2 }} cols={4}>
              {product.images.map((image, index) => (
                <ImageListItem
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    style={{
                      border: selectedImage === index ? '2px solid #1976d2' : 'none',
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Paper>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              ${product.price}
            </Typography>
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={addToCart}
              >
                Add to Cart
              </Button>
              <IconButton
                onClick={toggleFavorite}
                color={isFavorite ? 'primary' : 'default'}
              >
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Box>
          </Paper>

          {/* Reviews Section */}
          <Paper sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Reviews
            </Typography>
            
            {/* Review Form */}
            <Box component="form" onSubmit={submitReview} sx={{ mb: 3 }}>
              <Rating
                value={newReview.rating}
                onChange={(e, value) => setNewReview({ ...newReview, rating: value })}
                size="large"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Write your review..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                sx={{ mt: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2 }}
                disabled={!newReview.rating || !newReview.comment}
              >
                Submit Review
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Reviews List */}
            {reviews.map((review) => (
              <Box key={review._id} sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center">
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    by {review.userName}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {review.comment}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 