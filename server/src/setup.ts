import cors from "@elysiajs/cors";
import { Context, Elysia } from "elysia";
import mongoose from "mongoose";
import { AdminRouter, UserRouter } from "./controllers";
import { logger } from "@rasla/logify";
// import { authMiddleware } from "./middleware/authMiddleware";

const app = new Elysia();
//app.use(authMiddleware);
app.use(cors());

app.use(AdminRouter);
app.use(UserRouter);
const URL = "mongodb+srv://Aswin:aswinj@data.9bttkx1.mongodb.net/"
//const URL = process.env.MONGO_URL;
try {
  await mongoose.connect(URL as string, {
    dbName: "sunstar",
  });

  console.log("Connected to Database");
} catch (e) {
  console.log(e);
}
app.use(
  logger({
    console: true,
    includeIp: true,
    skip: ["/logs"],
  }),
);

app.onError(({ code, error }) => {
  if (code === "VALIDATION") {
    return {
      status: 400,
      body: error.all,
    };
  }
});

export { app };
