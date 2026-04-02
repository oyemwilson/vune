import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
  const { id: productId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success('Review created successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Link className='inline-block bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md my-3' to='/'>
        Go Back
      </Link>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta title={product.name} description={product.description} />
          <div className="flex flex-wrap -mx-4">
            <div className="w-full md:w-1/2 px-4 mb-6 md:mb-0">
              <img src={product.image} alt={product.name} className="w-full rounded-lg shadow-md" />
            </div>
            <div className="w-full md:w-1/4 px-4 mb-6 md:mb-0">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                <div className="mb-4">
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} reviews`}
                  />
                </div>
                <div className="text-xl font-semibold mb-2">Price: ${product.price}</div>
                <div className="text-gray-700">
                  Description: {product.description}
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/4 px-4">
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Price:</span>
                  <span className="font-bold text-lg">${product.price}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Status:</span>
                  <span>
                    {product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}
                  </span>
                </div>

                {/* Qty Select */}
                {product.countInStock > 0 && (
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Qty</span>
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="block w-1/2 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[...Array(product.countInStock).keys()].map(
                        (x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}

                <button
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type='button'
                  disabled={product.countInStock === 0}
                  onClick={addToCartHandler}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap -mx-4 mt-8">
            <div className="w-full md:w-1/2 px-4">
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>
              {product.reviews.length === 0 && <Message>No Reviews</Message>}
              <div className="bg-white shadow-md rounded-lg p-6">
                {product.reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                    <strong className="block text-lg font-semibold">{review.name}</strong>
                    <Rating value={review.rating} />
                    <p className="text-gray-500 text-sm">{review.createdAt.substring(0, 10)}</p>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                  </div>
                ))}
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-4">Write a Customer Review</h2>

                  {loadingProductReview && <Loader />}

                  {userInfo ? (
                    <form onSubmit={submitHandler}>
                      <div className='my-2'>
                        <label htmlFor='rating' className="block text-gray-700 text-sm font-bold mb-2">Rating</label>
                        <select
                          id='rating'
                          required
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value=''>Select...</option>
                          <option value='1'>1 - Poor</option>
                          <option value='2'>2 - Fair</option>
                          <option value='3'>3 - Good</option>
                          <option value='4'>4 - Very Good</option>
                          <option value='5'>5 - Excellent</option>
                        </select>
                      </div>
                      <div className='my-2'>
                        <label htmlFor='comment' className="block text-gray-700 text-sm font-bold mb-2">Comment</label>
                        <textarea
                          id='comment'
                          rows='3'
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                      </div>
                      <button
                        disabled={loadingProductReview}
                        type='submit'
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                      >
                        Submit
                      </button>
                    </form>
                  ) : (
                    <Message>
                      Please <Link to='/login' className="text-blue-500 hover:underline">sign in</Link> to write a review
                    </Message>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductScreen;
