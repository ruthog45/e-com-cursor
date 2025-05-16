import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { trackSearch, trackProductInteraction } from '../../utils/analytics';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchFavorites();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/user/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setFavorites(data.map(fav => fav.productId));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/products/search?q=${searchTerm}`);
      const data = await response.json();
      setProducts(data);
      trackSearch(searchTerm, data.length);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleCategoryClick = async (categoryId) => {
    try {
      const response = await fetch(`/api/products/category/${categoryId}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching category products:', error);
    }
  };

  const handleProductClick = (productId) => {
    trackProductInteraction(productId, 'view');
    navigate(`/product/${productId}`);
  };

  const toggleFavorite = async (productId) => {
    try {
      const method = favorites.includes(productId) ? 'DELETE' : 'POST';
      await fetch(`/api/user/favorites/${productId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (method === 'POST') {
        setFavorites([...favorites, productId]);
      } else {
        setFavorites(favorites.filter(id => id !== productId));
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });
      trackProductInteraction(productId, 'add_to_cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Categories */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Categories
        </Typography>
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item key={category._id}>
              <Chip
                label={category.name}
                onClick={() => handleCategoryClick(category._id)}
                clickable
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={product.images[0]}
                alt={product.name}
                onClick={() => handleProductClick(product._id)}
                sx={{ cursor: 'pointer' }}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${product.price}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCart />}
                    onClick={() => addToCart(product._id)}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    onClick={() => toggleFavorite(product._id)}
                    color={favorites.includes(product._id) ? 'primary' : 'default'}
                  >
                    {favorites.includes(product._id) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 