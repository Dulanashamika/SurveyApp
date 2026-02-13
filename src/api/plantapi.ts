import apiClient from './client';

export const plantApi = {
  createPlant: async (plantData: {
    plantCategory: string;
    plantType: string;
    photo: string;
    date: string;
    timeOfDay: string;
    description?: string;
    commonName?: string;
    scientificName?: string;
  }) => {
    try {
      const response = await apiClient.post('/plants', plantData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Plant API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to submit plant observation');
    }
  },

  getAllPlants: async () => {
    try {
      const response = await apiClient.get('/plants');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Plant API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch plants');
    }
  },

  getPlantById: async (id: string) => {
    try {
      const response = await apiClient.get(`/plants/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Plant API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch plant');
    }
  },

  updatePlant: async (id: string, plantData: any) => {
    try {
      const response = await apiClient.put(`/plants/${id}`, plantData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Plant API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update plant');
    }
  },

  deletePlant: async (id: string) => {
    try {
      const response = await apiClient.delete(`/plants/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Plant API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete plant');
    }
  },

  updatePlantPhotoInfo: async (id: string, photoInfo: {
    contactInfo?: string;
    canUsePhoto: boolean;
    photoCredit?: string;
  }) => {
    try {
      const response = await apiClient.put(`/plants/${id}`, photoInfo);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Plant API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update plant photo info');
    }
  },
};
