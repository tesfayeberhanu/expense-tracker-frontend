import lpLogo from "../assets/lp-logo.png";
import { useFinance } from "../context";

export default function Sidebar() {
  const {
    activeSection,
    currentUser,
    setActiveSection,
    settings,
    visibleNavItems,
  } = useFinance();
  const canOpenSettings = visibleNavItems.some((item) => item.id === "settings");

  return (
    <aside className="sidebar">
      <button
        className="brand"
        type="button"
        onClick={() => setActiveSection("overview")}
      >
        <img className="brand-mark" src={lpLogo} alt="" />
        <span>LP Finance</span>
      </button>

      <nav className="nav-list" aria-label="Main navigation">
        {visibleNavItems.map((item) => (
          <button
            className={`nav-item ${activeSection === item.id ? "active" : ""}`}
            type="button"
            key={item.id}
            onClick={() => setActiveSection(item.id)}
          >
            <span className={`nav-icon ${item.color}`}>{item.icon}</span>{" "}
            {item.label}
          </button>
        ))}
      </nav>

      <button
        className="sidebar-footer"
        type="button"
        disabled={!canOpenSettings}
        onClick={() => setActiveSection("settings")}
      >
        <img className="profile-avatar" src={lpLogo} alt="" />
        <div>
          <strong>{currentUser?.username || settings.name}</strong>
          <span>{currentUser?.role || "Business account"}</span>
        </div>
        <span className="footer-arrow">›</span>
      </button>
    </aside>
  );
}
