import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, LogOut, User, Home, Package, ShoppingBag ,Contact } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function SellerNavbar() {
  const { seller, sellerLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sellerLogout();
    navigate("/seller");
  };

  const navItems = [
    { label: "Dashboard", path: "/seller/dashboard", icon: <Home size={16} /> },
    { label: "Products", path: "/seller/products", icon: <Package size={16} /> },
    { label: "Orders", path: "/seller/orders", icon: <ShoppingBag size={16} /> },
    { label: "Contact", path: "/seller/contact", icon: <Contact size={16} /> },
  ];

  if (location.pathname === "/seller") {
    return null;
  }

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">

        <div className="flex items-center gap-1">
          <span className="text-xl font-black tracking-tight text-indigo-700">
            Swift<span className="font-light text-black">Cart</span>
          </span>
          <span className="ml-1 text-[9px] font-semibold uppercase text-indigo-500">
            Seller
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-2 text-sm font-medium transition ${
                location.pathname.startsWith(item.path)
                  ? "text-black"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Link to='/seller/account'>
            <User size={16} />
            </Link>
            <span>{seller?.name || "Seller"}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <button className="md:hidden text-gray-700">
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}

export default SellerNavbar;
