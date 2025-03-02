"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Menu, X, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

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

  useEffect(() => {
    if (!user) return;

    const fetchCartCount = async () => {
      const { data, error } = await supabase
        .from("cart") // "cart" userning savati saqlanadigan jadval bo'lishi kerak
        .select("id")
        .eq("user_id", user.id);

      if (!error && data) {
        setCartCount(data.length);
      }
    };

    fetchCartCount();

    const channel = supabase
      .channel("cart-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart",
          filter: `user_id=eq.${user.id}`,
        },
        fetchCartCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCartCount(0);
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
          className={`md:flex md:items-center md:space-x-6 absolute md:static bg-white w-full md:w-auto top-16 left-0 transition-all duration-300 ease-in-out p-4 md:p-0 shadow-md md:shadow-none rounded-md md:rounded-none ${
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
              className="relative flex items-center gap-2 border-2 border-green-700 text-green-700 hover:text-green-500 hover:border-green-500 transition-all py-2 px-4 rounded mt-4"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2">
                  {cartCount}
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
