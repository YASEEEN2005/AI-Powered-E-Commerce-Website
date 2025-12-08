import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  LogOut,
  User,
  Home,
  Package,
  ShoppingBag,
  MessageCircle,
  Banknote
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

function SellerNavbar() {
  const { seller, sellerLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isApproved = seller?.status?.toLowerCase() === "approved";

  const handleLogout = () => {
    sellerLogout();
    navigate("/seller");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/seller/dashboard",
      icon: <Home size={16} />,
      protected: true,
    },
    {
      label: "Products",
      path: "/seller/products",
      icon: <Package size={16} />,
      protected: true,
    },
    {
      label: "Orders",
      path: "/seller/orders",
      icon: <ShoppingBag size={16} />,
      protected: true,
    },
    {
      label: "Payout",
      path: "/seller/payouts",
      icon: <Banknote size={16} />,
      protected: true, 
    },
    {
      label: "Contact",
      path: "/seller/contact",
      icon: <MessageCircle size={16} />,
      protected: false,
    },
  ];

  if (location.pathname === "/seller") {
    return null;
  }

  const handleProtectedClick = (item, blocked) => {
    if (blocked) {
      toast.error("Your seller account is not approved yet.");
      navigate("/seller/account");
      return;
    }
    navigate(item.path);
  };

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
          {navItems.map((item, index) => {
            const blocked = item.protected && !isApproved;
            const isActive = location.pathname.startsWith(item.path);

            if (blocked) {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleProtectedClick(item, true)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            }

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-medium transition ${
                  isActive ? "text-black" : "text-gray-600 hover:text-black"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>


        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Link to="/seller/account" className="hover:text-black">
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
