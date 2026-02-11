import { JwtPayload } from "jsonwebtoken";

declare module "elysia" {
  interface Context {
    headers: any;
    set: any;
    user?: JwtPayload;
  }
}
