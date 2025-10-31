/**
 * Emergency Blue Banner Fix
 * Fixes styling issues with blue banners across the site
 */

(function() {
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Find all blue banners
    const blueBanners = document.querySelectorAll('.blue-banner, .info-banner');
    
    if (blueBanners.length === 0) {
      return; // No banners to fix
    }
    
    // Apply fixes to each banner
    blueBanners.forEach(function(banner) {
      // Fix padding and margin
      banner.style.padding = '15px 20px';
      banner.style.marginBottom = '20px';
      
      // Fix text contrast
      banner.style.color = '#ffffff';
      
      // Ensure proper background color
      banner.style.backgroundColor = '#4a6cf7';
      
      // Add border radius for consistent styling
      banner.style.borderRadius = '6px';
      
      // Fix any overflow issues
      banner.style.overflow = 'hidden';
    });
  });
})();