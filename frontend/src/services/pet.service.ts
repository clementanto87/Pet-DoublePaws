import api from '../lib/api';

export interface PetData {
    name: string;
    species: string;
    breed: string;
    age: number;
    weight: number;
    specialNeeds?: string;
    imageUrl?: string;
}

export const petService = {
    createPet: async (petData: PetData) => {
        const response = await api.post('/pets', petData);
        return response.data;
    },

    getPets: async () => {
        const response = await api.get('/pets');
        return response.data;
    },

    getPet: async (id: string) => {
        const response = await api.get(`/pets/${id}`);
        return response.data;
    },

    updatePet: async (id: string, petData: Partial<PetData>) => {
        const response = await api.put(`/pets/${id}`, petData);
        return response.data;
    },

    deletePet: async (id: string) => {
        const response = await api.delete(`/pets/${id}`);
        return response.data;
    }
};
