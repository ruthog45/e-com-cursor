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
  Button,
  Box,
  Chip,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

export default function ProductRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/admin/product-performance');
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const generateNewRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/generate-recommendations', {
        method: 'POST',
      });
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Product Recommendations
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={generateNewRecommendations}
          disabled={loading}
        >
          Generate New Recommendations
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Product Performance */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Recommendation Score</TableCell>
                  <TableCell>Target Segment</TableCell>
                  <TableCell>Conversion Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recommendations.map((rec) => (
                  <TableRow key={rec.productId}>
                    <TableCell>{rec.productName}</TableCell>
                    <TableCell>{rec.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${(rec.score * 100).toFixed(1)}%`}
                        color={rec.score > 0.7 ? 'success' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {rec.targetSegments.map((segment) => (
                        <Chip
                          key={segment}
                          label={segment}
                          size="small"
                          sx={{ mr: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>{(rec.conversionRate * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
} 