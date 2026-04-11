import { Link, useLocation, useNavigate } from "react-router-dom"

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/platform", label: "Platform" },
  { to: "/docs", label: "Docs" },
]

export default function PublicTopbar({
  actionLabel = "Mission Setup",
  actionTo = "/login",
  items = NAV_ITEMS,
  onItemClick,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="marketing-auth-topbar">
      <div className="marketing-auth-brand">
        <Link to="/" className="marketing-auth-brand-mark">
          <span className="accent">TESTGEN</span> AI
        </Link>
      </div>

      <div className="marketing-auth-nav">
        {items.map((item) => (
          <button
            key={item.to}
            type="button"
            className={location.pathname === item.to ? "marketing-nav-link active" : "marketing-nav-link"}
            onClick={() => {
              if (onItemClick) {
                onItemClick(item)
                return
              }
              navigate(item.to)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="marketing-auth-menu">
        <Link to={actionTo} className="marketing-auth-menuBtn marketing-auth-menuLink">
          {actionLabel}
        </Link>
      </div>
    </div>
  )
}
