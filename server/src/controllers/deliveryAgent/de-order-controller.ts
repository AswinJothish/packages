import { sendNotification } from "@/lib/firebase";
import { User } from "@/models/user-model";
import { OrderModel } from "@/models/user/order-model";
import { StoreType } from "@/types";
import Elysia, { t } from "elysia";

export const deliveryAgentOrderController = new Elysia({
  prefix: "/deliveryagentorders",
  detail: {
    tags: ["Delivery Agent - Orders"],
  },
})
  .get(
    "/assigned",
    async ({ query, store }) => {
      try {
        const id = (store as StoreType)["id"];
        const { page, limit } = query;
        const _limit = Number(limit) || 10;
        const _page = Number(page) || 1;

        const orders = await OrderModel.find(
          {
            deliveryAgent: id,
            status: "assigned",
          },
          "user _id addressId products.productId createdAt distance orderId status"
        )
          .populate("user")
          .populate("addressId")
          .limit(_limit)
          .skip((_page - 1) * _limit)
          .sort({ active: -1 })
          .exec();

        const total = await OrderModel.countDocuments({
          deliveryAgent: id,
          status: "assigned",
        });

        return {
          message: "Orders Fetched Successfully",
          status: "success",
          orders,
          total,
          limit: _limit,
          page: _page,
        };
      } catch (error) {
        console.error(error);
        return {
          error,
          status: "error",
        };
      }
    },
    {
      detail: {
        summary: "Get all orders assigned to a delivery agent",
      },
      query: t.Object({
        page: t.Number({
          default: 1,
        }),
        limit: t.Number({
          default: 10,
        }),
      }),
    }
  )
  .get(
    "/ongoings",
    async ({ query, store }) => {
      try {
        const id = (store as StoreType)["id"];
        const { page, limit } = query;
        const _limit = Number(limit) || 10;
        const _page = Number(page) || 1;

        const orders = await OrderModel.find(
          { deliveryAgent: id, status: "picked" },
          "user _id addressId products.productId createdAt distance orderId status"
        )
          .populate("user")
          .populate("addressId")
          .limit(_limit)
          .skip((_page - 1) * _limit)
          .sort({ active: -1 })
          .exec();

        const total = await OrderModel.countDocuments({
          deliveryAgent: id,
          status: "picked",
        });

        return {
          message: "Orders Fetched Successfully",
          status: "success",
          orders,
          total,
          limit: _limit,
          page: _page,
        };
      } catch (error) {
        console.error(error);
        return {
          error,
          status: "error",
        };
      }
    },
    {
      detail: {
        summary: "Get all orders assigned to a delivery agent",
      },
      query: t.Object({
        page: t.Number({
          default: 1,
        }),
        limit: t.Number({
          default: 10,
        }),
      }),
    }
  )
  .get(
    "/order",
    async ({ query, store }) => {
      try {
        const agentId = (store as StoreType)["id"];

        const { orderId } = query;
        const order = await OrderModel.findOne({
          _id: orderId,
          deliveryAgent: agentId,
        })
          .populate("user")
          .populate("addressId")
          .populate("products.productId")
          .populate("products.suggestions")
          .populate("deliveryAgent")
          .lean()
          .exec();
        if (!order) {
          return { message: "Order not found", status: "error" };
        }
        return {
          message: "Order Fetched Successfully",
          status: "success",
          order,
        };
      } catch (error) {
        console.error(error);
        return {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      query: t.Object({
        orderId: t.String({
          pattern: `^[a-fA-F0-9]{24}$`,
        }),
      }),
      detail: {
        summary: "Get a specific order",
      },
    }
  )
  .post(
    "/readytodeliver",
    async ({ body, store }) => {
      try {
        const agentId = (store as StoreType)["id"];

        const { orderId } = body;

        const order = await OrderModel.findOneAndUpdate(
          { _id: orderId, deliveryAgent: agentId },
          { $set: { status: "picked" } },
          { new: true }
        );

        if (!order) {
          return { message: "Order not found", status: "error" };
        }

        const user = await User.findById(order.user);

        if (!user) {
          return { message: "User not found", status: "error" };
        }

        await sendNotification(
          user.fcmToken,
          "Order on the way!",
          "Order ID: " +
            order.orderId +
            " is on the way. Please check your delivery status"
        );

        return {
          message: "Order updated successfully",
          status: "success",
          order,
        };
      } catch (error) {
        console.error(error);
        return {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      body: t.Object({
        orderId: t.String({
          pattern: `^[a-fA-F0-9]{24}$`,
        }),
      }),
      detail: {
        summary: "Mark an order as ready to deliver",
      },
    }
  )
  .post(
    "/completeorder",
    async ({ body, store }) => {
      try {
        const agentId = (store as StoreType)["id"];

        const { orderId } = body;

        const order = await OrderModel.findOneAndUpdate(
          { _id: orderId, deliveryAgent: agentId },
          { $set: { status: "delivered" } },
          { new: true }
        );

        if (!order) {
          return { message: "Order not found", status: "error" };
        }

        const user = await User.findById(order.user);

        if (!user) {
          return { message: "User not found", status: "error" };
        }

        await sendNotification(
          user.fcmToken,
          "Order delivered",
          "Order ID: " +
            order.orderId +
            " has been delivered to you. Thank you for using our services"
        );

        return {
          message: "Order updated successfully",
          status: "success",
          order,
        };
      } catch (error) {
        return {
          message: "Failed to update order status",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      body: t.Object({
        orderId: t.String({
          pattern: `^[a-fA-F0-9]{24}$`,
        }),
      }),
      detail: {
        summary: "Mark an order as delivered",
      },
    }
  )
  .get(
    "/orderhistory",
    async ({ query, store }) => {
      try {
        const agentId = (store as StoreType)["id"];
        const { page, limit } = query;
        const _limit = Number(limit) || 10;
        const _page = Number(page) || 1;

        const orders = await OrderModel.find(
          { deliveryAgent: agentId, status: "delivered" },
          "user.username _id addressId products.productId createdAt distance orderId"
        )
          .populate("addressId")
          .limit(_limit)
          .skip((_page - 1) * _limit)
          .sort({ active: -1 })
          .exec();

        const total = await OrderModel.countDocuments({
          deliveryAgent: agentId,
          status: "delivered",
        });

        return {
          message: "Orders Fetched Successfully",
          status: "success",
          orders,
          total,
          limit: _limit,
          page: _page,
        };
      } catch (error) {
        console.error(error);
        return {
          error,
          status: "error",
        };
      }
    },
    {
      query: t.Object({
        page: t.Number({
          default: 1,
        }),
        limit: t.Number({
          default: 10,
        }),
      }),
      detail: {
        summary: "Get order history for a delivery agent",
      },
    }
  );
