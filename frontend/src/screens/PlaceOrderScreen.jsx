import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { PaystackButton } from 'react-paystack'; // ✅ Paystack React SDK
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';
import { useGetPaystackPublicKeyQuery } from '../slices/configApiSlice';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  // ✅ Place order after payment success
  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Error placing order');
    }
  };

  // ✅ Paystack setup
// at top of PlaceOrderScreen


const { data: paystackPublicKey, isLoading: isPaystackLoading } = useGetPaystackPublicKeyQuery();

const componentProps = {
  email: cart.shippingAddress?.email || 'test@example.com', // ✅ valid email
  amount: cart.totalPrice * 100, // in kobo
  publicKey: paystackPublicKey?.publicKey,
  text: 'Pay with Paystack',
  onSuccess: (reference) => {
    console.log('✅ Payment Success:', reference);
    toast.success('Payment successful!');
    placeOrderHandler();
  },
  onClose: () => {
    console.log('❌ Payment modal closed');
    toast.info('Payment dialog closed');
  },
};


  return (
    <div className="container mx-auto px-4 py-6">
      <CheckoutSteps step1 step2 step3 step4 />
      <div className="flex flex-wrap -mx-4">
        <div className="w-full md:w-2/3 px-4 mb-6 md:mb-0">
          {/* Shipping */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Shipping</h2>
            <p>
              <strong>Address:</strong> {cart.shippingAddress.address},{' '}
              {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{' '}
              {cart.shippingAddress.country}
            </p>
          </div>

          {/* Payment Method */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
            <p>
              <strong>Method: </strong>
              {cart.paymentMethod}
            </p>
          </div>

          {/* Order Items */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Order Items</h2>
            {cart.cartItems.length === 0 ? (
              <Message>Your cart is empty</Message>
            ) : (
              <div className="space-y-4">
                {cart.cartItems.map((item) => (
                  <div key={item._id} className="flex items-center">
                    <div className="w-16 h-16 mr-4 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <Link
                        to={`/product/${item.product}`}
                        className="text-blue-500 hover:underline"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <div className="text-gray-700">
                      {item.qty} x ₦{item.price} = ₦
                      {(item.qty * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-1/3 px-4">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Items</span>
                <span>₦{cart.itemsPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₦{cart.shippingPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₦{cart.taxPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₦{cart.totalPrice}</span>
              </div>
            </div>

            {error && <Message variant="danger">{error.data?.message}</Message>}

            {isPaystackLoading && <Loader />}

            {/* ✅ Paystack Payment Button */}
            <PaystackButton
              {...componentProps}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
              disabled={cart.cartItems.length === 0}
            />

            {/* Optional fallback */}
            <button
              type="button"
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
              disabled={cart.cartItems.length === 0}
              onClick={placeOrderHandler}
            >
              Place Order Without Payment
            </button>

            {isLoading && <Loader />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;
