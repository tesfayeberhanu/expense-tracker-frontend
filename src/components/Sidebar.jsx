import lpLogo from "../assets/lp-logo.png";
import { navItems } from "../content";
import { useFinance } from "../context";

export default function Sidebar() {
  const { activeSection, setActiveSection, settings } = useFinance();

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
        {navItems.map((item) => (
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
        onClick={() => setActiveSection("settings")}
      >
        <img className="profile-avatar" src={lpLogo} alt="" />
        <div>
          <strong>{settings.name}</strong>
          <span>Business account</span>
        </div>
        <span className="footer-arrow">›</span>
      </button>
    </aside>
  );
}
