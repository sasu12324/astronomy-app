import api from '../api/axios.js';

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const { data } = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return data.url;
  }
};