"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import SidebarAdmin from "@/components/SidebarAdmin";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaLayerGroup,
} from "react-icons/fa";

const supabase = createClient();

export default function Dashboard() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const cachedStats = localStorage.getItem("stats");
      if (cachedStats) {
        setStats(JSON.parse(cachedStats));
        setLoading(false);
        return;
      }

      try {
        const [categories, products, users, orders] = await Promise.all([
          supabase
            .from("category")
            .select("id", { count: "exact", head: true }),
          supabase.from("product").select("id", { count: "exact", head: true }),
          supabase.from("user").select("id", { count: "exact", head: true }),
          supabase.from("order").select("id", { count: "exact", head: true }),
        ]);

        const newStats = {
          categories: categories.count ?? 0,
          products: products.count ?? 0,
          users: users.count ?? 0,
          orders: orders.count ?? 0,
        };

        localStorage.setItem("stats", JSON.stringify(newStats));
        setStats(newStats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: "Categories", value: stats?.categories, icon: <FaLayerGroup /> },
    { label: "Products", value: stats?.products, icon: <FaBoxOpen /> },
    { label: "Users", value: stats?.users, icon: <FaUsers /> },
    { label: "Orders", value: stats?.orders, icon: <FaShoppingCart /> },
  ];

  return (
    <div className="grid grid-cols-[250px_1fr] min-h-screen bg-gray-100">
      <SidebarAdmin />
      <div className="p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500 text-lg">Loading data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {statCards.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-md transition-all flex items-center gap-5 
                  hover:shadow-xl hover:scale-105 duration-300 cursor-pointer"
                >
                  <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 text-3xl rounded-full">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{item.label}</p>
                    <h3 className="text-4xl font-medium text-gray-700">
                      {item.value}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
              <h4 className="text-xl font-semibold text-gray-800">
                Recent Sales
              </h4>
              <p className="text-gray-600">You made {stats?.orders} sales.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
