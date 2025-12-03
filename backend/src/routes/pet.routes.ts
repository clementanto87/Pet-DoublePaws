import { Router } from 'express';
import { createPet, getPets, getPetById, updatePet, deletePet } from '../controllers/pet.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticateToken);

router.post('/', createPet);
router.get('/', getPets);
router.get('/:id', getPetById);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

export default router;
