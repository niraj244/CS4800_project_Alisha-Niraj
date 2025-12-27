import React, { useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import { Button } from "@mui/material";
import { FaAngleDown } from "react-icons/fa6";
import Badge from "../../components/Badge";
import { FaAngleUp } from "react-icons/fa6";
import { fetchDataFromApi } from "../../utils/api";
import Pagination from "@mui/material/Pagination";
import { formatPrice } from "../../utils/currency";
import { Link } from "react-router-dom";

const Orders = () => {
  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  const [page, setPage] = useState(1);

  const isShowOrderdProduct = (index) => {
    if (isOpenOrderdProduct === index) {
      setIsOpenOrderdProduct(null);
    } else {
      setIsOpenOrderdProduct(index);
    }

  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getTotalItems = (products) => {
    if (!products || !Array.isArray(products)) return 0;
    return products.reduce((total, product) => total + (product.quantity || 0), 0);
  };

  const getOrderStatusText = (status) => {
    const statusMap = {
      'delivered': 'Delivered',
      'confirm': 'Confirmed',
      'pending': 'Processing',
      'shipped': 'Shipped',
      'processing': 'Processing'
    };
    return statusMap[status?.toLowerCase()] || status || 'Processing';
  };


  useEffect(() => {
    fetchDataFromApi(`/api/order/order-list/orders?page=${page}&limit=5`).then((res) => {
      if (res?.error === false) {
        setOrders(res)
      }
    })
  }, [page])

  return (
    <section className="py-5 lg:py-10 w-full">
      <div className="container flex flex-col lg:flex-row gap-5">
        <div className="col1 w-[20%] hidden lg:block">
          <AccountSidebar />
        </div>

        <div className="col2 w-full lg:w-[80%]">
          <div className="shadow-md rounded-md bg-white">
            <div className="py-5 px-5 border-b border-[rgba(0,0,0,0.1)]">
              <h2>Your orders</h2>
              
              {/* Filter Tabs */}
              <div className="mt-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-md text-[14px] font-[500] transition-all ${
                      activeFilter === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All orders
                  </button>
                  <button
                    onClick={() => setActiveFilter('processing')}
                    className={`px-4 py-2 rounded-md text-[14px] font-[500] transition-all ${
                      activeFilter === 'processing'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => setActiveFilter('shipped')}
                    className={`px-4 py-2 rounded-md text-[14px] font-[500] transition-all ${
                      activeFilter === 'shipped'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Shipped
                  </button>
                  <button
                    onClick={() => setActiveFilter('delivered')}
                    className={`px-4 py-2 rounded-md text-[14px] font-[500] transition-all ${
                      activeFilter === 'delivered'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Delivered
                  </button>
                  <button
                    onClick={() => setActiveFilter('returns')}
                    className={`px-4 py-2 rounded-md text-[14px] font-[500] transition-all ${
                      activeFilter === 'returns'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Returns
                  </button>
                </div>
              </div>

              {activeFilter === 'all' && (
                <>
                  <p className="mt-0 mb-0">
                    There are <span className="font-bold text-primary">{ orders?.data?.length}</span>{" "}
                    orders
                  </p>

                  <div className="mt-5 space-y-4">
                    {orders?.data?.length === 0 ? (
                      <div className="py-10 text-center">
                        <p className="text-gray-500">No orders found.</p>
                      </div>
                    ) : (
                      orders?.data?.map((order, index) => {
                      const totalItems = getTotalItems(order?.products);
                      const firstProduct = order?.products?.[0];
                      const orderStatus = order?.order_status?.toLowerCase();
                      const isDelivered = orderStatus === 'delivered';
                      const isShipped = orderStatus === 'shipped';
                      const isProcessing = orderStatus === 'processing' || orderStatus === 'pending' || orderStatus === 'confirm';
                      
                      return (
                        <div key={order?._id || index} className="border border-gray-200 rounded-lg p-4 bg-white">
                          {/* Header with status and view details */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              {isDelivered && order?.updatedAt && (
                                <p className="text-[14px] text-gray-600 mb-1">
                                  {getOrderStatusText(order?.order_status)} on {formatDate(order?.updatedAt)}
                                </p>
                              )}
                              {isShipped && (
                                <p className="text-[14px] text-gray-600 mb-1">
                                  {getOrderStatusText(order?.order_status)}
                                </p>
                              )}
                              {isProcessing && (
                                <p className="text-[14px] text-gray-600 mb-1">
                                  {getOrderStatusText(order?.order_status)}
                                </p>
                              )}
                              {isDelivered && (
                                <Link to="#" className="text-[13px] text-primary hover:underline">
                                  View Delivery Photo &gt;
                                </Link>
                              )}
                            </div>
                            <Link to="#" className="text-[13px] text-primary hover:underline">
                              View order details &gt;
                            </Link>
                          </div>

                          {/* Product and Actions */}
                          <div className="flex gap-4 mb-4 items-start">
                            {/* Product Images Carousel */}
                            <div className="flex gap-2 overflow-x-auto flex-1">
                              {order?.products && order.products.length > 0 ? (
                                order.products.map((product, productIndex) => (
                                  <div key={productIndex} className="relative w-[120px] h-[120px] flex-shrink-0">
                                    {product?.image ? (
                                      <>
                                        <img 
                                          src={product.image} 
                                          alt={product.productTitle}
                                          className="w-full h-full object-cover rounded-md"
                                        />
                                        {product.quantity > 1 && (
                                          <div className="absolute top-0 right-0 bg-black bg-opacity-70 text-white text-[11px] px-1.5 py-0.5 rounded">
                                            x{product.quantity}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">No Image</span>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="w-[120px] h-[120px] bg-gray-200 rounded-md flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">No Products</span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 ml-auto">
                              <Button 
                                variant="contained" 
                                className="!bg-primary !text-white !normal-case !text-[13px] !py-1.5 !min-w-[140px] !w-[140px]"
                                onClick={() => {}}
                              >
                                Track
                              </Button>
                              <Button 
                                variant="outlined" 
                                className="!border-gray-300 !text-gray-700 !normal-case !text-[13px] !py-1.5 !min-w-[140px] !w-[140px]"
                                onClick={() => {}}
                              >
                                Leave a review
                              </Button>
                              <Button 
                                variant="outlined" 
                                className="!border-gray-300 !text-gray-700 !normal-case !text-[13px] !py-1.5 !min-w-[140px] !w-[140px]"
                                onClick={() => {}}
                              >
                                Return/Refund
                              </Button>
                              <Button 
                                variant="outlined" 
                                className="!border-gray-300 !text-gray-700 !normal-case !text-[13px] !py-1.5 !min-w-[140px] !w-[140px]"
                                onClick={() => {}}
                              >
                                Buy this again
                              </Button>
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <div className="flex flex-wrap gap-4 text-[13px] text-gray-600">
                              <span>
                                <span className="font-semibold">{totalItems} items:</span> {formatPrice(order?.totalAmt || 0)}
                              </span>
                              <span>
                                <span className="font-semibold">Order Time:</span> {formatDate(order?.createdAt)}
                              </span>
                              <span>
                                <span className="font-semibold">Order ID:</span> {order?._id}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                    )}
                  </div>

                  {
                    orders?.totalPages > 1 &&
                    <div className="flex items-center justify-center mt-10">
                      <Pagination
                        showFirstButton showLastButton
                        count={orders?.totalPages}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                      />
                    </div>
                  }

                  {/* Old table view - keeping for reference but hidden */}
                  <div className="hidden relative overflow-x-auto mt-5">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        &nbsp;
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Order Id
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Payment Id
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Phone Number
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Address
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Pincode
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Total Amount
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        User Id
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Order Status
                      </th>
                      <th scope="col" className="px-6 py-3 whitespace-nowrap">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>

                    {
                      orders?.data?.length !== 0 && orders?.data?.map((order, index) => {
                        return (
                          <>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                              <td className="px-6 py-4 font-[500]">
                                <Button
                                  className="!w-[35px] !h-[35px] !min-w-[35px] !rounded-full !bg-[#f1f1f1]"
                                  onClick={() => isShowOrderdProduct(index)}
                                >
                                  {
                                    isOpenOrderdProduct === index ? <FaAngleUp className="text-[16px] text-[rgba(0,0,0,0.7)]" /> : <FaAngleDown className="text-[16px] text-[rgba(0,0,0,0.7)]" />
                                  }

                                </Button>
                              </td>
                              <td className="px-6 py-4 font-[500]">
                                <span className="text-primary">
                                  {order?._id}
                                </span>
                              </td>

                              <td className="px-6 py-4 font-[500]">
                                <span className="text-primary whitespace-nowrap text-[13px]">{order?.paymentId ? order?.paymentId : 'CASH ON DELIVERY'}</span>
                              </td>

                              <td className="px-6 py-4 font-[500] whitespace-nowrap">
                                {order?.userId?.name}
                              </td>

                              <td className="px-6 py-4 font-[500]">{order?.delivery_address?.mobile}</td>

                              <td className="px-6 py-4 font-[500]">
                               <span className='inline-block text-[13px] font-[500] p-1 bg-[#f1f1f1] rounded-md'>{order?.delivery_address?.addressType}</span>
                                <span className="block w-[400px]">
                                  {order?.delivery_address?.
                                    address_line1 + " " +
                                    order?.delivery_address?.city + " " +
                                    order?.delivery_address?.landmark + " " +
                                    order?.delivery_address?.state + " " +
                                    order?.delivery_address?.country
                                  }
                                </span>
                              </td>

                              <td className="px-6 py-4 font-[500]">{order?.delivery_address?.pincode}</td>

                              <td className="px-6 py-4 font-[500]">{order?.totalAmt}</td>

                              <td className="px-6 py-4 font-[500]">
                                {order?.userId?.email}
                              </td>

                              <td className="px-6 py-4 font-[500]">
                                <span className="text-primary">
                                  {order?.userId?._id}
                                </span>
                              </td>

                              <td className="px-6 py-4 font-[500]">
                                <Badge status={order?.order_status} />
                              </td>
                              <td className="px-6 py-4 font-[500] whitespace-nowrap">
                                {order?.createdAt?.split("T")[0]}
                              </td>
                            </tr>

                            {isOpenOrderdProduct === index && (
                              <tr>
                                <td className="pl-20" colSpan="6">
                                  <div className="relative overflow-x-auto">
                                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                          <th
                                            scope="col"
                                            className="px-6 py-3 whitespace-nowrap"
                                          >
                                            Product Id
                                          </th>
                                          <th
                                            scope="col"
                                            className="px-6 py-3 whitespace-nowrap"
                                          >
                                            Product Title
                                          </th>
                                          <th
                                            scope="col"
                                            className="px-6 py-3 whitespace-nowrap"
                                          >
                                            Image
                                          </th>
                                          <th
                                            scope="col"
                                            className="px-6 py-3 whitespace-nowrap"
                                          >
                                            Quantity
                                          </th>
                                          <th
                                            scope="col"
                                            className="px-6 py-3 whitespace-nowrap"
                                          >
                                            Price
                                          </th>
                                          <th
                                            scope="col"
                                            className="px-6 py-3 whitespace-nowrap"
                                          >
                                            Sub Total
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {
                                          order?.products?.map((item, index) => {
                                            return (
                                              <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-6 py-4 font-[500]">
                                                  <span className="text-gray-600">
                                                    {item?._id}
                                                  </span>
                                                </td>
                                                <td className="px-6 py-4 font-[500]">
                                                  <div className="w-[200px]">
                                                    {item?.productTitle}
                                                  </div>
                                                </td>

                                                <td className="px-6 py-4 font-[500]">
                                                  <img
                                                    src={item?.image}
                                                    className="w-[40px] h-[40px] object-cover rounded-md"
                                                  />
                                                </td>

                                                <td className="px-6 py-4 font-[500] whitespace-nowrap">
                                                  {item?.quantity}
                                                </td>

                                                <td className="px-6 py-4 font-[500]">{formatPrice(item?.price)}</td>

                                                <td className="px-6 py-4 font-[500]">{formatPrice(item?.price * item?.quantity)}</td>
                                              </tr>
                                            )
                                          })
                                        }


                                        <tr>
                                          <td
                                            className="bg-[#f1f1f1]"
                                            colSpan="12"
                                          ></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })

                    }






                  </tbody>
                </table>
              </div>
                </>
              )}

              {/* Processing Tab - Empty for now */}
              {activeFilter === 'processing' && (
                <div className="py-10 text-center">
                  <p className="text-gray-500">No processing orders at the moment.</p>
                </div>
              )}

              {/* Shipped Tab - Empty for now */}
              {activeFilter === 'shipped' && (
                <div className="py-10 text-center">
                  <p className="text-gray-500">No shipped orders at the moment.</p>
                </div>
              )}

              {/* Delivered Tab - Empty for now */}
              {activeFilter === 'delivered' && (
                <div className="py-10 text-center">
                  <p className="text-gray-500">No delivered orders at the moment.</p>
                </div>
              )}

              {/* Returns Tab - Empty for now */}
              {activeFilter === 'returns' && (
                <div className="py-10 text-center">
                  <p className="text-gray-500">No returns at the moment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Orders;
