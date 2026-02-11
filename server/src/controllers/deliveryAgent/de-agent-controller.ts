import { saveFile } from "@/lib/file-s3";
import { DeliveryAgent } from "@/models/delivery-agent";
import { StoreType } from "@/types";
import Elysia, { t } from "elysia";

export const deliveryAgentController = new Elysia({
  prefix: "/deliveryagent",
  detail: {
    tags: ["Delivery Agent"],
  },
})
  .patch(
    "/update",
    async ({ body, store, set }) => {
      try {
        const id = (store as StoreType)["id"];

        const { fcmToken, name, image } = body;

        const updateFields: {
          fcmToken?: string;
          name?: string;
          image?: string;
        } = {};
        if (fcmToken !== undefined) updateFields.fcmToken = fcmToken;
        if (name !== undefined) updateFields.name = name;

        if (image) {
          const { filename, ok } = await saveFile(image, "da-profile-images");

          if (!ok) {
            set.status = 400;

            return {
              status: false,
              message: "Unable to upload profile image",
            };
          }

          updateFields.image = filename;
        }

        await DeliveryAgent.updateOne({ _id: id }, { $set: updateFields });

        const agent = await DeliveryAgent.findById(id);

        return {
          message: "Delivery Agent updated successfully",
          data: agent,
          status: true,
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
        fcmToken: t.Optional(t.String()),
        name: t.Optional(t.String()),
        image: t.Optional(t.Any()),
      }),
      detail: {
        summary: "Update delivery agent",
      },
    }
  )
  .post(
    "/rate",
    async ({ body, set }) => {
      try {
        const { agentId, newRating } = body;

        const deliveryAgent = await DeliveryAgent.findById(agentId);

        if (!deliveryAgent) {
          set.status = 404;
          return {
            message: "Delivery Agent not found",
            status: false,
          };
        }

        const ratingsCount = deliveryAgent.totalRatings || 0;
        const currentAvg = parseFloat(deliveryAgent.ratings || "0");

        const updateAvg =
          (currentAvg * ratingsCount + newRating) / (ratingsCount + 1);

        deliveryAgent.ratings = updateAvg.toString();

        deliveryAgent.totalRatings = ratingsCount + 1;

        await deliveryAgent.save();

        return {
          message: "Delivery Agent rated successfully",
          data: deliveryAgent,
          status: true,
        };
      } catch (error) {
        set.status = 500;
        console.error(error);
        return {
          error,
          status: "error",
        };
      }
    },
    {
      body: t.Object({
        agentId: t.String(),
        newRating: t.Number(),
      }),
      detail: {
        summary: "Rate a delivery agent",
      },
    }
  );
