import api from './client';

export const getEvents = (params?: Record<string, any>) => api.get('/events', { params });
export const getEvent = (id: number) => api.get(`/events/${id}`);
export const createEvent = (data: any) => api.post('/events', data);
export const updateEvent = (id: number, data: any) => api.put(`/events/${id}`, data);
export const deleteEvent = (id: number) => api.delete(`/events/${id}`);