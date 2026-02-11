import { t } from "elysia";

export const CreateUserDto = t.Object({
  username: t.String({
    examples: ["Rajan"],
    description: "The name of the user",
  }),
  userid: t.Optional(
    t.String({
      examples: ["123456"],
      description: "The user id",
    })
  ),
  mobileNumber: t.String({
    examples: ["9876543210"],
    description: "The mobile number of the user",
  }),
  role: t.String({
    examples: ["customer", "Dealer"],
    description: "The role of the user",
  }),
  deliveryAddress: t.Optional(
    t.Array(
      t.Object({
        tag: t.String({
          description: "The tag for the delivery address",
        }),
        address: t.Object({
          flatNumber: t.String({
            description: "The flat number of the delivery address",
          }),
          area: t.String({
            description: "The area of the delivery address",
          }),
          nearbyLandmark: t.Optional(
            t.String({
              description: "A nearby landmark for the delivery address",
            })
          ),
          receiverName: t.String({
            description: "The name of the person receiving the delivery",
          }),
          receiverMobileNumber: t.String({
            examples: ["9876543210"],
            description: "The mobile number of the receiver",
          }),
        }),
      })
    )
  ),
});
