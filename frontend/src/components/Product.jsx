import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from '../slices/wishListApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';

const Product = ({ product }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const { data: wishlist } = useGetWishlistQuery(undefined, {
    skip: !userInfo,
  });

  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const [isWished, setIsWished] = useState(false);
  const [qty, setQty] = useState(1);

  // Sync state with wishlist on load
  useEffect(() => {
    if (wishlist && Array.isArray(wishlist)) {
      const found = wishlist.find((item) => item._id === product._id);
      setIsWished(!!found);
    }
  }, [wishlist, product._id]);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.error('Please login to manage your wishlist.');
      return;
    }

    // optimistic UI
    const previousState = isWished;
    setIsWished(!isWished);

    // ✅ show toast instantly
    if (!isWished) {
      toast.success(`${product.name} added to wishlist`);
    } else {
      toast.info(`${product.name} removed from wishlist`);
    }

    try {
      if (isWished) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      // rollback UI
      setIsWished(previousState);
      toast.error('Something went wrong updating wishlist.');
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty }));
    toast.success(`${product.name} added to cart!`);
  };

  const increaseQty = () => setQty((prev) => prev + 1);
  const decreaseQty = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:scale-110 transition-transform z-10"
      >
        {isWished ? (
          <FaHeart className="text-red-500 w-5 h-5" />
        ) : (
          <FaRegHeart className="text-gray-500 w-5 h-5 hover:text-red-400" />
        )}
      </button>

      {/* Product Image */}
      <Link to={`/product/${product._id}`}>
        <div className="w-full sm:w-full sm:h-[300px] h-[200px] bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="px-1 py-2 flex flex-col space-y-3">
        <Link to={`/product/${product._id}`}>
          <h2 className="text-gray-800 font-semibold sm:text-lg text-xs leading-tight hover:text-blue-600">
            {product.name}
          </h2>
        </Link>

        <Rating value={product.rating} text={`${product.numReviews} reviews`} />

        <p className="text-gray-900 font-bold text-sm sm:text-xl">${product.price}</p>

        {/* Quantity & Add to Cart */}
        <div className="flex items-center space-x-1 mt-2">
          <div className="border rounded-md flex items-center">
            <button
              onClick={decreaseQty}
              className="px-1 py-0 sm:px-2 sm:py-2 lg:px-5 lg:py-1 text-sm sm:text-base lg:text-lg font-bold hover:bg-gray-300"
            >
              −
            </button>

            <span className="px-1 py-0.5 sm:px-3 sm:py-2 lg:px-5 lg:py-1 text-sm sm:text-base lg:text-lg">
              {qty}
            </span>

            <button
              onClick={increaseQty}
              className="px-1 py-0 sm:px-2 sm:py-2 lg:px-5 lg:py-1 text-sm sm:text-base lg:text-lg font-bold hover:bg-gray-300"
            >
              +
            </button>
          </div>
  <button
    onClick={handleAddToCart}
    className="ml-4 sm:ml-auto text-black text-[10px] sm:text-sm px-2 py-1 transition slide-underline"
  >
    Add to Cart
  </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
