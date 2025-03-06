"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";

const supabase = createClient();

type Order = {
  id: string;
  phone: string;
  address: string;
  total_price: number;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  product_image: string;
  price: number;
};

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        setLoading(false);
        return;
      }

      const session = data?.session;
      if (!session?.user) {
        router.push("/login");
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
      } else {
        setOrders(ordersData || []);
        ordersData.forEach((order) => fetchOrderItems(order.id));
      }
      setLoading(false);
    };

    const fetchOrderItems = async (orderId: string) => {
      const { data, error } = await supabase
        .from("order_items")
        .select("id, product_id, quantity, total_price")
        .eq("order_id", orderId);

      if (error) {
        console.error(
          `Error fetching order items for order ${orderId}:`,
          error.message || error
        );
        return;
      }

      const itemsWithNames = await Promise.all(
        data.map(async (item) => {
          const { data: productData, error: productError }: any = await supabase
            .from("product")
            .select("name, images")
            .eq("id", item.product_id)
            .single();

          if (productError) {
            console.error(
              `Error fetching product ${item.product_id}:`,
              productError.message || productError
            );
          }

          return {
            id: item.id,
            product_id: item.product_id,
            product_name: productData?.name || "Unknown Product",
            quantity: item.quantity,
            price: item.total_price,
            product_image:
              productData?.images?.length > 0
                ? productData.images[0]
                : "/placeholder.png",
          };
        })
      );

      setOrderItems((prev) => ({
        ...prev,
        [orderId]: itemsWithNames,
      }));
    };

    fetchOrders();
  }, [router]);

  const deleteOrder = async (orderId: string) => {
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      console.error(
        `Error deleting order items for order ${orderId}:`,
        itemsError.message || itemsError
      );
      return;
    }

    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      console.error(
        `Error deleting order ${orderId}:`,
        orderError.message || orderError
      );
      return;
    }

    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId)
    );
    setOrderItems((prevItems) => {
      const updatedItems = { ...prevItems };
      delete updatedItems[orderId];
      return updatedItems;
    });

    console.log(`Order ${orderId} successfully deleted.`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-grow p-6">
        <h1 className="text-3xl font-semibold text-center mb-8 text-green-700">
          My Orders
        </h1>

        {loading ? (
          <div className="text-center text-lg font-medium">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-lg text-gray-500">
            You have no orders yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md rounded-lg p-6 border border-green-500"
              >
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Phone:</span> {order.phone}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Address:</span> {order.address}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Total Price:</span> $
                  {order.total_price}
                </p>
                <p className="text-gray-500 text-sm">
                  Ordered on: {new Date(order.created_at).toLocaleDateString()}
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mt-4 border-b pb-2">
                  Order Items:
                </h3>
                <div className="mt-3 space-y-4">
                  {orderItems[order.id]?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center bg-white p-4 rounded-lg shadow-md border"
                    >
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border">
                        <img
                          src={item.product_image}
                          alt={item.product_name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="ml-4 flex-grow">
                        <p className="font-semibold text-gray-900">
                          {item.product_name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="text-green-600 font-medium text-lg">
                        ${item.price}
                      </p>
                    </div>
                  ))}
                </div>{" "}
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="border-red-700 flex items-center border-2 text-red-700 hover:text-red-500 hover:border-red-500 transition-all py-2 px-3 gap-1 mx-auto rounded mt-4"
                >
                  <FaTrash />
                  Delete Order
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyOrders;
