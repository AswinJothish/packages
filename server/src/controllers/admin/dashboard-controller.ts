import { UserModel } from "../../models/admin/user";
import { OrderModel } from "../../models/admin/products/orders/order";
import dayjs from "dayjs";
import Elysia, { t } from "elysia";

export const dashboardController = new Elysia({
  prefix: "/dashboard",
  detail: {
    tags: ["Admin - Dashboard"],
  },
})
  .get(
    "/",
    async () => {
      const todayStart = dayjs().startOf("day").toDate();
      const todayEnd = dayjs().endOf("day").toDate();
      const lastMonthStart = dayjs()
        .subtract(1, "month")
        .startOf("month")
        .toDate();
      const lastMonthEnd = dayjs().subtract(1, "month").endOf("month").toDate();

      const totalOrders = await OrderModel.countDocuments();

      const todayOrders = await OrderModel.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });

      const newCustomers = await UserModel.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
      });

      const orders = await OrderModel.aggregate([
        {
          $group: {
            _id: null,
            avgOrderValue: { $avg: "$grandTotal" },
          },
        },
      ]);

      const avgOrderValue = orders[0]?.avgOrderValue || 0;

      return {
        message: "Dashboard fetched successfully",
        status: true,
        data: {
          totalOrders,
          todayOrders,
          newCustomers,
          avgOrderValue: avgOrderValue.toFixed(2),
        },
      };
    },
    {
      detail: {
        description: "Get Dashboard Stats",
        summary: "Get Dashboard Stats",
      },
    },
  )
  .get(
    "/orderhistory",
    async () => {
      const todayEnd = dayjs().endOf("day").toDate();
      const thisMonthStart = dayjs().startOf("month").toDate();
  
      // Get the total number of orders
      const totalOrders = await OrderModel.countDocuments();
  
      // Fetch the most recent 5 orders, populated with customer information
      const orders = await OrderModel.find()
        .sort({ createdAt: -1 })
        .populate("customerId")  // Populate customerId with the corresponding User document
        .limit(5);
  
      // Get the total number of orders for this month
      const thisMonthOrders = await OrderModel.countDocuments({
        createdAt: { $gte: thisMonthStart, $lte: todayEnd },
      });
  
      return {
        message: "Dashboard fetched successfully",
        status: true,
        orders,
        totalOrders,
        thisMonthOrders,
      };
    },
    {
      detail: {
        description: "Get Dashboard Stats with Order Trends",
        summary: "Get Dashboard Stats with Order Trends",
      },
    }
  )
  .get(
    "/top-sellers",
    async () => {
      const topSellers = await OrderModel.aggregate([
        {
          $group: {
            _id: "$customerId",
            totalPrice: { $sum: "$grandTotal" },
          },
        },
        { $sort: { totalPrice: -1 } },
        { $limit: 5 },
      ]);

      return {
        message: "Top Sellers fetched successfully",
        data: topSellers,
        status: true,
      };
    },
    {
      detail: {
        description: "Get Top Sellers",
        summary: "Get Top Sellers",
      },
    },
  )
  .get(
    "/overviewchart",
    async ({ set, query }) => {
      let year = +query.year || dayjs().year();

      try {
        const currentYear = dayjs().year();
        const currentMonth = dayjs().month() + 1;
        const monthlyOrders = [];

        for (let month = 1; month <= 12; month++) {
          if (
            year < currentYear ||
            (year === currentYear && month <= currentMonth)
          ) {
            const startDate = dayjs(`${year}-${month}-01`)
              .startOf("month")
              .toDate();
            const endDate = dayjs(`${year}-${month}-01`)
              .endOf("month")
              .toDate();

            const count = await OrderModel.countDocuments({
              createdAt: { $gte: startDate, $lte: endDate },
            });

            monthlyOrders.push(count);
          } else {
            monthlyOrders.push(0);
          }
        }

        return monthlyOrders;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    {
      detail: {
        description: "Get Overview Chart",
        summary: "Get Overview Chart",
      },
      query: t.Object({
        year: t.String(),
      }),
    },
  );
