import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { PaystackButton } from 'react-paystack'; // ✅ Paystack SDK
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
} from '../slices/ordersApiSlice';
import { useGetPaystackPublicKeyQuery } from '../slices/configApiSlice'; // ✅ get your public key

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();

  const { userInfo } = useSelector((state) => state.auth);

  // ✅ Fetch your Paystack public key from backend
  const { data: paystackPublicKey, isLoading: loadingPaystackKey } = useGetPaystackPublicKeyQuery();

  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success('Order marked as delivered');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  // ✅ Paystack configuration
  const componentProps = {
    email: order?.user?.email || 'test@example.com', // required
    amount: order?.totalPrice ? order.totalPrice * 100 : 0, // Paystack expects kobo
    publicKey: paystackPublicKey?.publicKey || '', // your public key
    text: 'Pay with Paystack',
    onSuccess: async (ref) => {
      toast.success('Payment successful!');
      try {
        // call your backend to update order as paid
        await payOrder({
          orderId,
          paymentGateway: 'paystack',
          reference: ref.reference,
          status: ref.status,
          email: order?.user?.email,
        });
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    },
    onClose: () => {
      toast.info('Payment window closed');
    },
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error.data?.message || error.error}</Message>
  ) : (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Order {order._id}</h1>
      <div className="flex flex-wrap -mx-4">
        {/* LEFT COLUMN */}
        <div className="w-full md:w-2/3 px-4 mb-6 md:mb-0">
          {/* Shipping Info */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Shipping</h2>
            <p><strong>Name: </strong>{order.user.name}</p>
            <p>
              <strong>Email: </strong>
              <a href={`mailto:${order.user.email}`} className="text-blue-500 hover:underline">
                {order.user.email}
              </a>
            </p>
            <p className="mb-4">
              <strong>Address: </strong>
              {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            {order.isDelivered ? (
              <Message variant="success">Delivered on {order.deliveredAt}</Message>
            ) : (
              <Message variant="danger">Not Delivered</Message>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
            <p><strong>Method: </strong>{order.paymentMethod}</p>
            {order.isPaid ? (
              <Message variant="success">Paid on {order.paidAt}</Message>
            ) : (
              <Message variant="danger">Not Paid</Message>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Order Items</h2>
            {order.orderItems.length === 0 ? (
              <Message>Order is empty</Message>
            ) : (
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-16 h-16 mr-4 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <Link to={`/product/${item.product}`} className="text-blue-500 hover:underline">
                        {item.name}
                      </Link>
                    </div>
                    <div className="text-gray-700">
                      {item.qty} x ₦{item.price} = ₦{(item.qty * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full md:w-1/3 px-4">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between"><span>Items</span><span>₦{order.itemsPrice}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₦{order.shippingPrice}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>₦{order.taxPrice}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₦{order.totalPrice}</span></div>
            </div>

            {loadingPay && <Loader />}
            {loadingPaystackKey && <Loader />}

            {/* Show Paystack button only if not paid */}
            {!order.isPaid && (
              <PaystackButton
                {...componentProps}
                className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
              />
            )}

            {loadingDeliver && <Loader />}
            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
              <button
                type="button"
                className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
                onClick={deliverHandler}
              >
                Mark As Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
