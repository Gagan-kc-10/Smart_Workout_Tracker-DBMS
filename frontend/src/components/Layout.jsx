
import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  History,
  Target,
  User,
  Settings,
  Users,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { user } = useAuth();
  const role = user?.Role_Name;

  const userMenu = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Workout Plans", path: "/workout-plans", icon: Dumbbell },
    { name: "Start Workout", path: "/start-workout", icon: Activity },
    { name: "Workout History", path: "/workout-history", icon: History },
    { name: "Fitness Goals", path: "/fitness-goals", icon: Target },
  ];

  const trainerMenu = [
    { name: "Trainer Dashboard", path: "/trainer", icon: LayoutDashboard },
    { name: "My Users", path: "/trainer/users", icon: Users },
    { name: "Workout Plans", path: "/trainer/workout-plans", icon: ClipboardList },
  ];

  const adminMenu = [
    { name: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "User Management", path: "/admin/users", icon: Users },
    { name: "Trainer Management", path: "/admin/trainers", icon: ShieldCheck },
    { name: "Workout Management", path: "/admin/workouts", icon: Dumbbell },
  ];

  const menuItems =
    role === "Admin"
      ? adminMenu
      : role === "Trainer"
      ? trainerMenu
      : userMenu;

  return (
    <div className="app-layout">
      <aside className="sidebar">

        <div className="sidebar-brand">
          <Dumbbell size={22} />
          <h2>FitTrack</h2>
        </div>

        <p className="menu-heading">MAIN MENU</p>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path === "/" ||
                  item.path === "/trainer" ||
                  item.path === "/admin"
                }
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">

          {role === "User" && (
            <NavLink to="/profile" className="nav-item">
              <User size={17} />
              <span>Profile</span>
            </NavLink>
          )}

          <NavLink to="/settings" className="nav-item">
            <Settings size={17} />
            <span>Settings</span>
          </NavLink>

        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
