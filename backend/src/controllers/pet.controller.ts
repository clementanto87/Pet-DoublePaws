import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Pet } from '../entities/Pet.entity';

const petRepository = AppDataSource.getRepository(Pet);

interface AuthRequest extends Request {
    user?: any;
}

export const createPet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, species, breed, age, weight, specialNeeds, imageUrl } = req.body;
        const userId = req.user.id;

        const newPet = petRepository.create({
            name,
            species,
            breed,
            age,
            weight,
            specialNeeds,
            imageUrl,
            ownerId: userId,
        });

        await petRepository.save(newPet);

        res.status(201).json(newPet);
    } catch (error) {
        console.error('Create pet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPets = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;

        const pets = await petRepository.find({
            where: { ownerId: userId },
            order: { createdAt: 'DESC' },
        });

        res.json(pets);
    } catch (error) {
        console.error('Get pets error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPetById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const pet = await petRepository.findOne({
            where: { id, ownerId: userId },
        });

        if (!pet) {
            res.status(404).json({ message: 'Pet not found' });
            return;
        }

        res.json(pet);
    } catch (error) {
        console.error('Get pet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name, species, breed, age, weight, specialNeeds, imageUrl } = req.body;

        const pet = await petRepository.findOne({
            where: { id, ownerId: userId },
        });

        if (!pet) {
            res.status(404).json({ message: 'Pet not found' });
            return;
        }

        pet.name = name || pet.name;
        pet.species = species || pet.species;
        pet.breed = breed || pet.breed;
        pet.age = age || pet.age;
        pet.weight = weight || pet.weight;
        pet.specialNeeds = specialNeeds !== undefined ? specialNeeds : pet.specialNeeds;
        pet.imageUrl = imageUrl !== undefined ? imageUrl : pet.imageUrl;

        await petRepository.save(pet);

        res.json(pet);
    } catch (error) {
        console.error('Update pet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await petRepository.delete({ id, ownerId: userId });

        if (result.affected === 0) {
            res.status(404).json({ message: 'Pet not found' });
            return;
        }

        res.json({ message: 'Pet deleted successfully' });
    } catch (error) {
        console.error('Delete pet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
