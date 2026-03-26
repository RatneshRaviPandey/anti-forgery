import React from 'react';

const ProductPage = ({ addToCart }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-200 h-96 rounded flex items-center justify-center">
          <span className="text-gray-500 text-xl">Product Image</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">Product Name</h1>
          <p className="text-2xl font-bold text-amazon-orange mb-4">$999</p>
          <p className="text-gray-600 mb-6">Product details and description go here.</p>
          <button
            onClick={() => addToCart({ id: 1, name: 'Product', price: '$999' })}
            className="bg-amazon-orange px-8 py-3 rounded font-bold hover:bg-yellow-500 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
