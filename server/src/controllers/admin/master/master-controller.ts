import { Elysia, t } from "elysia";
import { SpecificationModel } from "../../../models/admin/products/specification";
import { GeneralSpecModel } from "../../../models/admin/products/generalSpec";
import { CategoryModel } from "../../../models/admin/products/category";
import { saveFile } from "../../../lib/file";

export const Mastercontroller = new Elysia({
  prefix: "/master",
})
.post(
  "/addcategory",
  async ({ set, body }) => {
    try {
      const { category, fields } = body;
      const specification = await SpecificationModel.findOne({ category });

      if (specification) {
        set.status = 404;
        return {
          message: "Specification category already exists",
          ok: false,
        };
      }
      else{
        const newSpecification = new SpecificationModel({
          category,
          fields
        });
  
        await newSpecification.save();
  
        set.status = 200;
        return {
          message: "Specification created successfully",
          ok: true,
        };
      }
      
    } catch (error:any) {
      set.status = 400;
      console.error("Error creating specification:", error);
      return {
        ok: false,
        message: error.message,
      };
    }
  },
  {
    body: t.Object({
      category: t.String(),
      fields: t.Array(t.String()), 
    }),
    detail: {
      tags: ["Specifications"],
      description: "Define a new specification category with a list of fields",
    },
  }
)
.post(
  "/addfields",
  async ({ set, body }) => {
    try {
      const { category, fieldsToAdd } = body;

      const specification = await SpecificationModel.findOne({ category });

      if (!specification) {
        set.status = 404;
        return {
          message: "Specification category not found",
          ok: false,
        };
      }

      const fieldsArray = Array.isArray(fieldsToAdd) ? fieldsToAdd : [fieldsToAdd];
      
      const updatedFields = Array.from(new Set([...specification.fields, ...fieldsArray]));
      specification.fields = updatedFields;
      await specification.save();

      set.status = 200;
      return {
        message: "Fields added successfully",
        ok: true,
      };
    } catch (error: any) {
      set.status = 400;
      console.error("Error adding fields:", error);
      return {
        ok: false,
        message: error.message,
      };
    }
  },
  {
    body: t.Object({
      category: t.String(),
      fieldsToAdd: t.String(), 
    }),
    detail: {
      tags: ["Specifications"],
      description: "Add fields to an existing specification category",
    },
  }
)


.get(
    "/all",
    async ({ set }) => {
      try {
        const specifications = await SpecificationModel.find({});
  
        set.status = 200;
        return {
          message: "Specifications retrieved successfully",
          ok: true,
          data: specifications,
        };
      } catch (error: any) {
        set.status = 400;
        console.error(error);
        return {
          ok: false,
          message: error.message,
        };
      }
    },
    {
      detail: {
        tags: ["Specifications"],
        description: "Retrieve all specifications",
      },
    }
  )
  .post(
    "/editcategory",
    async ({ set, body }) => {
      try {
        const { categoryId, newCategoryName } = body;
  
        const updatedSpecification = await SpecificationModel.findByIdAndUpdate(
          categoryId,
          { category: newCategoryName }, 
          { new: true } 
        );
  
        if (!updatedSpecification) {
          set.status = 404;
          return {
            message: "Category not found",
            ok: false,
          };
        }
  
        set.status = 200;
        return {
          message: "Category name updated successfully",
          ok: true,
          data: updatedSpecification
        };
      } catch (error: any) {
        set.status = 400;
        console.error("Error updating category name:", error);
        return {
          ok: false,
          message: error.message,
        };
      }
    },
    {
      body: t.Object({
        categoryId: t.String(),  
        newCategoryName: t.String(),  
      }),
      detail: {
        tags: ["Specifications"],
        description: "Edit the name of an existing category by ID",
      },
    }
  )
  
  .patch(
    "/editfields",
    async ({ set, body }) => {
      try {
        const { category, fields } = body;
  
        const existingCategory = await SpecificationModel.findOne({ category });
  
        if (!existingCategory) {
          set.status = 404;
          return {
            message: "Category not found",
            ok: false,
          };
        }
  
        existingCategory.fields = fields;
        await existingCategory.save();
  
        set.status = 200;
        return {
          message: "Category fields updated successfully",
          ok: true,
        };
      } catch (error: any) {
        set.status = 400;
        console.error("Error updating category fields:", error);
        return {
          ok: false,
          message: error.message,
        };
      }
    },
    {
      body: t.Object({
        category: t.String(), 
        fields: t.Array(t.String()),       }),
      detail: {
        tags: ["Specifications"],
        description: "Edit the fields for a given category",
      },
    }
  )
  
  .post(
    "/deletecategory",
    async ({ set, body }) => {
      try {
        const { category } = body;
  
        const result = await SpecificationModel.findOneAndDelete({ category });
  
        if (!result) {
          set.status = 404;
          return { message: "Category not found", ok: false };
        }
  
        set.status = 200;
        return {
          message: "Category deleted successfully",
          ok: true,
        };
      } catch (error: any) {
        set.status = 400;
        console.error("Error deleting category:", error);
        return { ok: false, message: error.message };
      }
    },
    {
      body: t.Object({
        category: t.String(),
      }),
      detail: {
        tags: ["Specifications"],
        description: "Delete a category",
      },
    }
  )
  .post(
    "/deletefield",
    async ({ set, body }) => {
      try {
        const { category, field } = body;
  
        const result = await SpecificationModel.updateOne(
          { category },
          { $pull: { fields: field } }  
        );
  
        if (result.modifiedCount === 0) {
          set.status = 404;
          return { message: "Category not found or field not present", ok: false };
        }
  
        set.status = 200;
        return {
          message: "Field deleted successfully",
          ok: true,
        };
      } catch (error: any) {
        set.status = 400;
        console.error("Error deleting field:", error);
        return { ok: false, message: error.message };
      }
    },
    {
      body: t.Object({
        category: t.String(),
        field: t.String(),
      }),
      detail: {
        tags: ["Specifications"],
        description: "Delete a field from a category",
      },
    }
  )
  .get(
    "/get/general-spec",
    async ({ set }) => {
      try {
        const generalSpecs = await GeneralSpecModel.find();
  
        if (generalSpecs.length === 0) {
          set.status = 404; 
          return {
            message: "No general specifications found.",
            ok: false,
          };
        }
  
        set.status = 200;
        return {
          message: "General specifications retrieved successfully.",
          ok: true,
          data: generalSpecs,
        };
  
      } catch (error:any) {
        set.status = 500; 
        console.error("Error fetching General Specifications:", error);
        return {
          ok: false,
          message: error.message || "An error occurred while fetching the specifications.",
        };
      }
    },
    {
      detail: {
        tags: ["General Specifications"],
        description: "Fetch all general specifications.",
      },
    }
  )
  .post(
    "/add/general-spec",
    async ({ set, body }) => {
      try {
        const { General } = body;
  
        if (!Array.isArray(General)) {
          set.status = 400;
          return {
            message: 'Invalid input. "General" must be an array.',
            ok: false,
          };
        }
  
        let generalSpec = await GeneralSpecModel.findOne();
  
        if (generalSpec) {
         
          const duplicateFields = General.filter(field =>
            generalSpec.General.includes(field)
          );
  
          if (duplicateFields.length > 0) {
            set.status = 409;
            return {
              message: `${duplicateFields.join(", ") } already exists`,
              ok: false,
            };
          }
  
          const newFields = General.filter(field => !generalSpec.General.includes(field));
  
          if (newFields.length === 0) {
            set.status = 409;
            return {
              message: "All fields already exist in the General Specification.",
              ok: false,
            };
          }
  
          generalSpec.General.push(...newFields);
          await generalSpec.save();
  
          set.status = 200;
          return {
            message: "New fields added successfully to the existing General Specification.",
            ok: true,
            data: generalSpec,
          };
        } else {
          const newGeneralSpec = new GeneralSpecModel({
            General: General,
          });
          await newGeneralSpec.save();
  
          set.status = 201;
          return {
            message: "General Specification created successfully.",
            ok: true,
            data: newGeneralSpec,
          };
        }
      } catch (error) {
        set.status = 500;
        console.error("Error creating/updating General Specification:", error);
        return {
          ok: false,
          message: error.message || "An error occurred while processing the request.",
        };
      }
    },
    {
      body: t.Object({
        General: t.Array(t.String()),
      }),
      detail: {
        tags: ["General Specifications"],
        description: "Add new fields to an existing General Specification or create a new one if none exists",
      },
    }
  )
  .post(
    "/delete/general-spec",
    async ({ set, body }) => {
      try {
        const { field } = body;
  
        if (!field || typeof field !== "string") {
          set.status = 400;
          return {
            message: 'Invalid input. "field" must be a non-empty string.',
            ok: false,
          };
        }
  
        let generalSpec = await GeneralSpecModel.findOne();
  
        if (!generalSpec || !generalSpec.General.includes(field)) {
          set.status = 404;
          return {
            message: "The specified field does not exist in the General Specification.",
            ok: false,
          };
        }
  
        generalSpec.General = generalSpec.General.filter(existingField => existingField === field ? false : true);
  
        await generalSpec.save();
  
        set.status = 200;
        return {
          message: "Field deleted successfully from the General Specification.",
          ok: true,
          data: generalSpec,
        };
      } catch (error:any) {
        set.status = 500;
        console.error("Error deleting field from General Specification:", error);
        return {
          ok: false,
          message: error.message || "An error occurred while processing the request.",
        };
      }
    },
    {
      body: t.Object({
        field: t.String(),
      }),
      detail: {
        tags: ["General Specifications"],
        description: "Delete a specific field from the existing General Specification",
      },
    }
  )
  .post(
    "/add/category",
    async ({ set, body }) => {
      try {
        const { Category, image } = body;
  
        let filename = "";
  
        if (image) {
          const { ok, filename: savedFilename } = await saveFile(image, "categories");
          if (!ok) {
            set.status = 400;
            return { message: "Error uploading image.", ok: false };
          }
          filename = savedFilename;
        }
  
        // Check if the categoryName already exists in the database
        const existingCategory = await CategoryModel.findOne({ categoryName: Category });
  
        if (existingCategory) {
          set.status = 409;
          return {
            message: `${Category} category already exists.`,
            ok: false,
          };
        }
  
        // Create a new category document
        const newCategoryData = new CategoryModel({
          categoryName: Category,
          image: filename ,
          isDeleted: false, // Default to false
          active: true, // Default to true
        });

        await newCategoryData.save();
  
        set.status = 201;
        return {
          message: "Category created successfully.",
          ok: true,
          data: newCategoryData,
        };
      } catch (error:any) {
        set.status = 500;
        console.error("Error adding category:", error);
        return {
          ok: false,
          message: error.message || "An error occurred while processing the request.",
        };
      }
    },
    {
      body: t.Object({
        Category: t.String(),
        image: t.File(),
      }),
      detail: {
        tags: ["Category"],
        description: "Add a single category with an image.",
      },
    }
  )
  
  .get(
    "/get/category",
    async ({ set }) => {
      try {
        const Category = await CategoryModel.find({ isDeleted: false }).sort({ createdAt: -1 }).lean();
  
        if (Category.length === 0) {
          set.status = 404; 
          return {
            message: "No Category found.",
            ok: false,
          };
        }
  
        set.status = 200;
        return {
          message: "Category retrieved successfully.",
          ok: true,
          data: Category,
        };
  
      } catch (error:any) {
        set.status = 500; 
        console.error("Error fetching Category:", error);
        return {
          ok: false,
          message: error.message || "An error occurred while fetching the Category.",
        };
      }
    },
    {
      detail: {
        tags: ["Category"],
        description: "Fetch all Category.",
      },
    }
  )
  .post(
    "/category-update/:id",
    async ({ params, body, set }) => {
      try {
        const { id } = params;
        const { categoryName, image} = body;
        let filename = "";
        
        if (image) {
          const { ok, filename: savedFilename } = await saveFile(image, "categories");
          if (!ok) {
            set.status = 400;
            return { message: "Something went wrong with image upload", ok: false };
          }
          filename = savedFilename;
        }
        
        const updatedCategory = await CategoryModel.findByIdAndUpdate(
          id,
          {
            categoryName: categoryName,
            image: filename || undefined,
          },
          { new: true }
        );
        
        if (!updatedCategory) {
          set.status = 404;
          return { message: "category not found", ok: false };
        }
        
        set.status = 200;
        return { message: "category updated successfully", ok: true, category: updatedCategory };
      } catch (error:any) {
        set.status = 500;
        console.error(error);
        return { message: error.message, ok: false };
      }
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        categoryName: t.Optional(t.String()),
        image: t.Optional(t.File()),
      }),
      detail: { tags: ["Categories"], description: "Update a Category by ID with a single image" },
    }
  )
  .delete(
    "/category/:id",
    async ({ params, query }) => {
      try {
        const { id } = params;
        const { permanent } = query;
  
        const category = await CategoryModel.findById(id);
  
        if (!category) {
          return { message: "Category not found", status: false };
        }
  
        if (permanent) {
          category.active = false;
          category.isDeleted = true;
  
          await category.save();
  
          return {
            message: "Category deleted permanently",
            status: true,
          };
        }
  
        category.active = !category.active;
  
        await category.save();
  
        return {
          message: `Category ${
            category.active ? "activated" : "deactivated"
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
        summary: "Delete Category by ID",
      },
    }
  )
  