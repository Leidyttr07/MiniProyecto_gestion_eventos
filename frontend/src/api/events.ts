import api from './client';

export const getEvents = () => api.get('/events');
export const getEvent = (id: number) => api.get(`/events/${id}`);
export const createEvent = (data: any) => api.post('/events', data);
export const updateEvent = (id: number, data: any) => api.put(`/events/${id}`, data);
export const deleteEvent = (id: number) => api.delete(`/events/${id}`);
export const cancelEvent = (id: number) => api.put(`/events/${id}/cancel`);