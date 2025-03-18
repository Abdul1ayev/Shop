"use client";

import { useState, useEffect } from "react";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../actions/user-action";

interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleCreate = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) return;
    await createUser(newUser.username, newUser.email, newUser.password);
    setNewUser({ username: "", email: "", password: "" });
    setUsers(await getUsers());
  };

  const handleDelete = async (id: string) => {
    await deleteUser(id);
    setUsers(await getUsers());
  };

  const handleEdit = (user: User) => {
    setEditingUser({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    await updateUser(editingUser._id, editingUser.username, editingUser.email);
    setEditingUser(null);
    setUsers(await getUsers());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          User Management
        </h1>

        <div className="space-y-3">
          <input
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
          />
          <input
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <button
            className="w-1/3 block mt-4 mx-auto bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            onClick={handleCreate}
          >
            Add User
          </button>
        </div>

        <ul className="mt-4 space-y-2 p-1">
          {users.map((user) => (
            <li
              key={user._id}
              className="flex justify-between items-center p-2 border rounded-md shadow-xl"
            >
              {editingUser && editingUser._id === user._id ? (
                <div className="flex flex-col gap-1">
                  <input
                    className="p-1 border rounded-md"
                    value={editingUser.username}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        username: e.target.value,
                      })
                    }
                  />
                  <input
                    className="p-1 border rounded-md"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500 transition"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-gray-800">
                    {user.username} ({user.email})
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 mx-2 rounded-md shadow-sm hover:bg-yellow-600 transition"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
