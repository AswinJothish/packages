import Topbar from "../utils/topbar";
import { LuShoppingCart } from "react-icons/lu";
import { SlCalender } from "react-icons/sl";
import { HiOutlineUsers } from "react-icons/hi2";
import { PiChartLineUp } from "react-icons/pi";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { _axios } from "@/lib/_axios";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function Dashboard() {
  const years = [2024, 2025];
  const [selectedYear, setSelectedYear] = useState('2025');

  const navigate=useNavigate()
  // Chart data query
  const { data: chartData } = useQuery({
    queryKey: ['overview chart data', selectedYear],
    queryFn: async () => {
      const response = await _axios.get(`/dashboard/overviewchart?year=${selectedYear}`);
      return response.data;
    }
  });

  // Dashboard stats query
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard stats fetch'],
    queryFn: async () => {
      const response = await _axios.get('/dashboard/');
      return response.data.data;
    }
  });

  // Recent orders query
  const { data: recentOrders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await _axios.get(`/dashboard/orderhistory`);
      return {
        orders: response.data.orders,
        total: response.data.totalOrders,
        thisMonth: response.data.thisMonthOrders,
      };
    },
  });

  // Prepare chart data from API response
  const salesData = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ],
    datasets: [
      {
        label: `Order Overview - ${selectedYear}`,
        data: chartData||['1','12','24','1','1','1','135','1','12','1','1','1',],
        borderColor: ' rgb(29, 78, 216)'
    }],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="w-full h-full">
        <Topbar title="Dashboard" />
        <div className="px-6 py-4">
          {/* Stats Overview */}
          <div className="grid font-ubuntu grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
  {/* Card Template */}
  {[
    {
      title: "Total Orders",
      value: dashboardStats?.totalOrders || 0,
      icon: <LuShoppingCart size={28} />,
    },
    {
      title: "Today Orders",
      value: dashboardStats?.todayOrders || 0,
      icon: <SlCalender size={28} />,
    },
    {
      title: "New Customers",
      value: dashboardStats?.todayCustomers || 0,
      icon: <HiOutlineUsers  size={28} />,
    },
    {
      title: "Average Order Value",
      value: `₹ ${dashboardStats?.avgOrderValue || 0}`,
      icon: <PiChartLineUp size={28} />,
    },
  ].map((card, index) => (
    <div
      key={index}
      className="relative bg-white px-8 py-6 rounded-xl shadow-lg border border-blue-700 hover:shadow-xl transition-shadow duration-300"
    >
      {/* Icon in Top-Right Corner */}
      <div className="absolute top-5 right-5 text-blue-700">{card.icon}</div>

      {/* Content */}
      <div className="flex flex-col">
        <span className="text-gray-500">{card.title}</span>
        <span className="text-2xl mt-2 font-bold text-blue-700">{card.value}</span>
      </div>
    </div>
  ))}
</div>



<div className="flex gap-10">
  {/* Sales Chart */}
  <div className="bg-white p-6 flex-1 min-h-[400px] justify-center rounded-xl shadow-lg flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold text-gray-900">Overview</h3>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="border rounded-md p-1"
      >
        {years.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
    <div className="flex-grow"> {/* Ensures the chart takes available space */}
      <Line data={salesData} options={options} />
    </div>
  </div>

  {/* Recent Orders Box */}
  <div className="bg-white p-6 flex-1 min-h-[400px] rounded-xl shadow-lg flex flex-col">
    <div className="mb-4 flex justify-between">
      <div>
      <h3 className="text-xl font-semibold text-gray-900">Recent Orders</h3>
      <p className="text-muted-foreground py-2 text-sm">
        {recentOrders?.thisMonth} Orders were placed this month
      </p>
      </div>
      <div>
<button onClick={()=>{navigate(`/admin/orders`)}} className="bg-button-gradient text-sm text-white font-medium rounded-lg px-3 py-2 hover:scale-105 transition-all duration-300">View all</button>
      </div>
    </div>
    
    {/* Orders List */}
    <div className="flex-grow space-y-4 overflow-auto">
      {recentOrders?.orders?.map((order: any, index: number) => (
        <div key={index} className="flex justify-between border-b pb-1">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-button-gradient text-white flex justify-center items-center rounded-full text-sm">
              {order.customerId.username ? order.customerId.username.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex text-base flex-col">
              <span onClick={()=>{navigate(`/admin/user/${order.customerId._id}`)}} className="text-gray-900 cursor-pointer hover:underline">{order.customerId.username || "Unknown"}</span>
              <span className="text-gray-400 text-sm">{order.customerId.mobileNumber}</span>
            </div>
          </div>
          <div>
            <span onClick={()=>{navigate(`/admin/orders/order/${order._id}`)}} className="text-blue-600  text-base hover:underline cursor-pointer">{order.orderId}</span>
          </div>
          <div className="text-right">
            <span>₹ {order.grandTotal}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

        </div>
      </div>
    </>
  );
}