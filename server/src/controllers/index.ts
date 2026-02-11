import {Elysia} from "elysia";
import { AdminAuthController } from "./admin/user-authcontroller";
import {User_Controller} from "./admin/user-controller"
import { ProductController } from "./admin/products/products-controller";
import { FileController } from "./admin/file-controller";
import { AdminOrderController } from "./admin/orders/adminOrder-controller";
import { UserProductController } from "./user/products/userProductController";
import { Mastercontroller } from "./admin/master/master-controller";
import { UserAuthController} from "./user/userAuth/AuthUser";
import { UserController } from "./user/userAuth/userController";
import{UserOrderController} from "./user/userAuth/order-controller"
import { BannerController } from "./admin/master/banner-controller";
import { deliveryAgentController } from "./admin/deliveryagent-controller";
import { testimonialController } from "./admin/testimonial/testimonial-controller";
import { TestimonialController } from "./user/testimonial/testimonial-controller";
import { dashboardController } from "./admin/dashboard-controller";
import { section } from "./user/section/section";
import { sectionController} from "./admin/sections/section-controller"
import { banner } from "./user/banner/banner";
import { privacyPolicyController } from "./admin/utils/privacypolicy-controller";
import { termsAndConditionsController } from "./admin/utils/termsandconditions-controller";
import { termsandconditionsController } from "./user/user-termsandconditions";
import { PrivacyPolicyController } from "./user/user-privacypolicy-controller";
export const AdminRouter = new Elysia({
  prefix:"/api/admin",
})
.use(AdminAuthController)
.use(User_Controller)
.use(ProductController)
.use(FileController)
.use(AdminOrderController)
.use(Mastercontroller)
.use(BannerController)
.use(deliveryAgentController)
.use(testimonialController)
.use(dashboardController)
.use(sectionController)
.use(privacyPolicyController)
.use(termsAndConditionsController)
export const UserRouter = new Elysia({
  prefix:"/api/user",
})
.use(UserProductController)
.use(UserAuthController)
.use(UserController)
.use(UserOrderController)
.use(TestimonialController)
.use(section)
.use(banner)
.use(termsandconditionsController)
.use(PrivacyPolicyController)