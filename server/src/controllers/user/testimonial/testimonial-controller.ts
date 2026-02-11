import Elysia, { t } from "elysia";
import { TestimonialModel } from "../../../models/admin/testimonial-model";

export const TestimonialController = new Elysia({
  prefix: "/testimonial",
  detail: {
    tags: ["User - Testimonials"],
  },
})
.get(
    "/all",
    async () => {
      try {


        const testimonials = await TestimonialModel.find({
          isDeleted: false,
          active: true,
          
        })
          .exec();

        const totalTestimonials = await TestimonialModel.countDocuments({
          isDeleted: false,
          active: true,
        });

        return {
          testimonials,
          status: "success",
          total: totalTestimonials,
        };
      } catch (error) {
        console.log(error);
        return {
          error,
          status: "error",
        };
      }
    },
    {
      detail: {
        summary: "Get all testimonials",
      },
    }
  )
//   .post(
//     "/create",
//     async ({ body }) => {
//       try {
//         const existing = await TestimonialModel.findOne({
//           Clientname: body.Clientname,
//         });

//         if (existing) {
//           return { message: "Testimonial already exists", status: false };
//         }

//         // Create the testimonial
//         const testimonial = await TestimonialModel.create({
//           ...body,
//         });

//         return {
//           message: "Testimonial created successfully",
//           data: testimonial,
//           status: true,
//         };
//       } catch (error) {
//         console.error(error);
//         return {
//           error,
//           status: "error",
//         };
//       }
//     },
//     {
//       body: t.Object({
//         Clientname: t.String(),
//         profession: t.String(),
//         testimonial: t.String(),
//       }),
//       detail: {
//         summary: "Create a testimonial",
//       },
//     }
//   )

//   .get(
//     "/:id",
//     async ({ params }) => {
//       try {
//         const { id } = params;
//         const testimonial = await TestimonialModel.findById(id);

//         return {
//           message: "Testimonial fetched successfully",
//           data: testimonial,
//           status: true,
//         };
//       } catch (error) {
//         console.error(error);
//         return {
//           error,
//           status: "error",
//         };
//       }
//     },
//     {
//       params: t.Object({
//         id: t.String(),
//       }),
//       detail: {
//         summary: "Get testimonial by ID",
//       },
//     }
//   )

//   .delete(
//     "/:id",
//     async ({ params, query }) => {
//       try {
//         const { id } = params;
//         const { permanent } = query;

//         const testimonial = await TestimonialModel.findById(id);

//         if (!testimonial) {
//           return { message: "Testimonial not found", status: false };
//         }

//         if (permanent) {
//           testimonial.active = false;
//           testimonial.isDeleted = true;

//           await testimonial.save();

//           return {
//             message: "Testimonial deleted permanently",
//             status: true,
//           };
//         }

//         testimonial.active = !testimonial.active;

//         await testimonial.save();

//         return {
//           message: `Testimonial ${
//             testimonial.active ? "activated" : "deactivated"
//           } successfully`,
//           status: true,
//         };
//       } catch (error) {
//         console.error(error);
//         return {
//           error,
//           status: "error",
//         };
//       }
//     },
//     {
//       params: t.Object({
//         id: t.String(),
//       }),
//       query: t.Object({
//         permanent: t.Boolean({
//           default: false,
//         }),
//       }),
//       detail: {
//         summary: "Delete testimonial by ID",
//       },
//     }
//   )

//   .put(
//     "/:id",
//     async ({ params, body }) => {
//       try {
//         const { id } = params;
//         const { Clientname, profession, testimonial } = body;
//         const existing = await TestimonialModel.findById(id);

//         if (!existing) {
//           return { message: "Testimonial not found", status: false };
//         }

//         existing.Clientname = Clientname || existing.Clientname;
//         existing.profession = profession || existing.profession;
//         existing.testimonial = testimonial || existing.testimonial;

//         await existing.save();

//         return {
//           message: "Testimonial updated successfully",
//           data: existing,
//           status: true,
//         };
//       } catch (error) {
//         console.error(error);
//         return {
//           error,
//           status: "error",
//         };
//       }
//     },
//     {
//       params: t.Object({
//         id: t.String(),
//       }),
//       body: t.Object({
//         Clientname: t.Optional(t.String()),
//         profession: t.Optional(t.String()),
//         testimonial: t.Optional(t.String()),
//       }),
//       detail: {
//         summary: "Update testimonial by ID",
//       },
//     }
//   );
