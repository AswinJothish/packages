import { t } from "elysia";

export const CreateProductDto = t.Object({
  productName: t.String({
    examples: ["Water Purifier"],
    description: "The name of the product",
  }),

  productCode: t.String({
    examples: ["123456"],
    description: "The product code",
  }),
  productImages: t.Array(t.String()),
  description: t.Optional(
    t.String({
      examples: ["description"],
      description: "The description of the product",
    })
  ),
  brand: t.Optional(
    t.String({
      examples: ["Havels"],
      description: "Brand name of the product",
    })
  ),
  general:t.Optional(t.String()),
  stock:t.Optional(t.String({
    examples:["50"],
    description: "The stock availability of the product",
  })),
  category:t.Optional(t.String({
    examples:["Purifier"],
    description:"category of the product"
  })),
  purchasedPrice: t.Optional(
    t.String({
      examples: ["350"],
      description: "The purchased price of the product",
    })
  ),
  customerPrice: t.Optional(
    t.String({
      examples: ["750"],
      description: "The selling price of the product",
    })
  ),
  dealerPrice: t.Optional(
    t.String({
      examples: ["700"],
      description: "The dealer price of the product",
    })
  ),
  strikePrice: t.Optional(
    t.String({
      examples: ["1050"],
      description: "The strike price of the product",
    })
  ),
  specifications: t.Optional(t.String())

});
