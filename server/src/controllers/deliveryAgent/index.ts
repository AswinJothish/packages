import { validateToken } from "@/lib/util";
import Elysia from "elysia";
import { deliveryAgentAuthController } from "./de-agent-auth-controller";
import { deliveryAgentController } from "./de-agent-controller";
import { deliveryAgentOrderController } from "./de-order-controller";

const deliveryagentBaseController = new Elysia({
  prefix: "/deliveryagent",
})
  .use(deliveryAgentAuthController)
  .state("id", "")
  .state("mobile", "")
  .state("role", "")
  .onBeforeHandle(async ({ headers, set, store }) => {
    const token = headers["authorization"];

    try {
      const payload = await validateToken(token ?? "");
      store["id"] = payload.id;
      store["mobile"] = payload.mobile;
      store["role"] = payload.role;

      if (payload.role !== "deliveryAgent") {
        set.status = 401;
        return { message: "Unauthorized" };
      }
    } catch (error) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
  })
  .use(deliveryAgentController)
  .use(deliveryAgentOrderController);

export { deliveryagentBaseController };
