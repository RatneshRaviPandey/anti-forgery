import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-amazon-blue text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Get to Know Us</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-amazon-orange">About Us</a></li>
              <li><a href="#" className="hover:text-amazon-orange">Careers</a></li>
              <li><a href="#" className="hover:text-amazon-orange">Press Center</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Make Money with Us</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-amazon-orange">Sell on ShopHub</a></li>
              <li><a href="#" className="hover:text-amazon-orange">Sell Your Services</a></li>
              <li><a href="#" className="hover:text-amazon-orange">Marketplace Services</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">ShopHub Payment Products</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-amazon-orange">Business Card</a></li>
              <li><a href="#" className="hover:text-amazon-orange">Shop with Points</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Help</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-amazon-orange">Your Account</a></li>
              <li><a href="#" className="hover:text-amazon-orange">Returns Center</a></li>
              <li><a href="#" className="hover:text-amazon-orange">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2026 ShopHub, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
