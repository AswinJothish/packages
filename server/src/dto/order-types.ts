import { t } from "elysia";

export const OrderDto = t.Object({
  product:t.String({
    examples:["water purifier"],
    description:"Product name",
  }),
  quantity:t.Number({
    examples:[3],
    description:"quantity"
  }),
  price:t.Number({
    examples:[15000],
    description:"price"
  })
  });
  

  export const OrderItemDto = t.Object({
    user:t.String({
      examples:["sam"],
      description:"customer name"
    }),
    items:t.String({
      examples:["Product:water purifier"],
      description:"items"
    }),
    status:t.String({
      examples:["pending"],
      description:"status"
    })
    });