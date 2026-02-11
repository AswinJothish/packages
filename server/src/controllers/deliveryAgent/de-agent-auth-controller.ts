import { PasetoUtil } from "@/lib/paseto";
import { DeliveryAgent } from "@/models/delivery-agent";
import Elysia, { t } from "elysia";

export const deliveryAgentAuthController = new Elysia({
  prefix: "/deliveryagentauth",
  detail: {
    tags: ["Delivery Agent - Auth"],
  },
})
  .post(
    "/login",
    async ({ body, set }) => {
      const { mobile, password } = body;

      try {
        let dAgent = await DeliveryAgent.findOne({ phone: mobile });

        if (!dAgent) {
          set.status = 400;
          return { message: "Delivery Agent not found" };
        }

        let isMatched = await Bun.password.verify(password, dAgent.password);

        if (!isMatched) {
          set.status = 400;
          return { message: "Invalid password" };
        }

        const token = await PasetoUtil.encodePaseto(
          {
            mobile: dAgent?.phone.toString(),
            id: dAgent._id.toString(),
            role: "deliveryAgent",
          },
          false
        );

        return {
          message: "User processed successfully",
          data: { token, name: dAgent.name, image: dAgent.image ?? "" },
          status: true,
        };
      } catch (error) {
        return {
          error,
          status: false,
        };
      }
    },
    {
      body: t.Object({
        mobile: t.String({
          minLength: 10,
          maxLength: 10,
        }),
        password: t.String({}),
      }),
      detail: {
        summary: "Login as delivery agent to get token",
        description: "Login as delivery agent to get token",
      },
    }
  )
  .post(
    "/decrypt-token",
    async ({ body }) => {
      const { token } = body;

      try {
        const payload = await PasetoUtil.decodePaseto(token);

        return {
          message: "User processed successfully",
          data: { ...payload?.payload },
          status: true,
        };
      } catch (error) {
        console.error(error);
        return {
          error,
          status: false,
        };
      }
    },
    {
      body: t.Object({
        token: t.String(),
      }),
      detail: {
        summary: "Decrypt the token",
        description: "Decrypt the token",
      },
    }
  );
