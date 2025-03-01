import SidebarAdmin from "@/components/SidebarAdmin";
import React from "react";
type OrderProduct = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
};
type Order = {
  id: string;
  userId: string;
  location:string;
  phone:string;
  status:boolean;
  totalPrice: number;
  createdAt: Date;
}
const Page = () => {
  return (
    <div className="grid grid-cols-[250px_1fr] min-h-screen bg-gray-100">
      <SidebarAdmin />
      
    </div>
  );
};

export default Page;
