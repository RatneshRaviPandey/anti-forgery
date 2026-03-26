import React from 'react';
import { FaStar } from 'react-icons/fa';

const HomePage = ({ addToCart }) => {
  const products = [
    { id: 1, name: 'Laptop', price: '$999', rating: 4.5, image: 'laptop.jpg' },
    { id: 2, name: 'Smartphone', price: '$699', rating: 4.8, image: 'phone.jpg' },
    { id: 3, name: 'Headphones', price: '$199', rating: 4.3, image: 'headphones.jpg' },
    { id: 4, name: 'Tablet', price: '$499', rating: 4.6, image: 'tablet.jpg' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold mb-8">Featured Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="bg-gray-200 h-48 flex items-center justify-center">
              <span className="text-gray-500">Product Image</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2">{product.name}</h3>
              <p className="text-2xl font-bold text-amazon-orange mb-2">{product.price}</p>
              <div className="flex items-center mb-4">
                <FaStar className="text-amazon-orange" size={16} />
                <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
              </div>
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-amazon-orange text-black py-2 rounded font-bold hover:bg-yellow-500 transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
