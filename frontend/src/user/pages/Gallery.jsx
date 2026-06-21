import React, { useState } from 'react'; // 1. Added useState
import './gallery.css';

const galleryImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1566073771259-6a8506099945", alt: "Hotel Exterior" },
  { id: 2, src: "https://images.unsplash.com/photo-1582719508461-905c673771fd", alt: "Hotel Entrance" },
  { id: 3, src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef", alt: "Bar Lounge" },
  { id: 4, src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0", alt: "Fine Dining" },
  { id: 5, src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d", alt: "Restaurant Seating" },
  { id: 6, src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4", alt: "Main Restaurant" },
  { id: 7, src: "https://images.unsplash.com/photo-1543007630-9710e4a00a20", alt: "Cocktail Bar" },
  { id: 8, src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d", alt: "Live Kitchen Area" },
  { id: 9, src: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf", alt: "Chef Cooking" },
  
];

function Gallery({ sidebarOpen }) {
  // 2. State to hold the specific image clicked
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className={`gallery-container ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      
      <header className="gallery-hero">
        <div className="hero-overlay">
          <span className="subtitle">IMAGES & VIDEOS</span>
          <h1 className="hero-title">Our Gallery</h1>
        </div>
      </header>

      <main className="gallery-content">
        <div className="section-header">
          <span className="gold-tag">IMAGES</span>
          <h2 className="section-title">Image Gallery</h2>
        </div>

        <div className="image-grid">
          {galleryImages.map((image) => (
            <div 
              key={image.id} 
              className="grid-item" 
              onClick={() => setSelectedImage(image)} // 3. Update state with clicked image
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
              <div className="image-hover-overlay">
                <span className="view-text">View Image</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 4. Modal shows ONLY if selectedImage is not null */}
      {selectedImage && (
        <div className="modal" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage.src} alt={selectedImage.alt} />
        </div>
      )}
    </div>
  );
}

export default Gallery;