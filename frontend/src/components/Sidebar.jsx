
import {
  Dumbbell,
  Activity,
  Target,
  LayoutDashboard,
  History,
  UserRound,
  Settings,
  Users,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user } = useAuth();

  const role = user?.Role_Name;

  const userNavItems = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard },
    { title: "Workout Plans", path: "/workout-plans", icon: Dumbbell },
    { title: "Start Workout", path: "/start-workout", icon: Activity },
    { title: "Workout History", path: "/workout-history", icon: History },
    { title: "Fitness Goals", path: "/fitness-goals", icon: Target },
  ];

  const trainerNavItems = [
    { title: "Trainer Dashboard", path: "/trainer", icon: LayoutDashboard },
    { title: "My Users", path: "/trainer/users", icon: Users },
    { title: "Workout Plans", path: "/trainer/workout-plans", icon: ClipboardList },
  ];

  const adminNavItems = [
    { title: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
    { title: "User Management", path: "/admin/users", icon: Users },
    { title: "Trainer Management", path: "/admin/trainers", icon: ShieldCheck },
  ];

  const navItems =
    role === "Admin"
      ? adminNavItems
      : role === "Trainer"
      ? trainerNavItems
      : userNavItems;

  return (
    <aside className="sidebar">
      <div className="brand">
        <Dumbbell size={27} />
        <span>FitTrack</span>
      </div>

      <p className="menu-label">MAIN MENU</p>

      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/" || item.path === "/trainer" || item.path === "/admin"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        {role === "User" && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <UserRound size={19} />
            <span>Profile</span>
          </NavLink>
        )}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
