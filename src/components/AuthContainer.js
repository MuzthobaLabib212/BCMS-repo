import React from 'react';
import './AuthContainer.css';

const AuthContainer = ({ children, title }) => {
  const images = [
    '/images/img1.png',
    '/images/img2.png',
    '/images/img3.png',
    '/images/img4.png',
    '/images/img5.png',
    '/images/img6.png',
    '/images/img7.png'
  ];

  return (
    <div className="auth-container">
      <div className="gradient-background"></div>
      <div className="background-images">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`background ${index + 1}`}
            className={`background-image img${index + 1}`}
          />
        ))}
      </div>
      <div className="auth-card">
        <h2 className="auth-title">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default AuthContainer;
