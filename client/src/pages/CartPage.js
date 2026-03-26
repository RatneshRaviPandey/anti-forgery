import React from 'react';

const CartPage = ({ cart, removeFromCart }) => {
  const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">Shopping Cart</h2>
      {cart.length === 0 ? (
        <p className="text-xl text-gray-600">Your cart is empty</p>
      ) : (
        <div>
          <div className="bg-white rounded-lg shadow">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-gray-600">{item.price}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 text-right">
            <p className="text-2xl font-bold mb-4">Total: ${total.toFixed(2)}</p>
            <button className="bg-amazon-orange px-8 py-3 rounded font-bold hover:bg-yellow-500 transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
