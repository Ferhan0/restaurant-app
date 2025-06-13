import api from './axios';

export const getRestaurants = async (params = {}) => {
  try {
    const response = await api.get('/restaurants', { params });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const getRestaurantById = async (id) => {
  try {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const createRestaurant = async (restaurantData) => {
  try {
    const response = await api.post('/restaurants', restaurantData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};