"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

type CartItem = {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  product: {
    name: string;
    price: string;
    images: string[];
  };
};

const supabase = createClient();

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setUserId(null);
      } else {
        setUserId(data.user.id);
      }
      setCheckingUser(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (userId) fetchCart();
  }, [userId]);

  const fetchCart = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("cart")
      .select("*, product:product_id (name, price, images)")
      .eq("user_id", userId);

    if (error) {
      toast.error("Error loading cart!");
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  const handleRemoveItem = async (id: string) => {
    const { error } = await supabase.from("cart").delete().eq("id", id);
    if (error) {
      toast.error("Error removing item!");
    } else {
      toast.success("Item removed successfully!");
      setCartItems(cartItems.filter((item) => item.id !== id));
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) return handleRemoveItem(id);
    const item = cartItems.find((item) => item.id === id);
    if (!item) return;

    const newTotalPrice = parseFloat(item.product.price) * newQuantity;
    const { error } = await supabase
      .from("cart")
      .update({ quantity: newQuantity, total_price: newTotalPrice })
      .eq("id", id);

    if (error) {
      toast.error("Error updating quantity!");
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id
            ? { ...item, quantity: newQuantity, total_price: newTotalPrice }
            : item
        )
      );
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.total_price, 0);

  if (checkingUser) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-10 flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">
            Shopping Cart 🛒
          </h1>
          <p className="text-center text-gray-700 text-lg font-semibold">
            Please register or log in!
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl  font-bold mb-10 text-center text-gray-800">
          Shopping Cart 🛒
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : cartItems.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">Cart is empty 🫙</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center border p-5 rounded-xl shadow-lg bg-white hover:shadow-2xl transition-all"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-36 h-36 object-cover rounded-lg"
                />
                <h2 className="text-lg font-semibold mt-2 text-gray-800">
                  {item.product.name}
                </h2>
                <p className="text-gray-600 text-sm">${item.product.price}</p>
                <div className="flex items-center mt-3 space-x-3 bg-gray-100 px-3 py-2 rounded-lg">
                  <button
                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity - 1)
                    }
                  >
                    <FaMinus className="text-gray-700" />
                  </button>
                  <span className="text-lg font-semibold text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    <FaPlus className="text-gray-700" />
                  </button>
                </div>
                <p className="text-lg font-bold mt-2 text-gray-900">
                  ${item.total_price.toFixed(2)}
                </p>
                <button
                  className="border-red-700 flex items-center gap-2 mx-auto border-2 text-red-700 hover:text-red-500 hover:border-red-500 transition-all py-2 px-3 rounded mt-4"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <FaTrash />
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-2xl font-bold text-gray-900">
              Total price:{" "}
              <span className="text-green-600">${totalPrice.toFixed(2)}</span>
            </p>
            <button className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md">
              Buy Now
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
