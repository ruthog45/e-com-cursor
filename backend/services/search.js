const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: process.env.ELASTICSEARCH_URL });

// Initialize Elasticsearch indices
const initializeElasticsearch = async () => {
  try {
    await client.indices.create({
      index: 'products',
      body: {
        mappings: {
          properties: {
            name: { type: 'text' },
            description: { type: 'text' },
            category: { type: 'keyword' },
            price: { type: 'float' },
            tags: { type: 'keyword' },
            createdAt: { type: 'date' }
          }
        }
      }
    });
  } catch (error) {
    if (error.message !== 'resource_already_exists_exception') {
      throw error;
    }
  }
};

// Index a product
const indexProduct = async (product) => {
  await client.index({
    index: 'products',
    id: product._id.toString(),
    body: {
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      tags: product.tags,
      createdAt: product.createdAt
    }
  });
};

// Advanced search with filters and aggregations
const searchProducts = async (query, filters = {}, page = 1, limit = 20) => {
  const must = [
    query ? {
      multi_match: {
        query,
        fields: ['name^2', 'description', 'tags'],
        fuzziness: 'AUTO'
      }
    } : { match_all: {} }
  ];

  // Add filters
  if (filters.category) {
    must.push({ term: { category: filters.category } });
  }
  if (filters.minPrice || filters.maxPrice) {
    must.push({
      range: {
        price: {
          gte: filters.minPrice,
          lte: filters.maxPrice
        }
      }
    });
  }

  const response = await client.search({
    index: 'products',
    body: {
      from: (page - 1) * limit,
      size: limit,
      query: {
        bool: { must }
      },
      aggs: {
        categories: {
          terms: { field: 'category' }
        },
        price_ranges: {
          range: {
            field: 'price',
            ranges: [
              { to: 50 },
              { from: 50, to: 100 },
              { from: 100, to: 200 },
              { from: 200 }
            ]
          }
        }
      },
      highlight: {
        fields: {
          name: {},
          description: {}
        }
      }
    }
  });

  return {
    hits: response.hits.hits.map(hit => ({
      ...hit._source,
      id: hit._id,
      score: hit._score,
      highlights: hit.highlight
    })),
    total: response.hits.total.value,
    aggregations: response.aggregations
  };
};

// Suggest products based on partial input
const suggestProducts = async (prefix) => {
  const response = await client.search({
    index: 'products',
    body: {
      suggest: {
        products: {
          prefix,
          completion: {
            field: 'name',
            fuzzy: {
              fuzziness: 2
            }
          }
        }
      }
    }
  });

  return response.suggest.products[0].options;
};

module.exports = {
  initializeElasticsearch,
  indexProduct,
  searchProducts,
  suggestProducts
}; 