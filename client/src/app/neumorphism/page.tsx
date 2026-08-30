'use client';

import React, { useState } from 'react';
import { HiSearch, HiHeart, HiBell, HiUser, HiCog, HiDownload } from 'react-icons/hi';

export default function NeumorphismShowcase() {
  const [toggleActive, setToggleActive] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <div style={{ minHeight: '100vh', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="neu-text-primary" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
            Neumorphism UI
          </h1>
          <p className="neu-text-secondary" style={{ fontSize: '1.125rem' }}>
            Soft, clean, and modern interface components
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <div className="neu-stat-card">
            <div className="neu-stat-label">Total Revenue</div>
            <div className="neu-stat-value">$47.2K</div>
            <div className="neu-text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              ↗ +18.2% from last month
            </div>
          </div>
          
          <div className="neu-stat-card">
            <div className="neu-stat-label">Active Users</div>
            <div className="neu-stat-value">2,845</div>
            <div className="neu-text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              ↗ +24.5% from last month
            </div>
          </div>
          
          <div className="neu-stat-card">
            <div className="neu-stat-label">Conversions</div>
            <div className="neu-stat-value">463</div>
            <div className="neu-text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              ↗ +12.8% from last month
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="neu-card" style={{ marginBottom: '2rem' }}>
          <h3 className="neu-text-primary" style={{ marginBottom: '1.5rem' }}>Buttons</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <button className="neu-button">Default Button</button>
            <button className="neu-button-primary">Primary Button</button>
            <button className="neu-button-success">Success Button</button>
            <button className="neu-icon-button">
              <HiHeart size={20} />
            </button>
            <button className="neu-icon-button">
              <HiBell size={20} />
            </button>
            <button className="neu-icon-button">
              <HiUser size={20} />
            </button>
            <button className="neu-icon-button">
              <HiCog size={20} />
            </button>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="neu-card" style={{ marginBottom: '2rem' }}>
          <h3 className="neu-text-primary" style={{ marginBottom: '1.5rem' }}>Input Fields</h3>
          
          {/* Search Bar */}
          <div className="neu-search" style={{ marginBottom: '1.5rem' }}>
            <HiSearch className="neu-search-icon" size={18} />
            <input 
              type="text" 
              className="neu-search-input" 
              placeholder="Search for anything..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="neu-text-primary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Email Address
              </label>
              <input 
                type="email" 
                className="neu-input" 
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="neu-text-primary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Full Name
              </label>
              <input 
                type="text" 
                className="neu-input" 
                placeholder="John Doe"
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label className="neu-text-primary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Message
            </label>
            <textarea 
              className="neu-textarea" 
              placeholder="Write your message here..."
            />
          </div>
        </div>

        {/* Controls Section */}
        <div className="neu-card" style={{ marginBottom: '2rem' }}>
          <h3 className="neu-text-primary" style={{ marginBottom: '1.5rem' }}>Interactive Controls</h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <label className="neu-text-primary" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Toggle Switch
            </label>
            <div 
              className={`neu-toggle ${toggleActive ? 'active' : ''}`}
              onClick={() => setToggleActive(!toggleActive)}
            >
              <div className="neu-toggle-slider"></div>
            </div>
            <span className="neu-text-secondary" style={{ marginLeft: '1rem', fontSize: '0.875rem' }}>
              {toggleActive ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="neu-text-primary" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Slider ({sliderValue}%)
            </label>
            <input 
              type="range" 
              className="neu-slider" 
              min="0" 
              max="100" 
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label className="neu-text-primary" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
              Progress Bar
            </label>
            <div className="neu-progress">
              <div className="neu-progress-bar" style={{ width: `${sliderValue}%` }}></div>
            </div>
          </div>
        </div>

        {/* Badges & Chips */}
        <div className="neu-card" style={{ marginBottom: '2rem' }}>
          <h3 className="neu-text-primary" style={{ marginBottom: '1.5rem' }}>Badges & Tags</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <span className="neu-badge">Default Badge</span>
            <span className="neu-badge-primary">Primary Badge</span>
            <span className="neu-badge">
              <HiDownload size={14} />
              With Icon
            </span>
            <span className="neu-badge">Marketing</span>
            <span className="neu-badge">Design</span>
            <span className="neu-badge">Development</span>
          </div>
        </div>

        {/* Card Variations */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div className="neu-card">
            <h4 className="neu-text-primary" style={{ marginBottom: '1rem' }}>Raised Card</h4>
            <p className="neu-text-secondary" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
              This card has a raised effect with outer shadows that make it appear elevated from the surface.
            </p>
          </div>

          <div className="neu-card-flat">
            <h4 className="neu-text-primary" style={{ marginBottom: '1rem' }}>Flat Card</h4>
            <p className="neu-text-secondary" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
              This card has an inset effect with inner shadows that make it appear pressed into the surface.
            </p>
          </div>

          <div className="neu-card-convex">
            <h4 className="neu-text-primary" style={{ marginBottom: '1rem' }}>Convex Card</h4>
            <p className="neu-text-secondary" style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
              This card has a gradient background that creates a subtle bulging or convex appearance.
            </p>
          </div>
        </div>

        {/* Action Card */}
        <div className="neu-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 className="neu-text-primary" style={{ marginBottom: '0.5rem' }}>Ready to get started?</h3>
              <p className="neu-text-secondary">Create beautiful neumorphic interfaces in minutes.</p>
            </div>
            <button className="neu-button-primary">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
