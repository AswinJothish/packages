import { UserModel } from "../../../models/admin/user";
import { Elysia, t } from "elysia";
import { OrderModel } from "../../../models/admin/products/orders/order";
import { ProductModel } from "../../../models/admin/products/product";
import { saveFile } from "../../../lib/file";
import { DeliveryAgent } from "../../../models/delivery-agent";
import { ObjectId } from "mongodb";
export const AdminOrderController = new Elysia({
  prefix: "/orders",
})
.get(
  "/all",
  async ({ query, set }) => {
    try {
      let { page, limit, q, status, unverifiedPayments } = query;
      let orders = null;
      let count = 0;

      const fetchQuery = {};

      if (q) {
        const customerIds = await UserModel.find({
          $or: [
            { username: { $regex: q, $options: "i" } },
            { mobileNumber: { $regex: q, $options: "i" } }
          ]
        }).select('_id');

        fetchQuery.$or = [
          { orderId: { $regex: q, $options: "i" } },
          { customerId: { $in: customerIds.map(customer => customer._id) } }
        ];
      }

      if (status) {
        fetchQuery.status = status;
      }

      if (unverifiedPayments === 'true') {
        fetchQuery.payment = { $elemMatch: { verified: "false" } }; // Check if any payment is unverified
      }

      count = await OrderModel.countDocuments(fetchQuery);

      if (page && limit) {
        const _page = parseInt(page, 10);
        const _limit = parseInt(limit, 10);

        orders = await OrderModel.find(fetchQuery)
          .skip((_page - 1) * _limit)
          .limit(_limit)
          .populate({
            path: 'customerId',
            select: 'username mobileNumber role'
          })
          .populate({
            path: 'products.productId',
            select: 'productName productCode brand productImage',
          })
          .sort({ createdAt: -1 })
          .lean();
      } else {
        orders = await OrderModel.find(fetchQuery)
          .populate({
            path: 'customerId',
            select: 'username mobileNumber role'
          })
          .populate({
            path: 'products.productId',
            select: 'productName productCode brand productImage',
          })
          .sort({ createdAt: -1 })
          .lean();
      }

       set.status = 200;
      return {
        message: "Orders fetched successfully",
        ok: true,
        orders: orders.map((order) => ({
          ...order,
          unverifiedPayments: order.payment?.some(payment => payment.verified === "false"),
        })),
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
      q: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      status: t.Optional(t.String()),
      unverifiedPayments: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Orders"],
      description: "Get all orders with unverified payment check",
    },
  }
)

.get(
  "/order/:Id",
  async (ctx) => {
    const { params, set } = ctx;
    try {
      const { Id } = params;
      const order = await OrderModel.findById(Id)
        .populate('customerId', 'username mobileNumber role') 
        .populate('products.productId', 'productName productCode customerPrice dealerPrice offers brand stock productImage')
         .populate('deliveryAgent','name phone')
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
    params: t.Object({
      Id: t.String(),
    }),
    detail: {
      tags: ["Orders"],
      description: "Get order details by orderId",
    },
  }
)

.post(
  "/createOrder",
  async (ctx) => {
    const { body, set } = ctx;
    try {
      const {
        orderedBy,
        customerId,
        orderDate,
        products,
        deliveryAddress, 
        deliveryCharges,
        grandTotal,
        receiver,
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

      
      const defaultReceiver = {
        name: customer.username,
        mobile: customer.mobileNumber,
      };

   
      const newOrder = new OrderModel({
        orderId: randomOrderId,
        orderedBy,
        customerId: customer._id,
        orderDate: new Date(orderDate),
        products: orderItems,
        deliveryAddress,
        deliveryCharges,
        grandTotal,
        status: "pending",
        receiver: receiver || defaultReceiver,
      });

      await newOrder.save(); 

      customer.orders = customer.orders || []; 
      customer.orders.push(newOrder._id);
      await customer.save();

      set.status = 201;
      return {
        message: "Order placed successfully",
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
      orderDate: t.String(),
      products: t.Array(
        t.Object({
          productId: t.String(),
          quantity: t.Number(),
        })
      ),
      deliveryAddress: t.Optional(t.Any()), 
      deliveryCharges: t.Number(),
      grandTotal: t.Number(),
      receiver: t.Optional(
        t.Object({
          name: t.String(),
          mobile: t.String(),
        })
      ),
    }),
    detail: {
      tags: ["Orders"],
      description: "Create a new order",
    },
  }
)

.patch(
  "/order/:orderId/status",
  async (ctx) => {
    const { params, body, set } = ctx;
    try {
      const { orderId } = params;
      const { status } = body;

      const validStatuses = [
        'pending',
        'completed',
        'cancelled',
        'rejected',
        'accepted',
        'dispatched',
        'assigned',
        'picked',
        'outfordelivery',
        'delivered',
      ];

      if (!validStatuses.includes(status)) {
        set.status = 400;
        return { message: `Invalid status: ${status}`, ok: false };
      }

      const order = await OrderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true } 
      );

      if (!order) {
        set.status = 404;
        return { message: `Order not found: ${orderId}`, ok: false };
      }

      set.status = 200;
      return {
        message: "Order status updated successfully",
        ok: true,
        order,
      };
    } catch (error: any) {
      set.status = 400;
      return { message: error.message, ok: false };
    }
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
    body: t.Object({
      status: t.String({
        examples: [
          'pending',
          'completed',
          'cancelled',
          'rejected',
          'accepted',
          'assigned',
          'picked',
          'outfordelivery',
          'delivered',
        ],
        description: 'The new status of the order',
      }),
    }),
    detail: {
      tags: ["Orders"],
      description: "Update the status of an order",
    },
  }
)
.put(
  "/editOrder/:orderId",  
  async (ctx) => {
    const { body, set, params } = ctx;
    const { orderId } = params;  
    try {
      const {
        orderedBy,
        customerId,
        receiver,
        products,
        deliveryAddress,
        deliveryCharges,
        grandTotal,
        discount,
        EditedDate
      } = body;  

     
      const order = await OrderModel.findById(orderId );
      if (!order) {
        set.status = 404;
        return { message: `Order not found: ${orderId}`, ok: false };
      }

      const customer = await UserModel.findById(customerId);
      if (!customer) {
        set.status = 404;
        return { message: `Customer not found: ${customerId}`, ok: false };
      }

     
      for (const product of products) {
        const existingProduct = await ProductModel.findById(product.productId);
        if (!existingProduct) {
          set.status = 404;
          return { message: `Product not found: ${product.productId}`, ok: false };
        }
      }

    
      const updatedOrder = await OrderModel.findByIdAndUpdate( orderId ,  
        {
          $set: {
            orderedBy,
            customerId,
            receiver: receiver || { name: customer.username, mobile: customer.mobileNumber },
            products,
            deliveryAddress,
            deliveryCharges,
            grandTotal,
            discount,
            EditedDate: EditedDate || new Date(), 
          },
        },
        { new: true }  
      );

      set.status = 200;
      return {
        message: "Order updated successfully",
        order: updatedOrder,
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
      receiver: t.Optional(t.Object({
        name: t.String(),
        mobile: t.String(),
      })),
      products: t.Array(
        t.Object({
          productId: t.String(),
          quantity: t.Number(),
        })
      ),
      deliveryAddress: t.Optional(t.Any()),
      deliveryCharges: t.Number(),
      grandTotal: t.Number(),
      discount:t.Optional(t.Object({
        value:t.String(),
        type:t.String()
      })),
      EditedDate: t.Optional(t.String()),  
    }),
    detail: {
      tags: ["Edit Orders"],
      description: "Edit an existing order",
    }
  }
)
.get("/users/:userId/delivery-addresses/:addressId", async ({ params, set }) => {
  try {
    const { userId, addressId } = params;

    // Fetch the user by userId
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      set.status = 404;
      return {
        message: "User not found",
        ok: false,
      };
    }

    // Ensure the user has a deliveryAddress field
    if (!user.deliveryAddress) {
      set.status = 404;
      return {
        message: "No delivery addresses found for this user",
        ok: false,
      };
    }

    // Convert the object of deliveryAddress into an array
    const deliveryAddresses = Object.values(user.deliveryAddress);

    // Find the address by addressId
    const deliveryAddress = deliveryAddresses.find(
      (address) => address._id.toString() === addressId
    );

    // Check if the address was found
    if (!deliveryAddress) {
      set.status = 404;
      return {
        message: "Delivery address not found",
        ok: false,
      };
    }

    // Return the found delivery address
    set.status = 200;
    return {
      message: "Delivery address found",
      ok: true,
      deliveryAddress,
    };
  } catch (error) {
    set.status = 500;
    return {
      message: error.message,
      ok: false,
    };
  }
}, {
  detail: {
    tags: ["Users", "Delivery Addresses"],
    description: "Get a user's delivery address by userId and addressId",
  },
})
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
      if (!customer.deliveryAddress) {
        customer.deliveryAddress = new Map();
      }
      if (!(customer.deliveryAddress instanceof Map)) {
        customer.deliveryAddress = new Map(Object.entries(customer.deliveryAddress));
      }
      customer.deliveryAddress.set(tag, address);
      await customer.save();

      set.status = 200;
      return {
        message: `Address for tag '${tag}' updated successfully`,
        ok: true,
      };

    } catch (error: any) {
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
      description: "Update a user's address for a specific tag",
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
  "/edit-payment",
  async ({ set, body, query }) => {
    try {
      const { id, paymentId } = query;
      const {
        balanceAmount,
        paidAmount,
        date,
        mode,
        paymentImage,
        transactionId,
      } = body;

      const order = await OrderModel.findById(id);

      if (!order) {
        set.status = 404;
        return {
          message: "Order not found",
          ok: false,
        };
      }

      if (!Array.isArray(order.payment)) {
        order.payment = [];
      }
      if (!Array.isArray(order.paymentDetails)) {
        order.paymentDetails = [];
      }

      if (!transactionId && !paidAmount && !balanceAmount && !date && !mode && !paymentImage) {
        set.status = 400;
        return {
          message: "No payment details provided to update.",
          ok: false,
        };
      }

      let filename = null;

      if (!paymentId && paymentImage && paymentImage !== "undefined" && paymentImage !== "null") {
        const { ok, filename: newFilename } = await saveFile(paymentImage, "payments");

        if (!ok) {
          set.status = 400;
          return {
            message: "Something went wrong while uploading the payment image",
            ok: false,
          };
        }

        filename = newFilename; 
      }

      if (paymentId) {

        const paymentToUpdate = order.payment.find(
          (payment) => payment._id.toString() === paymentId
        );

        if (!paymentToUpdate) {
          set.status = 404;
          return {
            message: "Payment not found",
            ok: false,
          };
        }

        paymentToUpdate.verified = true;

        const newPaymentDetail = {
          transactionId: transactionId || null,
          paidAmount: paidAmount !== undefined ? (paidAmount === "" ? null : Number(paidAmount)) : null,
          balanceAmount: balanceAmount !== undefined ? (balanceAmount === "" ? null : Number(balanceAmount)) : null,
          date: date || null,
          mode: mode || null,
          paymentImage: paymentImage || null,
          verified: true,
        };
        order.paymentDetails.push(newPaymentDetail);
      } else {
     
        const newPayment = {
          paymentImage: filename || null,
          transactionId: transactionId || null,
          cash: paidAmount, 
          updatedBy: "admin",
          verified: true,
        };
        order.payment.push(newPayment);

        const newPaymentDetail = {
          transactionId: transactionId || null,
          paidAmount: paidAmount !== undefined ? (paidAmount === "" ? null : Number(paidAmount)) : null,
          balanceAmount: balanceAmount !== undefined ? (balanceAmount === "" ? null : Number(balanceAmount)) : null,
          date: date || null,
          mode: mode || null,
          paymentImage: filename || null, 
          verified: true,
        };
        order.paymentDetails.push(newPaymentDetail);
      }

      await order.save();

      set.status = 200;
      return {
        message: "Payment details updated successfully",
        ok: true,
      };
    } catch (error:any) {
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
      paymentId: t.Optional(t.String()),
    }),
    body: t.Object({
      balanceAmount: t.Optional(t.Any()),
      paidAmount: t.Optional(t.Any()),
      date: t.Optional(t.String()),
      mode: t.Optional(t.String()),
      paymentImage: t.Optional(t.Any()),
      transactionId: t.Optional(t.Any()),
    }),
    detail: {
      tags: ["Orders"],
      description: "Edit or add payment details for a specific order.",
    },
  }
)

.put(
  "/edit-order/payment",
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

      // Create a new payment entry
      const newPayment = {
        paymentImage: null,
        transactionId: null,
        cash: cash,
        updatedBy: "user",
        verified: true,
      };

      if (!Array.isArray(order.payment)) {
        order.payment = [];
      }

      order.payment.push(newPayment);
      await order.save();

      set.status = 200;
      return {
        message: "Order updated successfully with new payment entry",
        ok: true,
      };
    } catch (error) {
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

.patch(
  "/assign-agent/:id",
  async ({ params, body }) => {
    try {
      const { id } = params;
      const { agentId } = body;

      const order = await OrderModel.findById(id);
      if (!order) {
        return { message: "Order not found", status: "error" };
      }

      const agent = await DeliveryAgent.findById(agentId);

      if (!agent) {
        return { message: "Something not found", status: "error" };
      }

      // await sendNotification(
      //   agent.fcmToken,
      //   `A New Order assigned`,
      //   "Order ID: " + order.orderId + " is assigned to you",
      // );

      order.deliveryAgent = new ObjectId(agentId);
      await order.save();

      return {
        message: "Delivery agent assigned successfully",
        status: "success",
        order,
      };
    } catch (error) {
      return {
        message: "Failed to assign delivery agent",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      agentId: t.String(),
    }),
  },
)
