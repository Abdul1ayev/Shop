"use server";

import { connectDB } from "../lib/mongoose";
import User from "../models/user";

export async function createUser(
  username: string,
  email: string,
  password: string
) {
  await connectDB();
  const newUser = new User({ username, email, password });
  await newUser.save();
  return { message: "✅ Foydalanuvchi yaratildi!" };
}

export async function getUsers() {
  await connectDB();
  const users = await User.find({}).lean();
  return JSON.parse(JSON.stringify(users));
}

export async function deleteUser(id: string) {
  await connectDB();
  await User.findByIdAndDelete(id);
  return { message: "❌ Foydalanuvchi o‘chirildi!" };
}

export async function updateUser(id: string, username: string, email: string) {
  await connectDB();
  await User.findByIdAndUpdate(id, { username, email });
  return { message: "✅ Foydalanuvchi yangilandi!" };
}
