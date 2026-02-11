import Elysia, { t } from "elysia";
import { SectionModel } from "../../../models/admin/sections/section";

export const section = new Elysia({
  prefix: "/section",
  detail: {
    tags: ["User - Sections"],
  },
})
  .get(
    "/all",
    async ({ query }) => {
      try {
        const { page, limit, q } = query;
        const _limit = limit || 10;
        const _page = page || 1;

        const filter = {
          isDeleted: false,
          active:true,
          ...(q && { Title: { $regex: q, $options: "i" } }),
        };

        const sections = await SectionModel.find(filter)
          .populate("Products") // Populate products details
          .limit(_limit)
          .skip((_page - 1) * _limit)
          .exec();

        const totalSections = await SectionModel.countDocuments(filter);

        return {
          sections,
          status: "success",
          total: totalSections,
        };
      } catch (error) {
        console.log(error);
        return {
          error,
          status: "error",
        };
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.Number()),
        limit: t.Optional(t.Number()),
        q: t.Optional(t.String()), // Search by title
      }),
      detail: {
        summary: "Get all sections with pagination and search",
      },
    }
  )

  .get(
    "/:id",
    async ({ params }) => {
      try {
        const { id } = params;
        
        // Find the section by ID, ensuring it's not deleted and is active
        const section = await SectionModel.findOne({ 
          _id: id, 
          isDeleted: false, 
          active: true 
        }).populate("Products");
  
        // If section is not found, return a custom error message
        if (!section) {
          return {
            message: "Section not found or inactive",
            status: false,
          };
        }
  
        return {
          message: "Section fetched successfully",
          data: section,
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
      detail: {
        summary: "Get section by ID",
      },
    }
  )
  

