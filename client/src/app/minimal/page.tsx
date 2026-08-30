'use client';

/**
 * Ultra-minimal test - No dependencies
 */

export default function MinimalTest() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>✅ React is Working!</h1>
      <p>If you can see this, Next.js is rendering correctly.</p>
      <button 
        onClick={() => alert('JavaScript works!')}
        style={{
          background: '#667eea',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Click
      </button>
    </div>
  );
}
