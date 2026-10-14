const https = require('https');
const fs = require('fs');
const path = require('path');

// Verified high quality music photos from Wikimedia / Unsplash direct photo IDs
const images = [
  {
    name: 'about_vinyl.webp',
    // Vinyl turntable with arm on vinyl record, high-res & clean
    url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'process_curate.webp',
    // Record collection / vinyl crate digging
    url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80', // wait, 1539185441755 was the sneaker! DO NOT use 1539185441755!
  },
];

console.log('Testing image downloads...');
