import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const CustomerProfiling = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [behavior, setBehavior] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axios.get('/api/users');
        setCustomers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchCustomerBehavior = async () => {
      if (selectedCustomer) {
        try {
          const { data } = await axios.get(`/api/admin/customer-behavior?userId=${selectedCustomer._id}`);
          setBehavior(data);
        } catch (error) {
          console.error('Error fetching customer behavior:', error);
        }
      }
    };

    fetchCustomerBehavior();
  }, [selectedCustomer]);

  const generateRecommendations = async () => {
    if (selectedCustomer) {
      try {
        await axios.post('/api/admin/generate-recommendations', {
          userId: selectedCustomer._id,
        });
        // Refresh customer behavior data
        const { data } = await axios.get(`/api/admin/customer-behavior?userId=${selectedCustomer._id}`);
        setBehavior(data);
      } catch (error) {
        console.error('Error generating recommendations:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const pageViewData = {
    labels: behavior?.behavior[0]?.pageViews.map((view) =>
      new Date(view.timestamp).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'Page Views',
        data: behavior?.behavior[0]?.pageViews.map(() => 1) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const productInteractionData = {
    labels: ['View', 'Add to Cart', 'Purchase', 'Wishlist'],
    datasets: [
      {
        data: [
          behavior?.behavior[0]?.productInteractions.filter((i) => i.action === 'view').length || 0,
          behavior?.behavior[0]?.productInteractions.filter((i) => i.action === 'add_to_cart').length || 0,
          behavior?.behavior[0]?.productInteractions.filter((i) => i.action === 'purchase').length || 0,
          behavior?.behavior[0]?.productInteractions.filter((i) => i.action === 'add_to_wishlist').length || 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Customer Profiling</h1>

      {/* Customer Selection */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Select Customer</h3>
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => setSelectedCustomer(customers[e.target.value])}
        >
          <option value="">Select a customer...</option>
          {customers.map((customer, index) => (
            <option key={customer._id} value={index}>
              {customer.name} ({customer.email})
            </option>
          ))}
        </select>
      </div>

      {selectedCustomer && behavior && (
        <>
          {/* Customer Overview */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Customer Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-gray-600">Name</h4>
                <p className="text-xl font-semibold">{selectedCustomer.name}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-600">Email</h4>
                <p className="text-xl font-semibold">{selectedCustomer.email}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-600">Segment</h4>
                <p className="text-xl font-semibold">{behavior.behavior[0]?.customerSegment}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-600">Session Count</h4>
                <p className="text-xl font-semibold">{behavior.sessionAnalytics[0]?.totalSessions}</p>
              </div>
            </div>
          </div>

          {/* Behavior Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Page View Activity</h3>
              <Line data={pageViewData} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Product Interactions</h3>
              <Pie data={productInteractionData} />
            </div>
          </div>

          {/* Search History */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">Search History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left">Search Query</th>
                    <th className="px-6 py-3 text-left">Results</th>
                    <th className="px-6 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {behavior.behavior[0]?.searchBehavior.map((search, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-6 py-4">{search.query}</td>
                      <td className="px-6 py-4">{search.resultCount}</td>
                      <td className="px-6 py-4">
                        {new Date(search.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
              <button
                onClick={generateRecommendations}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Generate Recommendations
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {behavior.behavior[0]?.recommendations?.personalizedProducts.map((product, index) => (
                <div key={index} className="border p-4 rounded">
                  <h4 className="font-semibold">{product.productId.name}</h4>
                  <p className="text-gray-600">Score: {product.score}</p>
                  <p className="text-sm text-gray-500">{product.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerProfiling; 