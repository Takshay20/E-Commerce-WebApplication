import React from "react";
import "./Products.css";

function Products({ addToCart }) {
  // Dummy product list (you can replace with API later)
  const products = [
    { id: 1, name: "iPhone 15", price: 75000 },
    { id: 2, name: "Samsung Galaxy S23", price: 65000 },
    { id: 3, name: "OnePlus 11", price: 58000 },
    { id: 4, name: "Sony Headphones", price: 12000 },
  ];

  return (
    <div className="products-page">
      <h2>Available Products</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
