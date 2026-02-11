import Elysia, { t } from "elysia";
import { UserModel } from "../../../models/admin/user";
import { ProductModel } from "../../../models/admin/products/product";
import { OrderModel } from "../../../models/admin/products/orders/order";
import dayjs from 'dayjs';
import { deleteFile, saveFile } from "../../../lib/file";

export const UserOrderController = new Elysia({
    prefix: "/order",
  })
  .post('/addToCart', async ({ body }) => {
    try {
      const { userId, productId, quantity } = body;

      if (!userId || !productId || !quantity || quantity <= 0) {
        return { status: 400, message: 'User ID, product ID, and valid quantity are required' };
      }

      const product = await ProductModel.findById(productId);
      if (!product) {
        return { status: 404, message: 'Product not found' };
      }
      if (product.stock< quantity) {
        return { status: 400, message: 'Insufficient stock' };
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return { status: 404, message: 'User not found' };
      }
      const cartItem = user.cart.find(item => item.productId.toString() === productId);

      if (cartItem) {  cartItem.quantity += quantity;
      } else {
          user.cart.push({ productId, quantity });
      }
      await user.save();

      return { status: 200, message: 'Product added to cart', cart: user.cart };
    } catch (error:any) {
      return { status: 500, message: 'Server error', details: error.message };
    }
  },
{body:t.Object({
  userId: t.String(),
  productId:t.String(),
  quantity:t.Number()
}),
detail: {
  tags: ["user cart"],
  description: "adding product to cart",
  summary: "adding product  to cart",
},
})
.get('/getCartItems', async ({ query }) => {
  try {
    const { Id } = query;

    if (!Id) {
      return { status: 400, message: 'User ID is required' };
    }

    const user = await UserModel.findById(Id).populate({
      path: 'cart.productId', 
      select:'productName stock  productCode productImages customerPrice dealerPrice brand strikePrice offers'  ,
      model: ProductModel, 
    });

    if (!user) {
      return { status: 404, message: 'User not found' };
    }

    if (!user.cart || user.cart.length === 0) {
      return { status: 200, message: 'Cart is empty', cart: [] };
    }
    

    return { status: 200 ,cart:user?.cart};
  } catch (error:any) {
    return { status: 500, message: 'Server error', details: error.message };
  }
})
.delete('/deleteCartItem', async ({ query }) => {
  try {
    const { userId, cartItemId } = query;

    if (!userId || !cartItemId) {
      return { status: 400, message: 'User ID and Cart Item ID are required' };
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return { status: 404, message: 'User not found' };
    }const updatedCart = user.cart.filter(
      (item) => !item._id.equals(cartItemId)
    );

    if (updatedCart.length === user.cart.length) {
      return { status: 404, message: 'Cart item not found' };
    }

    user.cart = updatedCart;
    await user.save();

    return { status: 200, message: 'Cart item deleted successfully' };
  } catch (error: any) {
    return { status: 500, message: 'Server error', details: error.message };
  }
})


.post(
  "/create",
  async (ctx) => {
    const { body, set } = ctx;
    try {
      const {
        orderedBy,
        customerId,
        products,
        deliveryAddress, 
        deliveryCharges,
        grandTotal,
      } = body;

      const randomOrderId = `SUN_${Math.floor(10000000 + Math.random() * 90000000)}`;

      const existingOrder = await OrderModel.findOne({ orderId: randomOrderId });
      if (existingOrder) {
        return await ctx.post("/createOrder");
      }

      const customer = await UserModel.findById(customerId);
      if (!customer) {
        set.status = 404;
        return { message: `Customer not found: ${customerId}`, ok: false };
      }

      if (deliveryAddress && customer.deliveryAddress) {
        const tag = Object.keys(deliveryAddress)[0]; 
        const updatedAddress = deliveryAddress[tag];
        const existingAddress = customer.deliveryAddress[tag];

        if (JSON.stringify(existingAddress) !== JSON.stringify(updatedAddress)) {
          customer.deliveryAddress[tag] = updatedAddress;
          await customer.save();  
          console.log(`Updated address for tag: ${tag}`);
        }
      }

      const orderItems = products.map(product => ({
        productId: product.productId,
        quantity: product.quantity,
      }));

      for (const item of products) {
        const product = await ProductModel.findById(item.productId);
        if (!product) {
          set.status = 404;
          return { message: `Product not found: ${item.productId}`, ok: false };
        }
      }

      const newOrder = new OrderModel({
        orderId: randomOrderId,
        orderedBy,
        customerId: customer._id,
        orderDate: new Date(),
        products: orderItems,
        deliveryAddress,
        deliveryCharges,
        grandTotal,
        status: "pending",
      });

      await newOrder.save(); 

      customer.orders = customer.orders || []; 
      customer.orders.push(newOrder._id);
      await customer.save();

      customer.cart = []; 
      await customer.save();

      set.status = 201;
      return {
        message: "Order placed successfully and cart cleared.",
        order: newOrder,
        ok: true,
      };

    } catch (error: any) {
      set.status = 400;
      return { message: error.message, ok: false };
    }
  },
  {
    body: t.Object({
      orderedBy: t.String(),
      customerId: t.String(),
      products: t.Array(
        t.Object({
          productId: t.String(),
          quantity: t.Number(),
        })
      ),
      deliveryAddress: t.Optional(t.Any()), 
      deliveryCharges: t.Number(),
      grandTotal: t.Number(),
    }),
    detail: {
      tags: ["Orders"],
      description: "Create a new order",
    },
  }
)


.get(
  "/get",
  async ({ query, set }) => {
    const { id, status, timeFilter } = query;

    try {
      const user = await UserModel.findById(id)
        .populate({
          path: 'orders',
          populate: {
            path: 'products.productId',  
            model: 'Product',            
            select: 'productImages customerPrice dealerPrice offers productName'  
          }
        });

      if (!user) {
        set.status = 404;
        return { message: `User not found: ${id}`, ok: false };
      }

      const startOfCurrentMonth = dayjs().startOf('month').toDate();
      const startOfPreviousMonth = dayjs().subtract(1, 'month').startOf('month').toDate();
      const endOfPreviousMonth = dayjs().subtract(1, 'month').endOf('month').toDate();

      let filteredOrders = status 
        ? user.orders.filter((order) => order.status === status)
        : user.orders;

      if (timeFilter === 'current') {
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.createdAt) >= startOfCurrentMonth
        );
      } else if (timeFilter === 'previous') {
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.createdAt) >= startOfPreviousMonth && new Date(order.createdAt) <= endOfPreviousMonth
        );
      }

      // Sort orders by date, newest first
      filteredOrders = filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (filteredOrders.length === 0) {
        return {
          message: `No orders found${status ? ` with status "${status}"` : ''} for user: ${id}${timeFilter ? ` in the ${timeFilter} month` : ''}`,
          orders: [],
          ok: true,
        };
      }

      set.status = 200;
      return {
        message: `Orders${status ? ` with status "${status}"` : ''} retrieved successfully for user: ${id}${timeFilter ? ` in the ${timeFilter} month` : ''}`,
        orders: filteredOrders,
        ok: true,
      };
    } catch (error: any) {
      set.status = 500;
      return { message: error.message, ok: false };
    }
  },
  {
    query: t.Object({
      id: t.String(),      
      status: t.Optional(t.String()),  
      timeFilter: t.Optional(t.String()), 
    }),
    detail: {
      tags: ["Orders"],
      description: "Get all orders by user ID with an optional status filter and optional time filter (current/previous month), sorted by date (newest first)",
    },
  }
)

.get(
  "/getOrder",
  async (ctx) => {
    const { query, set } = ctx;
    try {
      const { Id } = query;
      const order = await OrderModel.findById(Id)
        .populate('customerId', 'username mobileNumber role') 
        .populate('products.productId', 'productName productCode customerPrice dealerPrice offers strikePrice brand productImages')
        // .populate('deliveryAddress','flatNumber area nearbyLandmark')
      if (!order) {
        set.status = 404;
        return { message: `Order not found: ${Id}`, ok: false };
      }

      set.status = 200;
      return {
        message: "Order fetched successfully",
        ok: true,
        order,
      };
    } catch (error: any) {
      set.status = 400;
      return { message: error.message, ok: false };
    }
  },
  {
    query: t.Object({
      Id: t.String(),
    }),
    detail: {
      tags: ["Orders"],
      description: "Get order details by orderId",
    },
  }
)
.post(
  "/updateAddress",
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
      console.log('address added successfully')
      return {
        message: `Address for tag '${tag}' added successfully`,
        ok: true,
      };
    } catch (error:any) {
      set.status = 400;
      console.log("error on updating the address - error message:",error)
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

.put(
  '/editAddress',
  async (ctx) => {
    const { body, set } = ctx;
    try {
      const { userId, address } = body;

      const user = await UserModel.findById(userId);
      if (!user) {
        set.status = 404;
        return { message: `User not found: ${userId}`, ok: false };
      }

      const addressIndex = user.deliveryAddress.findIndex((entry) =>
        entry._id.toString() === address._id.toString()
      );

      if (addressIndex === -1) {
        set.status = 404;
        return { message: `Address not found for ID: ${address._id}`, ok: false };
      }

     
      user.deliveryAddress[addressIndex] = {
        _id: address._id, 
        tag: address.tag, 
        address: {
          flatNumber: address.flatNumber,
          area: address.area,
          nearbyLandmark: address.nearbyLandmark || "", 
          receiverName: address.receiverName || "", 
          receiverMobileNumber: address.receiverMobileNumber || "", 
        },
      };

      await user.save();

      set.status = 200;
      return {
        message: `Address with ID '${address._id}' updated successfully`,
        ok: true,
      };
    } catch (error:any) {
      set.status = 500;
      console.log(error)
      return { message: error.message, ok: false };
    }
  },
  {
    body: t.Object({
      userId: t.String(),
      address: t.Object({
        _id: t.String(), 
        tag: t.String(), 
        flatNumber: t.String(),
        area: t.String(),
        nearbyLandmark: t.Optional(t.String()),
        receiverName: t.Optional(t.String()),
        receiverMobileNumber: t.Optional(t.String()),
      }),
    }),
  }
)

.put(
  "/edit-order",
  async ({ set, body, query }) => {
    try {
      const { id } = query;
      const {
        paymentImage,
        transactionId,
        cash
      } = body;

      const order = await OrderModel.findById(id);

      if (!order) {
        set.status = 404;
        return {
          message: "Order not found",
          ok: false,
        };
      }

      let filename = null;

      if (paymentImage && paymentImage !== "undefined" && paymentImage !== "null") {
        const { ok, filename: newFilename } = await saveFile(paymentImage, "payments");

        if (!ok) {
          set.status = 400;
          return {
            message: "Something went wrong while uploading the payment image",
            ok: false,
          };
        }

        filename = newFilename as string;
      }

      const newPayment = {
        paymentImage: filename,
        transactionId: transactionId || null,
        cash: cash || null,
        updatedBy: "user",
        verified:false
      };

      if (!Array.isArray(order.payment)) {
        order.payment = [];
      }

      order.payment.push(newPayment);

      await order.save();

      set.status = 200;
      return {
        message: "Order updated successfully",
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
      paymentImage: t.Optional(t.Any()),
      transactionId: t.Optional(t.String()),
      cash: t.Optional(t.String())
    }),
    detail: {
      tags: ["Orders"],
      description: "Edit an order by adding a new payment entry.",
    },
  }
)
.put(
  "/cancel-order",
  async ({ set, query }) => {
    try {
      const { id } = query;
      const order = await OrderModel.findById(id);

      if (!order) {
        set.status = 404;
        return {
          message: "Order not found",
          ok: false,
        };
      }

      if (order.status === 'cancelled') {
        set.status = 400;
        return {
          message: "Order is already cancelled",
          ok: false,
        };
      }

      order.status = 'cancelled';
      order.updatedBy = "user"; 

      await order.save();

      set.status = 200;
      return {
        message: "Order status updated to cancelled successfully",
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
      tags: ["Orders"],
      description: "Update an order's status to 'cancelled'.",
    },
  }
);


