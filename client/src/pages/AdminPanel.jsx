// The admin dashboard now lives with the other admin screens, under
// pages/admin/. This re-export keeps `import AdminPanel from '../pages/AdminPanel'`
// working for anything that still points here.
export { AdminDashboard as default } from './admin/AdminDashboard';
