import Elysia, { t } from "elysia";
import { NotificationModel } from "../../models/admin/notification-model";

const notificationController = new Elysia({
  prefix: "/notification",
  detail: {
    tags: ["Admin - Notifications"],
  },
})
  .post(
    "/create",
    async ({ body }) => {
      try {
        const { title, description, type } = body;

        const notification = await NotificationModel.create({
          title,
          description,
          type,
        });

        return {
          message: "Notification Created Successfully",
          data: notification,
          status: "success",
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
      body: t.Object({
        title: t.String(),
        description: t.String(),
        type: t.String(),
      }),
      detail: {
        summary: "Create a new notification",
      },
    }
  )
  .get(
    "/all",
    async ({ query }) => {
      try {
        const { page, limit } = query;
        let _limit = Number(limit) || 4;
        let _page = Number(page) || 1;

        const notifications = await NotificationModel.find()
          .skip((_page - 1) * _limit)
          .limit(_limit)
          .sort({ createdAt: -1 })
          .lean();

        const totalNotifications = await NotificationModel.countDocuments();
        const totalPages = Math.ceil(totalNotifications / _limit);
        const hasMore = notifications.length === _limit && _page < totalPages;

        return {
          notifications,
          currentPage: _page,
          totalPages,
          total: totalNotifications,
          hasMore,
          status: "success",
        };
      } catch (error: any) {
        console.log(error);
        return {
          error: error.message,
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
          default: 4,
        }),
      }),
      detail: {
        summary: "Get all notifications for the user",
      },
    }
  );

export { notificationController };
