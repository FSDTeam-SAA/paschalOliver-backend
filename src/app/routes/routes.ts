import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { CategoryRoutes } from '../modules/category/category.route';
import { SubcategoryRoutes } from '../modules/subcategory/subcategory.route';
import { AddressRoutes } from '../modules/address/address.route';
import { BookingRoutes } from '../modules/booking/booking.route';
import { LocationRoutes } from '../modules/location/location.route';
import { ProfessionalRoutes } from '../modules/professional/professional.route';
import { RequestHistoryRoutes } from '../modules/Requests_history/requestHistory.route';

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
