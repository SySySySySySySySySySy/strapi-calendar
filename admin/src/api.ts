import axios from 'axios';
import { PLUGIN_ID } from './pluginId';

const api = {
  getCollections: async () => {
    return await axios.get(`/${PLUGIN_ID}/collections`);
  },
  getExtensions: async () => {
    return await axios.get(`/${PLUGIN_ID}/extensions`);
  },
  getSettings: async () => {
    return await axios.get(`/${PLUGIN_ID}/settings`);
  },
  setSettings: async (data: any) => {
    return axios.post(`/${PLUGIN_ID}/settings`, data);
  },
  createEvent: async (eventData: any) => {
    return axios.post(`/${PLUGIN_ID}/events`, eventData);
  },
  updateEvent: async (eventId: string, eventData: any) => {
    return axios.put(`/${PLUGIN_ID}/events/${eventId}`, eventData);
  },
  deleteEvent: async (eventId: string) => {
    return axios.delete(`/${PLUGIN_ID}/events/${eventId}`);
  },
};

export default api;
