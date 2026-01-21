import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { CategoryRoutes } from '../modules/category/category.route';
import { SubcategoryRoutes } from '../modules/subcategory/subcategory.route';
import { AddressRoutes } from '../modules/address/address.route';
import { BookingRoutes } from '../modules/booking/booking.route';
import { LocationRoutes } from '../modules/location/location.route';
import { ProfessionalRoutes } from '../modules/professional/professional.route';
import { ServiceRoutes } from '../modules/services/service.route';
import { ListingRoutes } from '../modules/listing/listing.route';
import { ConversationRoutes } from '../modules/conversation/conversation.route';
import { MessageRoutes } from '../modules/message/message.route';
import { RequestHistoryRoutes } from '../modules/Requests_history/requestHistory.route';
import { FavoriteRoutes } from '../modules/favorite/favorite.route';
import { CommentRoutes } from '../modules/comments/comment.route';
import { AdminRoutes } from '../modules/admin/admin.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/categories',
    route: CategoryRoutes,
  },
  {
    path: '/subcategories',
    route: SubcategoryRoutes,
  },
  {
    path: '/address',
    route: AddressRoutes,
  },
  {
    path: '/bookings',
    route: BookingRoutes,
  },
  {
    path: '/location',
    route: LocationRoutes,
  },
  {
    path: '/professional',
    route: ProfessionalRoutes,
  },
  {
    path: '/request-history',
    route: RequestHistoryRoutes,
  },
  {
    path: '/services',
    route: ServiceRoutes,
  },
  {
    path: '/listing',
    route: ListingRoutes,
  },
  {
    path: '/conversations',
    route: ConversationRoutes,
  },
  {
    path: '/messages',
    route: MessageRoutes,
  },
  {
    path: '/favorite',
    route: FavoriteRoutes,
  },
  {
    path: '/comment',
    route: CommentRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
