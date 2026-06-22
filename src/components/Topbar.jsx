import { useEffect, useRef, useState } from "react";
import lpLogo from "../assets/lp-logo.png";
import { sectionCopy } from "../content";
import { useFinance } from "../context";

export default function Topbar() {
  const {
    activeSection,
    canCreateTransactions,
    canReadSettings,
    canUpdateSettings,
    currentUser,
    handleSignOut,
    openNewTransaction,
    setActiveSection,
    setResetOpen,
    settings,
  } = useFinance();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [title, subtitle] = sectionCopy[activeSection] || sectionCopy.overview;
  const canOpenSettings = canReadSettings || canUpdateSettings;

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Personal finance</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      <div className="topbar-actions">
        {activeSection === "transactions" && canCreateTransactions && (
          <button
            className="header-action"
            type="button"
            onClick={openNewTransaction}
          >
            <span>+</span> Add transaction
          </button>
        )}
        <div className="profile-menu-wrap" ref={profileRef}>
          <button
            className="top-profile"
            type="button"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((current) => !current)}
          >
            <img src={lpLogo} alt="" />
          </button>
          {profileOpen && (
            <div className="profile-menu">
              <div className="profile-menu-header">
                <strong>{currentUser?.username || settings.name}</strong>
                <span>{currentUser?.role || settings.email}</span>
              </div>
              {canOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection("settings");
                    setProfileOpen(false);
                  }}
                >
                  ⚙ Account settings
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setResetOpen(true);
                  setProfileOpen(false);
                }}
              >
                ● Change password
              </button>
              <button className="signout" type="button" onClick={handleSignOut}>
                ↪ Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
