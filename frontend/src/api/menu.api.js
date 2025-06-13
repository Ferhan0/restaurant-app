import api from './axios';

export const getMenuByRestaurant = async (restaurantId, params = {}) => {
  try {
    const response = await api.get(`/menu/restaurant/${restaurantId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const createMenuItem = async (menuItemData) => {
  try {
    const response = await api.post('/menu', menuItemData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};