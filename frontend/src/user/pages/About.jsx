import React from 'react';
import './about.css';

function About({ sidebarOpen }) {
  return (
    <div className={`about-container ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      
      {/* --- HERO BANNER SECTION --- */}
      <header className="about-hero">
        <div className="hero-overlay">
          <span className="subtitle">A LUXURIOUS STAY</span>
          <h1 className="hero-title">About Our Hotel</h1>
        </div>
      </header>

      {/* --- BRAND STORY SECTION --- */}
      <section className="about-story-section">
        <div className="story-grid">
          <div className="story-text">
            <span className="gold-tag">DISCOVER RELAX HOTEL</span>
            <h2>An Elegant Blend of Comfort & Culture</h2>
            <p>
              RELAX Hotel is an international upscale hotel in Mandalay, with easy 
              access to the city's commercial hubs and tourist attractions. It features refined spaces designed for both leisure seekers and sophisticated business travelers.
            </p>
            <p>
              Embodying the warm hospitality of Myanmar, our property seamlessly blends modern, 
              cutting-edge design with cultural touches, ensuring your stay is nothing short of extraordinary.
            </p>
          </div>
          <div className="story-image">
            <img 
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" 
              alt="Hotel Architectural Detail" 
            />
          </div>
        </div>
      </section>

    

      {/* --- VISION & MISSION SECTION --- */}
      <section className="about-vision-mission">
        <div className="vm-grid">
          {/* Mission Card */}
          <div className="vm-card">
            <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d" alt="Our Mission" />
            <h3>Our Mission</h3>
            <p>
              To provide an unparalleled hospitality experience by combining 
              modern luxury with the authentic, warm spirit of Myanmar, 
              ensuring every guest feels valued, relaxed, and inspired.
            </p>
          </div>
          
          {/* Vision Card */}
          <div className="vm-card">
            <img src="/images/17.jpg" alt="Our Vision" />
            <h3>Our Vision</h3>
            <p>
              To be the premier destination in Mandalay, recognized for 
              excellence in service, innovative design, and our commitment 
              to preserving local culture while setting new standards for 
              international luxury.
            </p>
          </div>
        </div>
      </section>

      {/* --- MATRIX / COUNTER HIGHLIGHTS SECTION --- */}
      <section className="about-highlights">
        <div className="highlight-grid">
          <div className="highlight-card">
            <h3>50</h3>
            <p>Luxury Rooms & Suites</p>
          </div>
          <div className="highlight-card">
            <h3>860 m²</h3>
            <p>Grand Pillarless Ballroom</p>
          </div>
          <div className="highlight-card">
            <h3>5*</h3>
            <p>Restaurants & Dynamic Bars</p>
          </div>
          <div className="highlight-card">
            <h3>100%</h3>
            <p>Premium Wellness &  Experience</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;