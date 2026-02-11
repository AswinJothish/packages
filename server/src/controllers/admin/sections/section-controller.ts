import Elysia, { t } from "elysia";
import { SectionModel } from "../../../models/admin/sections/section";

export const sectionController = new Elysia({
  prefix: "/section",
  detail: {
    tags: ["Admin - Sections"],
  },
})
  .post(
    "/create",
    async ({ body }) => {
      try {
        const existing = await SectionModel.findOne({
          Title: body.Title,
        });

        if (existing) {
          return { message: "Section already exists", status: false };
        }

        const section = await SectionModel.create({
          ...body,
        });

        return {
          message: "Section created successfully",
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
      body: t.Object({
        Title: t.String(),
        Description: t.Optional(t.String()),
        Products: t.Array(t.String()), // Array of Product ObjectIds
      }),
      detail: {
        summary: "Create a new section",
      },
    }
  )

  .get(
    "/all",
    async ({ query }) => {
      try {
        const { page, limit, q } = query;
        const _limit = limit || 10;
        const _page = page || 1;

        const filter = {
          isDeleted: false,
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
        const section = await SectionModel.findById(id).populate("Products");

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

  .delete(
    "/:id",
    async ({ params, query }) => {
      try {
        const { id } = params;
        const { permanent } = query;

        const section = await SectionModel.findById(id);

        if (!section) {
          return { message: "Section not found", status: false };
        }

        if (permanent) {
          section.isDeleted = true;
          await section.save();

          return {
            message: "Section deleted permanently",
            status: true,
          };
        }

        section.active = !section.active;
        await section.save();

        return {
          message: `Section ${section.active ? "activated" : "deactivated"} successfully`,
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
        permanent: t.Optional(t.Boolean()),
      }),
      detail: {
        summary: "Delete section (soft delete or permanent)",
      },
    }
  )

  .put(
    "/:id",
    async ({ params, body }) => {
      try {
        const { id } = params;
        const { Title, Description, Products } = body;
        const existing = await SectionModel.findById(id);

        if (!existing) {
          return { message: "Section not found", status: false };
        }

        existing.Title = Title || existing.Title;
        existing.Description = Description || existing.Description;
        existing.Products = Products || existing.Products;

        await existing.save();

        return {
          message: "Section updated successfully",
          data: existing,
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
      body: t.Object({
        Title: t.Optional(t.String()),
        Description: t.Optional(t.String()),
        Products: t.Optional(t.Array(t.String())), // Optional update of products
      }),
      detail: {
        summary: "Update section by ID",
      },
    }
  );
