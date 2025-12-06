import { Router } from 'express';
import { sendMessage, getConversation, getConversations } from '../controllers/message.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:otherUserId', getConversation);

export default router;
