const tabs = [
  { id: "home", label: "Home" },
  { id: "create", label: "Create" },
  { id: "published", label: "Published" },
  { id: "dashboard", label: "Dashboard" },
  { id: "profile", label: "Profile" }
];

export default function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? "nav-btn nav-btn-active" : "nav-btn"}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
