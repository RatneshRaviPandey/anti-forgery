import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaUser } from 'react-icons/fa';

const Header = ({ cartCount }) => {
  return (
    <header className="bg-amazon-blue text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-3xl font-bold text-amazon-orange">ShopHub</h1>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 flex items-center bg-white rounded">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 px-4 py-2 text-gray-700 focus:outline-none"
            />
            <button className="bg-amazon-orange px-4 py-2 text-black font-bold">
              <FaSearch size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link to="/login" className="hover:text-amazon-orange transition">
              <FaUser size={24} />
            </Link>
            <Link
              to="/cart"
              className="relative hover:text-amazon-orange transition"
            >
              <FaShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amazon-orange text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
