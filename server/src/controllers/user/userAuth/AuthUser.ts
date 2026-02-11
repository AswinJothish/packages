import Elysia, { t } from "elysia";
import { jwt } from "../../../lib/jwt";
import { CounterModel, UserModel } from "../../../models/admin/user";



const generateUserId = async () => {
    const prefix = "sun";
    const counterName = "user"; 
    let counter = await CounterModel.findOne({ name: counterName });
    if (!counter) {
      counter = new CounterModel({ name: counterName, count: 0 });
      await counter.save();
    }
  
    counter.count += 1;
    await counter.save();
  
    const sequentialNumber = counter.count.toString().padStart(3, '0'); 
    const userId = `${prefix}${sequentialNumber}`;
  
    return userId;
  };


export const UserAuthController = new Elysia({
  prefix: "/auth",
})
.post(
  "/login",
  async ({ body, set }) => {
    try {
      const { mobileNumber } = body;
      let user = await UserModel.findOne({ mobileNumber });

      if (!user || !user.active) {
        // If user doesn't exist or is inactive, create a new user
        const userid = await generateUserId();

        const newUser = new UserModel({
          role: "customer",
          username: '',
          mobileNumber,
          deliveryAddress: [],
          userid,
          active: true, // Ensure the new user is active
        });

        await newUser.save();
        user = await UserModel.findOne({ mobileNumber }, "-password -__v -createdAt -updatedAt");

        set.status = 201;
        return {
          message: "New user created and logged in successfully",
          token: jwt.sign({ id: user._id, mobileNumber: user.mobileNumber }, ""),
          userData: {
            _id: user._id,
            mobileNumber: user.mobileNumber,
            role: user.role,
            username: user.username,
            deliveryAddress: user.deliveryAddress,
            userid: user.userid,
            active: user.active,
          },
          ok: true,
        };
      }

      // If user exists and is active, proceed with normal login
      const token = jwt.sign({ id: user._id, mobileNumber: user.mobileNumber }, "");

      return {
        message: "Login Successful",
        token,
        userData: {
          _id: user._id,
          mobileNumber: user.mobileNumber,
          role: user.role,
          username: user.username,
          deliveryAddress: user.deliveryAddress,
          userid: user.userid,
          active: user.active,
        },
        ok: true,
      };
    } catch (e) {
      console.error(e);
      return {
        status: 400,
        body: {
          error: e.message || "An error occurred",
        },
      };
    }
  },
  {
    body: t.Object({
      mobileNumber: t.String({
        maxLength: 10,
        minLength: 10,
      }),
    }),
    detail: {
      tags: ["User Auth"],
      description: "User Login",
    },
  }
)


  .post(
    "/decode",
    async ({ body, set }) => {
      try {
        const { token } = body;
        const decoded = jwt.verify(token);

        return {
          message: "Token decoded Successfully",
          status: true,
          body: decoded,
        };
      } catch (e) {
        console.error(e);
        return {
          status: 400,
          body: {
            error: e,
          },
        };
      }
    },
    {
      body: t.Object({
        token: t.String(),
      }),
      detail: {
        tags: ["User Auth"],
        description: "Decode the token to check - (Testing only)",
        summary: "Decode the token to check - (Testing only)",
      },
    }
  )
  .post(
    "/fcmtoken",
    async ({ body, set }) => {
      try {
        const { mobileNumber, token } = body;

        if (!mobileNumber || !token) {
          set.status = 401;
          return {
            message: "Invalid phone number or token",
            status: false,
          };
        }

        const user = await UserModel.findOne({ mobileNumber });

        if (!user) {
          set.status = 401;
          return {
            message: "You're not a manufacturer!",
            status: false,
          };
        }

        user.fcmToken = token;
        await user.save();

        return {
          message: "FCM Token Updated Successfully",
          status: true,
        };
      } catch (e) {
        console.error(e);
        return {
          status: 400,
          body: {
            error: e,
          },
        };
      }
    },
    {
      body: t.Object({
        token: t.String(),
        mobileNumber: t.String(),
      }),
      detail: {
        tags: ["User Auth"],
        description: "Update the FCM token",
        summary: "Update the FCM token",
      },
    }
  )
  