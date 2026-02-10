import { Router } from 'express';
import { handymanController } from './handyman.controller';
import auth from '../../middlewares/auth';

const router = Router();

// User
router.post('/', auth(), handymanController.createHandymanRequest);
router.get('/me', auth(), handymanController.getMyHandymanRequests);
router.get('/:id', auth(), handymanController.getHandymanRequestById);
router.patch('/:id', auth(), handymanController.updateHandymanRequest);
router.patch('/:id/cancel', auth(), handymanController.cancelHandymanRequest);

// Professional
router.get('/professional/inbox', auth(), handymanController.getProfessionalInbox);
router.patch('/professional/:id/status', auth(), handymanController.professionalUpdateStatus);

export const handymanRouter = router;
