// Track page views
export const trackPageView = async (page) => {
  try {
    await fetch('/api/admin/track/pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: localStorage.getItem('userId'), // Assuming you store userId in localStorage
        page,
        timestamp: new Date(),
      }),
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Track product interactions
export const trackProductInteraction = async (productId, action) => {
  try {
    await fetch(`/api/admin/track/product/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: localStorage.getItem('userId'),
        productId,
        action, // 'view', 'add_to_cart', or 'purchase'
        timestamp: new Date(),
      }),
    });
  } catch (error) {
    console.error('Error tracking product interaction:', error);
  }
};

// Track search behavior
export const trackSearch = async (searchTerm, resultCount) => {
  try {
    await fetch('/api/admin/track/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: localStorage.getItem('userId'),
        searchTerm,
        resultCount,
        timestamp: new Date(),
      }),
    });
  } catch (error) {
    console.error('Error tracking search:', error);
  }
}; 