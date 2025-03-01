"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Menu, X, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const [orderCount, setOrderCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchOrderCount = async () => {
      const { data, error } = await supabase.from("order").select("*");
      if (!error) setOrderCount(data.length);
    };

    fetchOrderCount();

    const channel = supabase
      .channel("cart")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        fetchOrderCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (session?.user) {
        const { data: userData } = await supabase
          .from("user")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userData) {
          setUser({ id: session.user.id, role: userData.role });
        }
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <>
      <nav className="flex justify-between h-[100] items-center p-4 bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-3xl font-bold text-green-600"
          >
            GREENSHOP
          </button>
        </div>

        <ul
          className={`md:flex md:items-center md:space-x-6 absolute md:static bg-white w-full md:w-auto top-16 left-0 transition-all duration-300 ease-in-out p-4 md:p-0 shadow-md md:shadow-none  rounded-md md:rounded-none ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <li>
            <button
              onClick={() => router.push("/")}
              className="border-green-700 block mx-auto border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
            >
              Home
            </button>
          </li>
          {user?.role === "admin" && (
            <li>
              <button
                onClick={() => router.push("/admin")}
                className="border-green-700 block mx-auto border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
              >
                Admin
              </button>
            </li>
          )}
          {user ? (
            <li>
              <button
                onClick={handleLogout}
                className="border-red-700 block mx-auto border-2 text-red-700 hover:text-red-500 hover:border-red-500 transition-all py-2 px-4 rounded mt-4"
              >
                Logout
              </button>
            </li>
          ) : (
            <li>
              <button
                onClick={() => router.push("/login")}
                className="border-green-700 block mx-auto border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
              >
                LogIn
              </button>
            </li>
          )}
          <li className="relative">
            <button
              onClick={() => router.push("/cart")}
              className="border-green-700 block mx-auto border-2 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
            >
              <ShoppingCart size={22} />
              {orderCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-2">
                  {orderCount}
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
