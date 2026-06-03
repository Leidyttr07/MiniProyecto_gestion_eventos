import api from './client';

export const getRegistrationsByEvent = (eventId: number) => 
  api.get(`/registrations/event/${eventId}`);

export const registerToEvent = (event_id: number) =>
  api.post('/registrations', { event_id });

export const cancelRegistration = (id: number) =>
  api.put(`/registrations/${id}/cancel`);

export const getMyRegistrations = () =>
  api.get('/registrations/my');

export const getEventAttendees = (eventId: number) =>
  api.get(`/registrations/event/${eventId}`);

export const removeRegistrationByAdmin = (id: number) => 
  api.delete(`/registrations/${id}`);