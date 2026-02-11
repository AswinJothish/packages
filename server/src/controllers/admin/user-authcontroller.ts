import { Elysia, t } from "elysia";
import { jwt } from "../../lib/jwt";
import { AdminModel } from "../../models/admin/admin";
import { saveFile } from "../../lib/file";

export const AdminAuthController = new Elysia({
  prefix: "/auth",
})
  .post(
    "/login",
    async ({ set, body, cookie }) => {
      try {
        const { email, password } = body;
        const admin = await AdminModel.findOne({
          email,
          password,
          role: "admin",
        });
        if (!admin) {
          set.status = 400;
          return {
            message: "Invalid credentials",
            ok: false,
          };
        }

        // const isPasswordValid = await bcrypt.compare(password, admin.password);
        // if (!isPasswordValid) {
        //   set.status = 400;
        //   return {
        //     message: "Invalid credentials",
        //     ok: false,
        //   };
        // }

        let userData = await AdminModel.findOne(
          { email: email },
          "-password -__v -createdAt -updatedAt"
        );

        let token = jwt.sign({ id: admin._id }, "hjgfuseri6uto98u-5$#%#@^@jbdh4$!#$1dsdxqf24312");

        // Use set.cookie to set the cookie
        set.cookie = {
          ...set.cookie,
          admin: {
            value: token,
            httpOnly: true, // Cookie accessible only by the server
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: 3600000, // 1 hour in milliseconds
            sameSite: "strict", // Prevent cross-site request forgery (CSRF)
          }
        };

        set.status = 200;
        return {
          message: "Logged in successfully",
          token,
          userData,
          ok: true,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          message: error.message,
          ok: false,
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get(
    "/profile",
    async ({ set }) => {
      try {
        const admin = await AdminModel.findOne(
          { role: "admin" }, 
          " -__v -createdAt -updatedAt" 
        );

        if (!admin) {
          set.status = 404;
          return {
            message: "Admin not found",
            ok: false,
          };
        }

        set.status = 200;
        return {
          message: "Admin data fetched successfully",
          userData: admin,
          ok: true,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          message: error.message,
          ok: false,
        };
      }
    }
  )
  .put(
    "/profile",
    async ({ body, set }) => {
      try {
        const { username, mobileNumber, password, profileImage } = body;
        let filename = "";
  
        const admin = await AdminModel.findOne({ role: "admin" });
  
        if (!admin) {
          set.status = 404;
          return {
            message: "Admin not found",
            ok: false,
          };
        }
  
        if (profileImage) {
          const { ok, filename: savedFilename } = await saveFile(profileImage, "profile");
          if (!ok) {
            set.status = 400;
            return { message: "Something went wrong with image upload", ok: false };
          }
          filename = savedFilename;
        }
  
        if (username !== undefined) admin.username = username;
        if (mobileNumber !== undefined) admin.mobileNumber = mobileNumber;
        if (password !== undefined) admin.password = password; 
        if (filename) admin.profileImage = filename; 
  
        await admin.save();
  
        set.status = 200;
        return {
          message: "Admin profile updated successfully",
          ok: true,
          userData: admin,
        };
      } catch (error: any) {
        set.status = 500;
        console.error(error);
        return {
          message: error.message,
          ok: false,
        };
      }
    },
    {
      body: t.Object({
        username: t.Optional(t.String()),
        mobileNumber: t.Optional(t.String()),
        password: t.Optional(t.String()),
        profileImage: t.Optional(t.File()), 
      }),
    }
  )
  
  
  