import Elysia, { t } from "elysia";
import { CounterModel, UserModel } from "../../../models/admin/user";
import {jwt} from "../../../lib/jwt";
import { deleteFile,  saveFile } from "../../../lib/file";
import {CreateUserDto} from "../../../dto/user-types" 

interface UserQuery {
    page?: string;
    limit?: string;
    role?: string;
    q?: string;
  }
  export const UserController = new Elysia({
    prefix: "/users",
  
  })
  .get(
    "/get",
    async ({ query, set }) => {
      try {
        const { id } = query; 
        
        if (!id) {
          set.status = 400;
          return {
            message: "ID is required",
            ok: false,
          };
        }
  
        const user: any = await UserModel.findOne(
          { _id: id },
          "-password -createdAt -updatedAt"
        ).populate({
          path: 'orders',  
          select: 'orderId grandTotal status products', 
          populate: {
            path: 'products.productId', 
            select: 'productName customerPrice productCode' 
          }
        });
  
        if (!user) {
          set.status = 404;
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
      query: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["User Admin"],
        description: "Get User by ID",
      },
    }
  )
  .delete(
    "/delete",
    async ({ query, set }) => {
      try {
        const { id } = query;
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
      query: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["User"],
        description: "Delete a User",
      },
    }
  )

  .put(
    "/update",
    async ({ set, body,query }) => {
      try {
        const{id} = query;
        const {
        //  mobileNumber,
          profileImage,
          username,
        } = body;


        const user= await UserModel.findById(id) ;
   
        if (!user) {
          set.status = 400;
          return {
            message: "user not found",
            ok: false,
          };
        }
        let filename = user.profileImage;
        if (
          profileImage &&
          profileImage !== "undefined" &&
          profileImage !== "null"
        ) 
        {
          let { ok, filename: _ } = await saveFile(profileImage, "users");
  
          if (!ok) {
            set.status = 400;
            return {
              message: "Something went wrong while uploading profile image",
              ok: false,
            };
          }
          filename = _ as string;
          deleteFile(user.profileImage);
        }
      
         // user.mobileNumber =mobileNumber||user.mobileNumber
          user.profileImage =filename||user.profileImage
          user.username =username||user.username
    
          await user.save();

        set.status = 200;

        return {
          message: "User updated successfully",
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
      query: t.Object({
       id: t.String(),
      }),
      body: t.Object({
       // mobileNumber:t.Optional(t.String()),
        profileImage:t.Optional(t.Any()),
        username: t.Optional(t.String()),
      }),
      detail: {
        tags: ["user"],
        description: "Update a user",
      },
    }
  )
  .get(
    "/getAddress",
    async (ctx) => {
      const { set, query } = ctx;
      try {
        const { id } = query;
  
        if (!id) {
          set.status = 400;
          return { message: "Customer ID is required", ok: false };
        }
  
        const customer = await UserModel.findById(id);
        if (!customer) {
          set.status = 404;
          return { message: `Customer not found: ${id}`, ok: false };
        }
  
        if (!Array.isArray(customer.deliveryAddress) || customer.deliveryAddress.length === 0) {
          set.status = 404;
          return { message: `No delivery address found for customer: ${id}`, ok: false };
        }
  
        const deliveryAddress = Object.values(customer.deliveryAddress);
  
        set.status = 200;
        console.log('Address fetched');
        return {
          message: "Delivery addresses found",
          ok: true,
          deliveryAddress,
        };
  
      } catch (error:any) {
        set.status = 500;
        console.log(error);
        return { message: error.message, ok: false };
      }
    },
    {
      query: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Users", "Address"],
        description: "Fetch a user's delivery address by customer ID from query params",
      },
    }
  )
  
  

  .delete(
    "/deleteAddress",
    async (ctx) => {
      const { set, query } = ctx;
      try {
        const { customerId, addressId } = query;
  
        if (!customerId || !addressId) {
          set.status = 400;
          return { message: "Customer ID and Address ID are required", ok: false };
        }
  
        const customer = await UserModel.findById(customerId);
        if (!customer) {
          set.status = 404;
          return { message: `Customer not found: ${customerId}`, ok: false };
        }
  
        if (!customer.deliveryAddress || customer.deliveryAddress.length === 0) {
          set.status = 404;
          return { message: `No delivery address found for customer: ${customerId}`, ok: false };
        }
  
        const addressIndex = customer.deliveryAddress.findIndex((address) => address._id.toString() === addressId.toString());
  
        if (addressIndex === -1) {
          set.status = 404;
          return { message: `Address with ID ${addressId} not found`, ok: false };
        }
  
        customer.deliveryAddress.splice(addressIndex, 1);
  
        await customer.save();
  
        set.status = 200;
        return {
          message: "Delivery address deleted successfully",
          ok: true,
        };
      } catch (error:any) {
        set.status = 500; 
        return { message: error.message, ok: false };
      }
    },
    {
      query: t.Object({
        customerId: t.String(), 
        addressId: t.String(), 
      }),
      detail: {
        tags: ["Users", "Address"],
        description: "Delete a user's delivery address by address ID and customer ID",
      },
    }
  );
  
  

  
  
  
  