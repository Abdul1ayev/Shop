"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import SidebarAdmin from "@/components/SidebarAdmin";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";

type Category = {
  id: string;
  name: string;
  active: boolean;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "status">("name");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase.from("category").select("*");
    if (error) {
      console.error("❌ Error fetching categories:", error);
      toast.error("Failed to fetch categories!");
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("⚠️ Category name is required!");
      return;
    }

    setAdding(true);
    const { error } = await supabase
      .from("category")
      .insert([{ name, active: false }]);
    if (error) {
      console.error("❌ Error adding category:", error);
      toast.error("Failed to add category!");
    } else {
      toast.success("Category added successfully!");
      setName("");
      fetchCategories();
    }
    setAdding(false);
  }

  async function toggleCategoryStatus(id: string, active: boolean) {
    const { error } = await supabase
      .from("category")
      .update({ active: !active })
      .eq("id", id);
    if (error) {
      console.error("❌ Error updating category:", error);
      toast.error("Failed to update category status!");
    } else {
      toast.success("Category status updated!");
      fetchCategories();
    }
  }

  const sortedAndFilteredCategories = categories
    .filter((cat) => {
      if (filterStatus === "all") return true;
      return filterStatus === "active" ? cat.active : !cat.active;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return a.active === b.active ? 0 : a.active ? -1 : 1;
      }
    });

  return (
    <div className="grid grid-cols-[250px_1fr] min-h-screen bg-gray-100">
      <SidebarAdmin />

      <div className=" p-8 w-full">
        <h1 className="text-2xl font-bold mb-4">Categories</h1>

        <form onSubmit={addCategory} className="mb-6 w-1/3 flex gap-2">
          <input
            type="text"
            className="border p-2 w-1/4 rounded flex-grow focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition disabled:bg-blue-300"
            type="submit"
            disabled={adding}
          >
            {adding ? <FaSpinner className="animate-spin" /> : "Add"}
          </button>
        </form>

        {/* Sorting and Filtering Controls */}
        <div className="mb-4 flex gap-4">
          <select
            className="border p-2 rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "status")}
          >
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </select>
          <select
            className="border p-2 rounded"
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "active" | "inactive")
            }
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <FaSpinner className="animate-spin text-2xl text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">#</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredCategories.map((cat, index) => (
                  <tr
                    key={cat.id}
                    className="border hover:bg-gray-50 transition"
                  >
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{cat.name}</td>
                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 text-sm rounded ${
                          cat.active
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {cat.active ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition"
                        onClick={() => toggleCategoryStatus(cat.id, cat.active)}
                      >
                        {cat.active ? "Unpublish" : "Publish"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
