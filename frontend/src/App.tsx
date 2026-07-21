import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { lazy, Suspense } from 'react';

// Lazy load layouts and pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const ResidentLayout = lazy(() => import('./layouts/ResidentLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));

const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const ResidentLogin = lazy(() => import('./pages/auth/ResidentLogin'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminResidents = lazy(() => import('./pages/admin/Residents'));
const AdminDishes = lazy(() => import('./pages/admin/Dishes'));
const AdminDishForm = lazy(() => import('./pages/admin/DishForm'));
const AdminMenus = lazy(() => import('./pages/admin/Menus'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

const ResidentDashboard = lazy(() => import('./pages/resident/Dashboard'));
const ResidentTodayMenu = lazy(() => import('./pages/resident/TodayMenu'));
const ResidentFavourites = lazy(() => import('./pages/resident/Favourites'));
const ResidentSavedRecipes = lazy(() => import('./pages/resident/SavedRecipes'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-900 transition-colors duration-300">
    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login/admin" element={
            isAuthenticated && user?.role === 'ADMIN' ? <Navigate to="/admin" /> : <AdminLogin />
          } />
          <Route path="/login" element={
            isAuthenticated && user?.role === 'RESIDENT' ? <Navigate to="/resident" /> : <ResidentLogin />
          } />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          isAuthenticated && user?.role === 'ADMIN' ? <AdminLayout /> : <Navigate to="/login/admin" />
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="residents" element={<AdminResidents />} />
          <Route path="dishes" element={<AdminDishes />} />
          <Route path="dishes/new" element={<AdminDishForm />} />
          <Route path="dishes/:id" element={<AdminDishForm />} />
          <Route path="menus" element={<AdminMenus />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Resident Routes */}
        <Route path="/resident" element={
          isAuthenticated && user?.role === 'RESIDENT' ? <ResidentLayout /> : <Navigate to="/login" />
        }>
          <Route index element={<ResidentDashboard />} />
          <Route path="menu/today" element={<ResidentTodayMenu />} />
          <Route path="favourites" element={<ResidentFavourites />} />
          <Route path="saved" element={<ResidentSavedRecipes />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

export default App;
