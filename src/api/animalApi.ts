import apiClient from './client';

export const animalApi = {
  createAnimal: async (animalData: {
    animalCategory: string;
    animalType: string;
    photo: string;
    date: string;
    timeOfDay: string;
    description?: string;
    commonName?: string;
    scientificName?: string;
  }) => {
    try {
      const response = await apiClient.post('/animals', animalData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Animal API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to submit animal observation');
    }
  },

  getAllAnimals: async () => {
    try {
      const response = await apiClient.get('/animals');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Animal API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch animals');
    }
  },

  getAnimalById: async (id: string) => {
    try {
      const response = await apiClient.get(`/animals/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Animal API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch animal');
    }
  },

  updateAnimal: async (id: string, animalData: any) => {
    try {
      const response = await apiClient.put(`/animals/${id}`, animalData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Animal API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update animal');
    }
  },

  deleteAnimal: async (id: string) => {
    try {
      const response = await apiClient.delete(`/animals/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Animal API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete animal');
    }
  },

  updateAnimalPhotoInfo: async (id: string, photoInfo: {
    contactInfo?: string;
    canUsePhoto: boolean;
    photoCredit?: string;
  }) => {
    try {
      const response = await apiClient.put(`/animals/${id}`, photoInfo);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Animal API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update animal photo info');
    }
  },
};
