import React, { useRef } from "react"; // <--- Ensure this line is exactly like this
import "./Home.css";
import { Link } from "react-router-dom"; // Add this import

export default function Home() {
  // 1. Initialize the reference
  const poolSectionRef = useRef(null);

  // 2. The scroll function
  const handleScroll = () => {
    poolSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <div className="hero-section">
        <video className="hero-video" autoPlay loop muted playsInline>
          <source src="/assets/videos/video1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay"></div>
        
        <div className="hero-top-contact">
          <span className="phone-icon">📞</span>
          <a href="tel:+959970683177" className="phone-number">+959 970 683 177</a>
        </div>
        
        <div className="hero-content">
          <div className="star-rating"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <h3 className="hero-subtitle">RELAX Hotel</h3>
          <h1 className="hero-title">Luxury In The Heart <br /> Of Myanmar</h1>
          <Link to="/rooms" className="hero-btn">Rooms & Suites</Link>
        </div>
        
        {/* Scroll trigger with onClick event */}
        <div className="scroll-down-container" onClick={handleScroll}>
          <div className="scroll-arrow">↓</div>
        </div>
      </div>

      {/* SWIMMING POOL SECTION - Added ref={poolSectionRef} */}
      <section className="pool-section" ref={poolSectionRef}>
        <div className="pool-content">
          <h2>Our Infinity Pool</h2>
          <p>
            Experience pure relaxation at our signature infinity pool. Overlooking 
            the serene Mandalay skyline, it provides the perfect sanctuary to unwind 
            with a cocktail or enjoy a refreshing morning swim.
          </p>
         <Link to="/gallery" className="secondary-btn">View Gallery</Link>
        </div>
        <div className="pool-image">
           <img src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=600" alt="Swimming Pool" />
        </div>
      </section>

      {/* HOTEL REVIEWS SECTION */}
      <section className="reviews-section">
        <h2>Guest Experiences</h2>
        <div className="reviews-grid">
          <div className="review-card">
            <p>"An absolute oasis in the heart of Mandalay. The staff service is impeccable."</p>
            <h4>— Mr.Phyo Chit</h4>
          </div>
          <div className="review-card">
            <p>"The pool view at sunset is breathtaking. Would definitely stay here again."</p>
            <h4>— Kenji Tanaka</h4>
          </div>
           <div className="review-card">
            <p>"The pool view at sunset is breathtaking. Would definitely stay here again."</p>
            <h4>-Mr.Shine Htet Thar</h4>
          </div>
          
        </div>
      </section>
    </div>
  );
}