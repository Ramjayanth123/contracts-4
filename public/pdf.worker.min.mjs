
// PDF.js Worker for Vite-based applications
// This file serves as a fallback worker when the dynamic import fails
// It should match the version of the installed pdfjs-dist package (4.4.168)

// Import the actual worker from unpkg CDN as a fallback
// This ensures we have a working worker even if the dynamic import fails
importScripts('https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs');

console.log('PDF.js worker loaded from public directory fallback (version 4.4.168)');
