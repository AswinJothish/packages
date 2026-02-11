import Elysia, { t } from "elysia";
import { BannerModel } from "../../../models/admin/banner";

export const banner = new Elysia({
  prefix: "/banner",
})
.get(
    "/all",
    async ({ set }) => {
      try {
        const banners = await BannerModel.find({ isDeleted: false, active: true })
          .sort({ createdAt: -1 })
          .lean();
        
        set.status = 200;
        return { message: "Banners fetched successfully", ok: true, banners };
      } catch (error: any) {
        set.status = 500;
        console.error(error);
        return { message: error.message, ok: false };
      }
    },
    { detail: { tags: ["Banners"], description: "Get all active banners" } }
  )
  
