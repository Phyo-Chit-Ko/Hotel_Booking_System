import React, { useState } from 'react';
import './Restaurant.css';

const restaurantData = [
  {
    id: 'tingyuan',
    name: 'Rest Room',
    description: 'RELAX Restaurant serves as a premier culinary sanctuary within the Mingalar Mandalay Hotel. Our chefs masterfully blend traditional techniques with contemporary flair, offering an immersive dining experience defined by authentic flavors and an atmosphere of refined elegance.',
    media: ['/images/2.jpg', '/images/3.jpg']
  },
  {
    id: 'district',
    name: 'Bar Lounge',
    description: 'Elevate your evening in our sophisticated Bar Lounge. Designed for those who appreciate the finer things, our lounge features a curated menu of artisanal cocktails and gourmet light bites, providing the perfect backdrop for social gatherings or quiet moments of indulgence.',
    media: ['/images/7.jpg', '/images/6.jpg']
  },
  {
    id: 'food-menu',
    name: 'Food Menu',
    description: 'Embark on a global culinary journey through our chef-curated selection. From the vibrant, intricate spices of Asia to the timeless, comforting classics of Europe, our menu celebrates the art of gastronomy, utilizing only the freshest seasonal ingredients to delight your palate.',
    media: ['/images/8.jpg', '/images/9.jpg', '/images/10.jpg', '/images/11.jpg','/images/12.jpg','/images/13.jpg','/images/14.jpg','/images/15.jpg']
  }
];

export default function Restaurant() {
  const [activeTab, setActiveTab] = useState(restaurantData[0]);

  return (
    <div className="restaurant-page">
      
      {/* Full-width Header with Scroll Arrow */}
      <div className="header-image-container">
        <img src="/images/4.jpg" alt="Restaurant Banner" className="header-banner" />
        
        <button 
          className="scroll-arrow" 
          onClick={() => {
            document.querySelector('.restaurant-tabs').scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
          </svg>
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="restaurant-tabs">
        {restaurantData.map((item) => (
          <button 
            key={item.id} 
            className={activeTab.id === item.id ? 'active' : ''}
            onClick={() => setActiveTab(item)}
          >
            {item.name}
          </button>
        ))}
      </nav>

      {/* Content Section */}
      <div className="restaurant-content">
        
       {/* Gallery Grid */}
<div className={`restaurant-media-container ${activeTab.id === 'food-menu' ? 'small-grid' : ''}`}>
  {activeTab.media.map((media, index) => {
    const isVideo = media.toLowerCase().endsWith('.mp4');
    return isVideo ? (
      <video key={index} src={media} muted autoPlay loop playsInline className="restaurant-media" />
    ) : (
      <img key={index} src={media} alt={`${activeTab.name} ${index + 1}`} className="restaurant-media" />
    );
  })}
</div>
        
        {/* Descriptive Text */}
        <div className="text-content">
          <h1>{activeTab.name}</h1>
          <p>{activeTab.description}</p>
        </div>
      </div>
    </div>
  );
}