import Elysia, { t } from "elysia";
import { ProductModel } from "../../../models/admin/products/product";
import { CategoryModel } from "../../../models/admin/products/category";


export const UserProductController = new Elysia({
  prefix: "/products",
})


.get(
  "/all",
  async ({ query, set }) => {
    try {
      let { page, limit, q } = query;
      let products = null;
      let count = 0;

      const fetchQuery = { active: true, isDeleted: false };

      if (q) {
        fetchQuery.$or = [
          {
            productName: {
              $regex: q,
              $options: "i",
            },
          },
          {
            brand: {
              $regex: q,
              $options: "i",
            },
          },
        ];
      }

      count = await ProductModel.countDocuments(fetchQuery);

      // Populate category field when fetching products
      if (page && limit) {
        let _page = parseInt(page);
        let _limit = parseInt(limit);

        products = await ProductModel.find(fetchQuery)
          .skip((_page - 1) * _limit)
          .limit(_limit)
          .sort({ createdAt: 1 })
          .populate('category') // Populating the category field
          .lean();
      } else {
        products = await ProductModel.find(fetchQuery)
          .sort({ createdAt: 1 })
          .populate('category') // Populating the category field
          .lean();

        count = await ProductModel.countDocuments(fetchQuery);
      }

      set.status = 200;
      return {
        message: "Products fetched successfully",
        ok: true,
        products,
        total: count,
      };

    } catch (error: any) {
      set.status = 400;
      console.error(error);
      return {
        message: error.message,
        ok: false,
      };
    }
  },
  {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      q: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Products"],
      description: "Get all products sorted by date created in ascending order.",
    },
  }
)

.get(
  "/newProduct",
  async ({ query, set }) => {
    try {
      let { page, limit, q } = query;
      let products: any = null;
      let count = 0;

      const fetchQuery: any = { active: true, isDeleted: false };

      if (q) {
        fetchQuery.$or = [
          {
            productName: {
              $regex: q,
              $options: "i",
            },
          },
        ];
      }
      count = await ProductModel.countDocuments(fetchQuery);

      if (page && limit) {
        let _page = parseInt(page);
        let _limit = parseInt(limit);

        products = await ProductModel.find(fetchQuery)
          .skip((_page - 1) * _limit)
          .limit(_limit)
          .sort({ createdAt: -1 })
          .lean();
      } else {
        products = await ProductModel.find(fetchQuery)
          .sort({ createdAt: -1 })
          .lean();

        count = await ProductModel.countDocuments(fetchQuery);
      }
      set.status = 200;
      return {
        message: "Products fetched successfully",
        ok: true,
        products,
        total: count,
      };

    } catch (error: any) {
      set.status = 400;
      console.error(error);
      return {
        message: error.message,
        ok: false,
      };
    }
  },
  {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      q: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Products"],
      description: "Get all products",
    },
  }
)


.get(
  "/get",
  async ({ query, set }) => {
    try {
      const { id } = query; 

      if (!id) {
        set.status = 400;
        return {
          message: "Product ID is required",
          ok: false,
        };
      }

      const product: any = await ProductModel.findOne({ _id: id }).populate("category");
      if (!product) {
        set.status = 404;
        return {
          message: "Product not found",
          ok: false,
        };
      }

      set.status = 200;
      return {
        message: "Product fetched successfully",
        ok: true,
        data: product,
      };
    } catch (error: any) {
      set.status = 400;
      console.error(error);
      return {
        message: error.message,
        ok: false,
      };
    }
  },
  {
    query: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ["product:get"],
      description: "Get Product by query parameter",
    },
  }
)

.get(
  "/category",
  async ({ set }) => {
    try {
      const Category = await CategoryModel.find();

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
.get(
  "/getProducts-category",
  async ({ set, query }) => {
    try {
      const { categoryName, priceSort, dateSort, q } = query;

      if (!categoryName) {
        set.status = 400;
        return {
          message: "Category name is required.",
          ok: false,
        };
      }

      // Fetch the category by name from the CategoryModel
      const category = await CategoryModel.findOne({ categoryName });

      if (!category) {
        set.status = 404;
        return {
          message: `Category with name "${categoryName}" not found.`,
          ok: false,
        };
      }

      // Use the category's _id to filter products
      const filterQuery: any = {
        category: category._id,  // Use category _id from CategoryModel
        active: true,
      };

      if (q) {
        filterQuery.productName = { $regex: q, $options: "i" };
      }

      let sortQuery: any = {};

      // Sorting based on price
      if (priceSort === "lowToHigh") {
        sortQuery.customerPrice = 1;
      } else if (priceSort === "highToLow") {
        sortQuery.customerPrice = -1;
      }

      // Sorting based on date
      if (dateSort === "newestFirst") {
        sortQuery.createdAt = -1;
      } else if (dateSort === "oldestFirst") {
        sortQuery.createdAt = 1;
      }

      // Fetch products by category and apply sorting
      const products = await ProductModel.find(filterQuery).sort(sortQuery).lean();

      if (products.length === 0) {
        set.status = 200;
        return {
          message: `No product available for the category "${categoryName}".`,
          ok: true,
          data: [],
          count: 0,
        };
      }

      set.status = 200;
      return {
        message: `Products retrieved successfully for the category "${categoryName}".`,
        ok: true,
        data: products,
        count: products.length,
      };
    } catch (error: any) {
      set.status = 500;
      console.error("Error fetching active products by category:", error);
      return {
        ok: false,
        message: error.message || "An error occurred while fetching active products by category.",
      };
    }
  },
  {
    detail: {
      tags: ["Products"],
      description: "Fetch active products by category name, with optional product name search and sorting options.",
    },
  }
)


