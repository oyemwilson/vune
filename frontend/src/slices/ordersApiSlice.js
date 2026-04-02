import { apiSlice } from './apiSlice';
import { ORDERS_URL, PAYPAL_URL } from '../constants';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Create a new order
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: order,
      }),
    }),

    // ✅ Get single order details
    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),

    // ✅ Pay for order
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
    }),

    // ✅ Get PayPal client ID
    getPaypalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL,
      }),
      keepUnusedDataFor: 5,
    }),

    // ✅ Get logged-in user's orders
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/myorders`,
      }),
      keepUnusedDataFor: 5,
    }),

    // ✅ Get all orders (admin)
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      keepUnusedDataFor: 5,
    }),

    // ✅ Mark order as delivered (admin)
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
    }),

    // ✅ Update order status (admin)
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `${ORDERS_URL}/${orderId}/status`,
        method: 'PUT',
        body: { status },
      }),
    }),

    // ✅ Cancel order (user or admin)
    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/cancel`,
        method: 'PUT',
      }),
    }),

    // ✅ Get order statistics (admin)
    getOrderStats: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/stats`,
      }),
      keepUnusedDataFor: 5,
    }),

    // ✅ Get recent orders (admin)
    getRecentOrders: builder.query({
      query: ({ limit = 10 } = {}) => ({
        url: `${ORDERS_URL}/recent?limit=${limit}`,
      }),
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useGetOrderStatsQuery,
  useGetRecentOrdersQuery,
} = orderApiSlice;
