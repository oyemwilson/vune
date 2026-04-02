import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  // NOTE: checking for valid ObjectId to prevent CastError moved to separate
  // middleware. See README for more info.

  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  } else {
    // NOTE: this will run if a valid ObjectId but no product was found
    // i.e. product may be null
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 12;
  const page = Number(req.query.pageNumber) || 1;
  const { category } = req.params;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const filter = {
    category: { $regex: category, $options: 'i' },
    ...keyword,
  };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ 
    products, 
    page, 
    pages: Math.ceil(count / pageSize),
    category 
  });
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  
  // Get category counts
  const categoryStats = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json(categoryStats.map(stat => ({
    name: stat._id,
    count: stat.count
  })));
});

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  
  // Get brand counts
  const brandStats = await Product.aggregate([
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json(brandStats.map(stat => ({
    name: stat._id,
    count: stat.count
  })));
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  
  const products = await Product.find({ isFeatured: true })
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json(products);
});

// @desc    Get sale products
// @route   GET /api/products/sale
// @access  Public
const getSaleProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 12;
  const page = Number(req.query.pageNumber) || 1;

  const filter = {
    $or: [
      { salePrice: { $exists: true, $ne: null } },
      { discount: { $gt: 0 } }
    ]
  };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ discount: -1, salePrice: 1 });

  res.json({ 
    products, 
    page, 
    pages: Math.ceil(count / pageSize) 
  });
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
const getNewArrivals = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const daysAgo = Number(req.query.days) || 30;
  
  const dateThreshold = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  
  const products = await Product.find({
    createdAt: { $gte: dateThreshold }
  })
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json(products);
});

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
const getBestSellers = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;
  
  const products = await Product.find({})
    .sort({ numReviews: -1, rating: -1 })
    .limit(limit);

  res.json(products);
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
});

// @desc    Get recommended products
// @route   GET /api/products/recommended/:id
// @access  Public
const getRecommendedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const limit = Number(req.query.limit) || 4;
  
  // Find products in same category, excluding current product
  const recommendedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
  })
    .sort({ rating: -1, numReviews: -1 })
    .limit(limit);

  // If not enough products in same category, fill with top-rated products
  if (recommendedProducts.length < limit) {
    const additional = await Product.find({
      _id: { 
        $nin: [product._id, ...recommendedProducts.map(p => p._id)] 
      }
    })
      .sort({ rating: -1 })
      .limit(limit - recommendedProducts.length);
    
    recommendedProducts.push(...additional);
  }

  res.json(recommendedProducts);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Toggle featured status of a product
// @route   PUT /api/products/:id/featured
// @access  Private/Admin
const toggleFeaturedProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();
    
    res.json({
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      product: updatedProduct
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private/Admin
const getProductStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const inStockProducts = await Product.countDocuments({ countInStock: { $gt: 0 } });
  const outOfStockProducts = await Product.countDocuments({ countInStock: { $lte: 0 } });
  const featuredProducts = await Product.countDocuments({ isFeatured: true });

  // Get average rating
  const ratingStats = await Product.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  const averageRating = ratingStats.length > 0 ? ratingStats[0].avgRating : 0;

  // Get category distribution
  const categoryStats = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get brand distribution
  const brandStats = await Product.aggregate([
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get price range stats
  const priceStats = await Product.aggregate([
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);

  // Get recent products (last 30 days)
  const recentProducts = await Product.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  res.json({
    totalProducts,
    inStockProducts,
    outOfStockProducts,
    featuredProducts,
    recentProducts,
    averageRating: averageRating || 0,
    priceRange: priceStats.length > 0 ? priceStats[0] : { minPrice: 0, maxPrice: 0, avgPrice: 0 },
    categoryDistribution: categoryStats,
    brandDistribution: brandStats
  });
});
// @desc    Get products by brand
// @route   GET /api/products/brand/:brand
// @access  Public
const getProductsByBrand = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 12;
  const page = Number(req.query.pageNumber) || 1;
  const { brand } = req.params;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const filter = {
    brand: { $regex: brand, $options: 'i' },
    ...keyword,
  };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    brand,
  });
});
const searchProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i', // case-insensitive
        },
      }
    : {};

  const products = await Product.find(keyword).select('name image price');

  res.json(products);
});


export {
  getProducts,
  getProductById,
  getProductsByCategory,
  getCategories,
  getProductsByBrand,
  getBrands,
  getFeaturedProducts,
  getSaleProducts,
  getNewArrivals,
  getBestSellers,
  getTopProducts,
  getRecommendedProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  toggleFeaturedProduct,
  createProductReview,
  getProductStats,
  searchProducts,
};