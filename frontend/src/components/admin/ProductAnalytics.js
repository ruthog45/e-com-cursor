import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ProductAnalytics = () => {
  const [performance, setPerformance] = useState(null);
  const [timeframe, setTimeframe] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductPerformance = async () => {
      try {
        const { data } = await axios.get(`/api/admin/product-performance?timeframe=${timeframe}`);
        setPerformance(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product performance:', error);
        setLoading(false);
      }
    };

    fetchProductPerformance();
  }, [timeframe]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const categoryData = {
    labels: performance?.categoryPerformance.map((cat) => cat._id) || [],
    datasets: [
      {
        label: 'Total Views',
        data: performance?.categoryPerformance.map((cat) => cat.totalViews) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Total Purchases',
        data: performance?.categoryPerformance.map((cat) => cat.totalPurchases) || [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const brandData = {
    labels: performance?.brandPerformance.map((brand) => brand._id) || [],
    datasets: [
      {
        data: performance?.brandPerformance.map((brand) => brand.totalProducts) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  const conversionData = {
    labels: performance?.productMetrics.map((product) => product.name) || [],
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data:
          performance?.productMetrics.map(
            (product) => (product.analytics.conversionRate * 100).toFixed(2)
          ) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Analytics</h1>
        <select
          className="p-2 border rounded"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="180">Last 180 days</option>
        </select>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            {performance?.productMetrics
              .sort((a, b) => b.analytics.purchases - a.analytics.purchases)
              .slice(0, 5)
              .map((product) => (
                <div key={product._id} className="flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-gray-600">{product.analytics.purchases} sales</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Most Viewed Products</h3>
          <div className="space-y-4">
            {performance?.productMetrics
              .sort((a, b) => b.analytics.views - a.analytics.views)
              .slice(0, 5)
              .map((product) => (
                <div key={product._id} className="flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-gray-600">{product.analytics.views} views</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Best Conversion Rates</h3>
          <div className="space-y-4">
            {performance?.productMetrics
              .sort((a, b) => b.analytics.conversionRate - a.analytics.conversionRate)
              .slice(0, 5)
              .map((product) => (
                <div key={product._id} className="flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-gray-600">
                    {(product.analytics.conversionRate * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
          <Bar data={categoryData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Brand Distribution</h3>
          <Pie data={brandData} />
        </div>
      </div>

      {/* Conversion Rates */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Product Conversion Rates</h3>
        <Line data={conversionData} />
      </div>

      {/* Detailed Product Metrics */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Product Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Views</th>
                <th className="px-6 py-3 text-left">Cart Adds</th>
                <th className="px-6 py-3 text-left">Purchases</th>
                <th className="px-6 py-3 text-left">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {performance?.productMetrics.map((product) => (
                <tr key={product._id} className="border-b">
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">{product.analytics.views}</td>
                  <td className="px-6 py-4">{product.analytics.cartAdds}</td>
                  <td className="px-6 py-4">{product.analytics.purchases}</td>
                  <td className="px-6 py-4">
                    {(product.analytics.conversionRate * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalytics; 