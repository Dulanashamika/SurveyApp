import apiClient from './client';

export const natureApi = {
  createNature: async (natureData: {
    natureCategory: string;
    natureType: string;
    photo: string;
    date: string;
    timeOfDay: string;
    description?: string;
    commonName?: string;
    scientificName?: string;
  }) => {
    try {
      const response = await apiClient.post('/nature', natureData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Nature API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to submit nature observation');
    }
  },

  getAllNature: async () => {
    try {
      const response = await apiClient.get('/nature');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Nature API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch nature observations');
    }
  },

  getNatureById: async (id: string) => {
    try {
      const response = await apiClient.get(`/nature/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Nature API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch nature observation');
    }
  },

  updateNature: async (id: string, natureData: any) => {
    try {
      const response = await apiClient.put(`/nature/${id}`, natureData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Nature API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update nature observation');
    }
  },

  deleteNature: async (id: string) => {
    try {
      const response = await apiClient.delete(`/nature/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Nature API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to delete nature observation');
    }
  },

  updateNaturePhotoInfo: async (id: string, photoInfo: {
    contactInfo?: string;
    canUsePhoto: boolean;
    photoCredit?: string;
  }) => {
    try {
      const response = await apiClient.put(`/nature/${id}`, photoInfo);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Nature API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update nature photo info');
    }
  },
};
