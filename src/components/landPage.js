import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './landPage.css';

function LandPage() {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Welcome to BAUET Cafeteria";

  const handleLoginClick = () => {
    navigate('/login');
  };



  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        // Hide cursor after typing completes
        setTimeout(() => setShowCursor(false), 500);
      }
    }, 100); // Typing speed: 100ms per letter

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.menu-preview, .reviews, .landing-footer');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const reviews = [
    {
      name: 'John Doe',
      rating: 5,
      comment: 'Amazing food and great service! The cafeteria has the best coffee in town.'
    },
    {
      name: 'Jane Smith',
      rating: 4,
      comment: 'Love the variety of options. Always fresh and delicious.'
    },
    {
      name: 'Mike Johnson',
      rating: 5,
      comment: 'Perfect place for students. Affordable prices and friendly staff.'
    },
    {
      name: 'Sarah Wilson',
      rating: 4,
      comment: 'Great atmosphere and quick service. Highly recommended!'
    }
  ];

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-top">
          <div className="logo-section">
            <img src="/BAUET Logo_Transparent.png" alt="BAUET Cafeteria Logo" className="logo" />
            <h1>BAUET Cafeteria</h1>
          </div>
          <nav className="nav-section">
            <div className="contacts">
              <span>📞 +880 123 456 7890</span>
              <span>✉️ info@bauetcafeteria.com</span>
            </div>
            <div className="nav-links">
              <a href="#items">Items</a>
              <a href="#footer">Contact</a>
              <button onClick={handleLoginClick} className="login-button">Login</button>
            </div>
          </nav>
        </div>
        <div className="header-content">
        <h2>{displayedText}{showCursor && <span className="cursor">|</span>}</h2>
          <p>
            At BAUET Cafeteria, we pride ourselves on serving delicious, freshly prepared meals
            to our students, faculty, and visitors. Our menu features a wide variety of options
            including traditional Bangladeshi cuisine, international dishes, and healthy alternatives.
            Whether you're looking for a quick bite or a relaxing meal, we have something for everyone.
          </p>
          <p>
            Our commitment to quality ingredients, excellent service, and a welcoming atmosphere
            makes BAUET Cafeteria the perfect place to enjoy your meals. Come visit us and experience
            the best in campus dining!
          </p>
        </div>
      </header>

      <section className="services-section">
        <div className="services-container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-block">
              <h3>Breakfast</h3>
              <p>Start your day with our delicious breakfast options, including fresh pastries, eggs, and coffee.</p>
            </div>
            <div className="service-block">
              <h3>Lunch</h3>
              <p>Enjoy a variety of lunch specials with healthy and tasty meals prepared fresh daily.</p>
            </div>
            <div className="service-block">
              <h3>Snacks</h3>
              <p>Grab quick and satisfying snacks like sandwiches, salads, and desserts throughout the day.</p>
            </div>
            <div className="service-block">
              <h3>Beverages</h3>
              <p>Choose from a wide range of hot and cold beverages, including specialty coffees and teas.</p>
            </div>
          </div>
        </div>
      </section>

      <main className="landing-content">

        <section id="items" className="menu-preview">
          <h2>Our Popular Items</h2>
          <div className="items-grid">
            <div className="item-card">
              <img src="/images/img1.png" alt="Item 1" />
              <h3>Samosas</h3>
              <p>Vegetable/meat filled snack with fresh sauces</p>
            </div>
            <div className="item-card">
              <img src="/images/coffee.png" alt="Item 2" />
              <h3>Coffee Special</h3>
              <p>Rich and aromatic coffee to energize your day</p>
            </div>
            <div className="item-card">
              <img src="/images/img3.png" alt="Item 3" />
              <h3>Singara</h3>
              <p>Potato filled snack with fresh sauces</p>
            </div>
          </div>
        </section>

        <section className="reviews">
          <h2>What Our Customers Say</h2>
          <div className="reviews-grid">
            {reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <h4>{review.name}</h4>
                  <div className="rating">{renderStars(review.rating)}</div>
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="footer" className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo-info">
            <div className="logo-section1">
            <img src="/BAUET Logo_Transparent.png" alt="BAUET Cafeteria Logo" className="logo" />
            <h2>BAUET Cafeteria</h2>
          </div>
            <p>
              BAUET Cafeteria is dedicated to providing fresh, delicious meals to our campus community.
              We value quality, service, and a welcoming atmosphere. Visit us for a delightful dining experience.
            </p>
          </div>
          <div className="footer-contacts">
            <h3>Contact Us</h3>
            <p>Phone: +880 123 456 7890</p>
            <p>Email: info@bauetcafeteria.com</p>
          </div>
          <div className="footer-review">
            <h3>Send a Review</h3>
            <form className="review-form" onSubmit={(e) => e.preventDefault()}>
              <input type="text" name="name" placeholder="Your Name" required />
              <input type="email" name="email" placeholder="Your Email" required />
              <select name="rating" required>
                <option value="">Rating</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
              <textarea name="comment" placeholder="Your Review" rows="4" required></textarea>
              <button type="submit">Submit Review</button>
            </form>
          </div>
        </div>
        <p className="footer-copyright">&copy; 2023 BAUET Cafeteria. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandPage;
