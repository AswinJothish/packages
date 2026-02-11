import Elysia, { t } from "elysia";
import { CounterModel, UserModel } from "../../models/admin/user";
import {jwt} from "../../lib/jwt";
import { deleteFile,  saveFile } from "../../lib/file";
import {CreateUserDto} from "../../dto/user-types" 

interface UserQuery {
  page?: string;
  limit?: string;
  role?: string;
  q?: string;
}
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

export const User_Controller = new Elysia({
  prefix: "/users",

})
.post(
  '/create',
  async ({ body, set }) => {
    try {
      const { mobileNumber, role, username, deliveryAddress } = body;

      const userid = await generateUserId();
      let parsedDeliveryAddresses: any[] = [];
     
      if (Array.isArray(deliveryAddress)) {
        parsedDeliveryAddresses = deliveryAddress; 
      } else if (typeof deliveryAddress === 'string') {
        try {
          parsedDeliveryAddresses = JSON.parse(deliveryAddress);
        } catch (error) {
          set.status = 400;
          return {
            message: 'Invalid JSON format for deliveryAddress',
            ok: false,
          };
        }
      } else {
        set.status = 400;
        return {
          message: 'Expected array for deliveryAddress',
          ok: false,
        };
      }

      const existingUser = await UserModel.findOne({
        $or: [{ username }, { mobileNumber }],
      });

      if (existingUser) {
        set.status = 400;
        return {
          message: 'User with this username or mobile number already exists',
          ok: false,
        };
      }

      const newUser = new UserModel({
        username,
        mobileNumber,
        role,
        userid,
        deliveryAddress: parsedDeliveryAddresses,
        active: true,
      });

      await newUser.save(); 

      return {
        message: 'User created successfully',
        ok: true,
      };
    } catch (error: any) {
      console.error(error);
      set.status = 400;
      return {
        ok: false,
        message: error.message,
      };
    }
  },
  {
    detail: {
      tags: ['Users'],
      description: 'Create a new User',
    },
    body: t.Object({
      mobileNumber: t.String(),
      role: t.String(),
      username: t.String(),
      deliveryAddress: t.Union([t.Array(t.Any()), t.String()]),
    }),
  }
)
  .get(
    "/all",
    async ({ query, set, headers, request }) => {
      try {
        let { page, limit, role, q } = query;
        let users:any = null;
        let count = 0;
  
      
        const fetchQuery:any = { active: true };
  
        if (role && role !== "all") {
          fetchQuery.role = role;
        }
  
    
        if (q) {
          fetchQuery.$or = [
            {
              username: {
                $regex: q,
                $options: "i",
              },
            },
            {
              userid: {
                $regex: q,
                $options: "i",
              },
            },
            {
              mobileNumber: {
                $regex: q,
                $options: "i",
              },
            },
          ];
        }
  
     
        count = await UserModel.countDocuments(fetchQuery);
  
   
        if (page && limit) {
          const _page = parseInt(page);
          const _limit = parseInt(limit);
  
          users = await UserModel.find(fetchQuery)
            .skip((_page - 1) * _limit)
            .limit(_limit)
            .sort({ createdAt: -1 })
            .lean();
        } else {
          
          users = await UserModel.find(fetchQuery)
            .sort({ createdAt: -1 })
            .lean();
        }
  
        set.status = 200;
        return {
          message: "Users fetched successfully",
          ok: true,
          users,
          total: count,
        };
      } catch (error:any) {
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
        role: t.Optional(t.String()),
        q: t.Optional(t.String()),
      }),
      detail: {
        tags: ["User Admin"],
        description: "Get all users",
      },
    }
  )


  .get(
    "/get/:id",
    async ({ params, set }) => {
      try {
        const { id } = params;
        
        const user: any = await UserModel.findOne(
          { _id: id },
          "-password -createdAt -updatedAt"
        ).populate({
          path: 'orders',  
          select: 'orderId grandTotal status products', 
          populate: {
            path: 'products.productId', 
            select: 'productName price productCode' 
          }
        });
  
        if (!user) {
          set.status = 400;
          return {
            message: "User not found",
            ok: false,
          };
        }
  
        set.status = 200;
        return {
          message: "User fetched successfully",
          ok: true,
          data: user,
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
        tags: ["User Admin"],
        description: "Get User by id",
      },
    }
  )
  

  

  //update user
  // .put(
  //   "/update/:id",
  //   async ({ set, body,params }) => {
  //     try {
  //       const{id} = params;
  //       const {
  //         email,
  //         mobileNumber,
  //         profileImage,
  //         role,
  //         userid,
  //         username,
  //       } = body;


  //       const user= await UserModel.findById(id) ;
   
  //       if (!user) {
  //         set.status = 400;
  //         return {
  //           message: "user not found",
  //           ok: false,
  //         };
  //       }
  //       let filename = user.profileImage;
  //       if (
  //         profileImage &&
  //         profileImage !== "undefined" &&
  //         profileImage !== "null"
  //       ) 
  //       {
  //         let { ok, filename: _ } = await saveFile(profileImage, "users");
  
  //         if (!ok) {
  //           set.status = 400;
  //           return {
  //             message: "Something went wrong while uploading profile image",
  //             ok: false,
  //           };
  //         }
  //         filename = _ as string;
  //         deleteFile(user.profileImage);
  //       }
      
  //         user.email =email||user.email
  //         user.mobileNumber =mobileNumber||user.mobileNumber
  //         user.role =role||user.role
  //         user.profileImage =filename||user.profileImage
  //         user.userid =userid||user.userid
  //         user.username =username||user.username
    
  //         await user.save();

  //       set.status = 200;

  //       return {
  //         message: "User updated successfully",
  //         ok: true,
  //       };
  //     } catch (error: any) {
  //       set.status = 400;
  //       return {
  //         message: error.message,
  //         ok: false,
  //       };
  //     }
  //   },
  //   {
  //     params: t.Object({
  //      id: t.String(),
  //     }),
  //     body: t.Object({
  //       email: t.Optional(t.String()),
  //       mobileNumber:t.Optional(t.String()),
  //       role: t.Optional(t.String()),
  //       profileImage:t.Optional(t.Any()),
  //       userid: t.Optional(t.String()),
  //       username: t.Optional(t.String()),
  //     }),
  //     detail: {
  //       tags: ["user"],
  //       description: "Update a user",
  //     },
  //   }
  // )


  .delete(
    "/:id",
    async ({ params, set }) => {
      try {
        const { id } = params;
        const product:any = await UserModel.findOneAndUpdate({ _id: id }, { active: false });
        set.status = 200;
        if (!product) {
          set.status = 400;
          return {
            message: "User not found",
            ok: false,
          };
        }
        return {
          message: "User deleted successfully",
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
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["User"],
        description: "Delete a User",
      },
    }
  )
 

  .post(
    "/AddAddress",
    async (ctx) => {
      const { body, set } = ctx;
      try {
        const { customerId, tag, address } = body;
  
        const customer = await UserModel.findById(customerId);
        if (!customer) {
          set.status = 404;
          return { message: `Customer not found: ${customerId}`, ok: false };
        }
  
        customer.deliveryAddress.push({ tag, address });
  
        await customer.save();
  
        set.status = 200;
        return {
          message: `Address for tag '${tag}' added successfully`,
          ok: true,
        };
      } catch (error:any) {
        set.status = 400;
        return { message: error.message, ok: false };
      }
    },
    {
      body: t.Object({
        customerId: t.String(),
        tag: t.String(),    
        address: t.Any(),    
      }),
      detail: {
        tags: ["Users", "Address"],
        description: "Add a new address entry for a specific tag.",
      },
    }
  )                   
 

 




