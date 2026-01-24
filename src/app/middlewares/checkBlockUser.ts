import { User } from '../modules/user/user.model';
import catchAsync from '../utils/catchAsync';

export const checkUserBlocked = catchAsync(async (req, res, next) => {
  {
    // console.log('idhyeiowuyhf', req.user);
    const userId = req.user.id;

    const user = await User.findById(userId).select('isBlocked role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user!.isBlocked) {
      return res.status(403).json({
        success: false,
        message: `Your account is inactive. You cannot change event as ${user?.role} until admin activate your account.`,
      });
    }

    next();
  }
});
