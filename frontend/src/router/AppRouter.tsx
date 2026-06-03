import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { JSX } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Events from '../pages/Events';
import EventDetail from '../pages/EventDetail';
import MyRegistrations from '../pages/MyRegistrations';
import Dashboard from '../pages/admin/Dashboard';
import EventForm from '../pages/admin/EventForm';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/" element={<Navigate to="/events" />} />

        <Route path="/my-registrations" element={
          <PrivateRoute><MyRegistrations /></PrivateRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute><Dashboard /></AdminRoute>
        } />
        <Route path="/admin/events/new" element={
          <AdminRoute><EventForm /></AdminRoute>
        } />
        <Route path="/admin/events/:id/edit" element={
          <AdminRoute><EventForm /></AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;