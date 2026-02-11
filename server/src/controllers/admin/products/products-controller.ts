import Elysia, { t } from "elysia";
import { CreateProductDto } from "../../../dto/product-types";
import { ProductModel } from "../../../models/admin/products/product";
import { deleteFile, saveFile } from "../../../lib/file";
import { CategoryModel } from "../../../models/admin/products/category";


export const ProductController = new Elysia({
  prefix: "/products",
})

.post("/create", async ({ set, body }) => {
  try {
      const {
          productName,
          productCode,
          brand,
          description,
          purchasedPrice,
          customerPrice,
          dealerPrice,
          strikePrice,
          general,
          stock,
          category,
          productImages,
          specifications,
          offers,
      } = body;

      // Handle images
      const imagesArray = Array.isArray(productImages) ? productImages : productImages ? [productImages] : [];
      let filenames = [];

      if (imagesArray.length > 0) {
          for (const image of imagesArray) {
              if (image) {
                  let { ok, filename } = await saveFile(image, "products");
                  if (!ok) {
                      set.status = 400;
                      return {
                          message: "Something went wrong with image upload",
                          ok: false,
                      };
                  }
                  filenames.push(filename);
              }
          }
      }

      // Parse specifications
      let parsedSpecifications = {};
      try {
          parsedSpecifications = specifications ? JSON.parse(specifications) : {};
      } catch (error) {
          set.status = 400;
          return {
              message: "Invalid JSON format for specifications",
              ok: false,
          };
      }

      // Parse general details
      let parsedGeneral = {};
      try {
          parsedGeneral = general ? JSON.parse(general) : {};
      } catch (error) {
          set.status = 400;
          return {
              message: "Invalid JSON format for general",
              ok: false,
          };
      }

      // Parse offers
      let parsedOffers = [];
      if (offers) {
          try {
             
              if (typeof offers === 'object' && !Array.isArray(offers)) {
                  parsedOffers = [offers];
              } else if (typeof offers === 'string') {
                  const parsed = JSON.parse(offers);
                  parsedOffers = Array.isArray(parsed) ? parsed : [parsed];
              } else {
                  throw new Error("Invalid format for offers");
              }
          } catch (error) {
              set.status = 400;
              return {
                  message: "Invalid format for offers",
                  ok: false,
              };
          }
      }

      const newProduct = new ProductModel({
          productName,
          productCode,
          brand,
          productImages: filenames,
          description,
          purchasedPrice,
          customerPrice,
          dealerPrice,
          strikePrice,
          general: parsedGeneral,
          stock,
          category,
          specifications: parsedSpecifications,
          offers: parsedOffers, // Save the parsed offers
      });

      await newProduct.save();

      set.status = 200;
      return {
          message: "Product created successfully",
          ok: true,
      };
  } catch (error:any) {
      set.status = 400;
      console.error(error);
      return {
          ok: false,
          message: error.message,
      };
  }
}, {
  detail: {
      tags: ["Products"],
      description: "Create a new product",
  },
  body: t.Object({
      productName: t.String(),
      productCode: t.String(),
      productImages: t.Optional(t.Union([t.File(), t.Array(t.File())])),
      description: t.Optional(t.String()),
      brand: t.Optional(t.String()),
      general: t.Optional(t.String()),
      stock: t.Optional(t.String()),
      category: t.Optional(t.String()),
      purchasedPrice: t.Optional(t.String()),
      customerPrice: t.Optional(t.String()),
      dealerPrice: t.Optional(t.String()),
      strikePrice: t.Optional(t.String()),
      specifications: t.Optional(t.String()),
      offers: t.Optional(t.Any()), // Use Any type to allow manual processing of JSON data
  }),
})

.get(
  "/all",
  async ({ query, set }) => {
    try {
      let { page, limit, category, categoryName, q } = query;
      let products: any = null;
      let count = 0;

      // Initialize fetch query for active products (isDeleted: false)
      const fetchQuery: any = { isDeleted: false }

      // Add search functionality based on the query 'q'
      if (q) {
        fetchQuery.$or = [
          {
            productName: {
              $regex: q,
              $options: "i",
            },
          },
          {
            productCode: {
              $regex: q,
              $options: "i",
            },
          },
        ];
      }

      // Handle category filtering dynamically by category or categoryName
      if (category) {
        if (category !== "all") {
          // If category is provided, find the category by categoryName
          const categoryDoc = await CategoryModel.findOne({ categoryName: category });
          if (categoryDoc) {
            fetchQuery.category = categoryDoc._id;  // Filter by category _id
          } else {
            // If category does not exist, return empty products
            set.status = 404;
            return {
              message: "Category not found",
              ok: false,
            };
          }
        }
      }

      // Handle filtering by categoryName if provided (search for specific category)
      if (categoryName) {
        if (categoryName !== "all") {
          const category = await CategoryModel.findOne({ categoryName });
          if (category) {
            fetchQuery.category = category._id;  // Update fetchQuery with category _id from categoryName
          }
        }
      }

      // Count the total number of documents matching the query
      count = await ProductModel.countDocuments(fetchQuery);

      // Pagination logic
      if (page && limit) {
        let _page = parseInt(page);
        let _limit = parseInt(limit);

        products = await ProductModel.find(fetchQuery)
          .skip((_page - 1) * _limit)
          .limit(_limit)
          .sort({ createdAt: -1 })
          .lean()
          .populate("category");
      } else {
        products = await ProductModel.find(fetchQuery)
          .sort({ createdAt: -1 })
          .lean()
          .populate("category");
      }

      // Set response status and return products
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
      category: t.Optional(t.String()),  // Can be category name or category ID
      categoryName: t.Optional(t.String()), // Category name filter
      q: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Products"],
      description: "Get all products with optional category and search filters",
    },
  }
)





.get(
    "/get/:id",
    async ({ params, set }) => {
      try {
        const { id } = params;
        const product: any = await ProductModel.findOne(
          {
           _id: id,
          },"-password"
        );

        if (!product) {
          set.status = 400;
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
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["product:id"],
        description: "Get Product by id",
      },
    }
  )

  .delete(
    "/status-inactive/:id",
    async ({ params, set }) => {
      try {
        const { id } = params;
  
        // Attempt to find and update the product
        const product: any = await ProductModel.findOneAndUpdate(
          { _id: id }, 
          { active: false }
        );
  
        if (!product) {
          set.status = 404; // Not Found
          return {
            message: "Product not found",
            ok: false,
          };
        }
  
        set.status = 200; // OK
        return {
          message: "Product status changed successfully",
          ok: true,
        };
      } catch (error: any) {
        set.status = 500; // Internal Server Error
        return {
          message: error.message,
          ok: false,
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Product"],
        description: "Change product status to inactive",
      },
    }
  )
  .delete(
    "/status-active/:id",
    async ({ params, set }) => {
      try {
        const { id } = params;
  
        // Attempt to find and update the product
        const product: any = await ProductModel.findOneAndUpdate(
          { _id: id }, 
          { active: true },
        );
  
        if (!product) {
          set.status = 404; // Not Found
          return {
            message: "Product not found",
            ok: false,
          };
        }
  
        set.status = 200; // OK
        return {
          message: "Product status changed successfully",
          ok: true,
        };
      } catch (error: any) {
        set.status = 500; // Internal Server Error
        return {
          message: error.message,
          ok: false,
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Product"],
        description: "Change product status to active",
      },
    }
  )


  .post('/update-image', async ({ set, body }) => {
    try {
        const { productId, imageUrls, imageFiles } = body;

        if (!productId) {
            set.status = 400;
            return {
                message: 'Product ID is required',
                ok: false,
            };
        }

        // Ensure imageUrls and imageFiles are arrays
        const processedImageUrls = Array.isArray(imageUrls) ? imageUrls.filter(url => url) : (imageUrls ? [imageUrls] : []);
        const processedImageFiles = Array.isArray(imageFiles) ? imageFiles : (imageFiles ? [imageFiles] : []);

        const filenames: string[] = [];
        
        // Process imageFiles to save them and add to filenames array
        if (processedImageFiles.length > 0) {
            for (const file of processedImageFiles) {
                if (file instanceof File) {
                    const { ok, filename } = await saveFile(file, 'products');
                    if (!ok) {
                        set.status = 400;
                        return {
                            message: 'Error saving image file',
                            ok: false,
                        };
                    }
                    filenames.push(filename);
                }
            }
        }

        // Combine the processedImageUrls and filenames arrays
        const allImages = [...processedImageUrls, ...filenames].filter(image => image); // Filter out any null or empty values

        // Update the product images in the database
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId, 
            { productImages: allImages },
            { new: true }
        );

        if (!updatedProduct) {
            set.status = 404;
            return {
                message: 'Product not found',
                ok: false,
            };
        }

        set.status = 200;
        return {
            message: 'Product images updated successfully',
            ok: true,
            updatedProduct, 
        };
    } catch (error) {
        console.error('Error updating product images:', error);
        set.status = 500;
        return {
            message: 'Internal server error',
            ok: false,
        };
    }
},
{
    detail: {
        tags: ["productImage"],
        description: "Update the product images",
    },
    body: t.Object({
        productId: t.String(),
        imageUrls: t.Optional(t.Union([t.String(), t.Array(t.String())])), 
        imageFiles: t.Optional(t.Union([t.File(), t.Array(t.File())])), 
    }),
})


.post("/update/:id", async ({ params,set, body }) => {
  try {
    const { id } = params;
      const {
          productName,
          productCode,
          brand,
          description,
          purchasedPrice,
          customerPrice,
          dealerPrice,
          strikePrice,
          stock,
          category,
          general,
          specifications,
          offers,
      } = body;

      let parsedOffers = [];
    if (offers) {
      try {
        if (typeof offers === 'object' && !Array.isArray(offers)) {
          parsedOffers = [offers];
        } else if (typeof offers === 'string') {
          const parsed = JSON.parse(offers);
          parsedOffers = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          throw new Error("Invalid format for offers");
        }
      } catch (error) {
        set.status = 400;
        return {
          message: "Invalid format for offers",
          ok: false,
        };
      }
    }
      let parsedSpecifications = {};
      try {
          parsedSpecifications = specifications ? JSON.parse(specifications) : {};
      } catch (error) {
          set.status = 400;
          return {
              message: "Invalid JSON format for specifications",
              ok: false,
          };
      }

      let parsedGeneralDetails = {};
      try {
        parsedGeneralDetails = general ? JSON.parse(general) : {};
      } catch (error) {
        set.status = 400;
        return {
          message: "Invalid JSON format for general details",
          ok: false,
        };
      }

      console.log("Parsed General Details:", parsedGeneralDetails);

      const existingProduct:any = await ProductModel.findById(id);

      if (!existingProduct) {
          set.status = 404;
          return {
              message: "Product not found",
              ok: false,
          };
      }
    
      existingProduct.productName = productName || existingProduct.productName;
      existingProduct.productCode = productCode || existingProduct.productCode;
      existingProduct.brand = brand || existingProduct.brand;
      existingProduct.description = description || existingProduct.description;
      existingProduct.purchasedPrice = purchasedPrice || existingProduct.purchasedPrice;
      existingProduct.customerPrice = customerPrice || existingProduct.customerPrice;
      existingProduct.dealerPrice = dealerPrice || existingProduct.dealerPrice;
      existingProduct.strikePrice = strikePrice || existingProduct.strikePrice;
      existingProduct.specifications = parsedSpecifications || existingProduct.specifications;
existingProduct.category=category || existingProduct.category;
existingProduct.stock=stock || existingProduct.stock;
existingProduct.general = parsedGeneralDetails || existingProduct.general; 
existingProduct.offers = parsedOffers.length > 0 ? parsedOffers : existingProduct.offers; 

      await existingProduct.save();

      set.status = 200;
      return {
          message: "Product updated successfully",
          ok: true,
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
      tags: ["Products"],
      description: "Edit an existing product's details (excluding product images)",
  },
  body: t.Object({
      productName: t.Optional(t.String()),
      productCode: t.Optional(t.String()),
      brand: t.Optional(t.String()),
      description: t.Optional(t.String()),
      purchasedPrice: t.Optional(t.String()),
      customerPrice: t.Optional(t.String()),
      dealerPrice: t.Optional(t.String()),
      strikePrice: t.Optional(t.String()),
      specifications: t.Optional(t.String()), 
      category: t.Optional(t.String()), 
      stock: t.Optional(t.String()), 
      general: t.Optional(t.String()),
      offers: t.Optional(t.Any()),
  }),
})
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
.delete(
  "/product/:id",
  async ({ params, set }) => {
      try {
          const { id } = params;

          const product = await ProductModel.findOneAndUpdate(
              { _id: id },
              { $set: { isDeleted: true } },
              { new: true }
          );

          if (!product) {
              set.status = 404; 
              return {
                  message: "Product not found",
                  ok: false,
              };
          }

          set.status = 200; 
          return {
              message: "Product marked as deleted successfully",
              ok: true,
          };
      } catch (error: any) {
          set.status = 500; 
          return {
              message: error.message,
              ok: false,
          };
      }
  },
  {
      params: t.Object({
          id: t.String(),
      }),
      detail: {
          tags: ["Product"],
          description: "Soft delete a product by setting isDeleted to true",
      },
  }
);
