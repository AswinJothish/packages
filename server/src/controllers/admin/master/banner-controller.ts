import Elysia, { t } from "elysia";
import { BannerModel } from "../../../models/admin/banner";
import { saveFile } from "../../../lib/file";

export const BannerController = new Elysia({
  prefix: "/banner",
})
.post(
  "/create",
  async ({ body, set }) => {
    try {
      const { title, description, BannerImage, active } = body;
      let filename = "";
      
      if (BannerImage) {
        const { ok, filename: savedFilename } = await saveFile(BannerImage, "banners");
        if (!ok) {
          set.status = 400;
          return { message: "Something went wrong with image upload", ok: false };
        }
        filename = savedFilename;
      }

      const newBanner = new BannerModel({
        Title: title,
        Description: description,
        BannerImage: filename,
        isDeleted: false, // Default to false
        active: active ?? true, // Default to true
      });

      await newBanner.save();
      set.status = 201;
      return { message: "Banner created successfully", ok: true, banner: newBanner };
    } catch (error:any) {
      set.status = 500;
      console.error(error);
      return { message: error.message, ok: false };
    }
  },
  {
    body: t.Object({
      title: t.String(),
      description: t.Optional(t.String()),
      BannerImage: t.Optional(t.File()),
      active: t.Optional(t.Boolean()),
    }),
    detail: { tags: ["Banners"], description: "Create a new banner with a single image" },
  }
)
.get(
  "/all",
  async ({ set }) => {
    try {
      const banners = await BannerModel.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
      set.status = 200;
      return { message: "Banners fetched successfully", ok: true, banners };
    } catch (error:any) {
      set.status = 500;
      console.error(error);
      return { message: error.message, ok: false };
    }
  },
  { detail: { tags: ["Banners"], description: "Get all banners" } }
)
.get(
  "/get/:id",
  async ({ params, set }) => {
    try {
      const { id } = params;
      const banner = await BannerModel.findOne({ _id: id, isDeleted: false }).lean();
      if (!banner) {
        set.status = 404;
        return { message: "Banner not found", ok: false };
      }
      set.status = 200;
      return { message: "Banner fetched successfully", ok: true, banner };
    } catch (error:any) {
      set.status = 500;
      console.error(error);
      return { message: error.message, ok: false };
    }
  },
  {
    params: t.Object({ id: t.String() }),
    detail: { tags: ["Banners"], description: "Get a banner by ID" },
  }
)
.post(
  "/update/:id",
  async ({ params, body, set }) => {
    try {
      const { id } = params;
      const { title, description, BannerImage, active } = body;
      let filename = "";
      
      if (BannerImage) {
        const { ok, filename: savedFilename } = await saveFile(BannerImage, "banners");
        if (!ok) {
          set.status = 400;
          return { message: "Something went wrong with image upload", ok: false };
        }
        filename = savedFilename;
      }
      
      const updatedBanner = await BannerModel.findByIdAndUpdate(
        id,
        {
          Title: title,
          Description: description,
          BannerImage: filename || undefined,
          active: active,
        },
        { new: true }
      );
      
      if (!updatedBanner) {
        set.status = 404;
        return { message: "Banner not found", ok: false };
      }
      
      set.status = 200;
      return { message: "Banner updated successfully", ok: true, banner: updatedBanner };
    } catch (error:any) {
      set.status = 500;
      console.error(error);
      return { message: error.message, ok: false };
    }
  },
  {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      title: t.Optional(t.String()),
      description: t.Optional(t.String()),
      BannerImage: t.Optional(t.File()),
      active: t.Optional(t.Boolean()),
    }),
    detail: { tags: ["Banners"], description: "Update a banner by ID with a single image" },
  }
)
.delete(
  "/:id",
  async ({ params, query }) => {
    try {
      const { id } = params;
      const { permanent } = query;

      const banner = await BannerModel.findById(id);

      if (!banner) {
        return { message: "Banner not found", status: false };
      }

      if (permanent) {
        banner.active = false;
        banner.isDeleted = true;

        await banner.save();

        return {
          message: "Banner deleted permanently",
          status: true,
        };
      }

      banner.active = !banner.active;

      await banner.save();

      return {
        message: `Banner ${
          banner.active ? "activated" : "deactivated"
        } successfully`,
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
    params: t.Object({
      id: t.String(),
    }),
    query: t.Object({
      permanent: t.Boolean({
        default: false,
      }),
    }),
    detail: {
      summary: "Delete banner by ID",
    },
  }
)
