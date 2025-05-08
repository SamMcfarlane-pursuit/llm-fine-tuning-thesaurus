/**
 * Font Loader JavaScript
 * Handles font loading to prevent Flash of Invisible Text (FOIT)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add fonts-loading class to document
    document.documentElement.classList.add('fonts-loading');
    
    // Check if FontFace API is supported
    if ('FontFace' in window) {
        Promise.all([
            // Load Roboto fonts
            new FontFace('Roboto', 'url(https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2) format("woff2")', {
                weight: '400',
                style: 'normal'
            }).load(),
            
            new FontFace('Roboto', 'url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fBBc4.woff2) format("woff2")', {
                weight: '300',
                style: 'normal'
            }).load(),
            
            new FontFace('Roboto', 'url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2) format("woff2")', {
                weight: '500',
                style: 'normal'
            }).load(),
            
            new FontFace('Roboto', 'url(https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2) format("woff2")', {
                weight: '700',
                style: 'normal'
            }).load(),
            
            // Load Fira Code fonts for code blocks
            new FontFace('Fira Code', 'url(https://fonts.gstatic.com/s/firacode/v21/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_D1sJVD7MOzlojwUKaJO.woff2) format("woff2")', {
                weight: '400',
                style: 'normal'
            }).load(),
            
            new FontFace('Fira Code', 'url(https://fonts.gstatic.com/s/firacode/v21/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_A9sJVD7MOzlojwUKaJO.woff2) format("woff2")', {
                weight: '500',
                style: 'normal'
            }).load()
        ])
        .then(function(loadedFonts) {
            // Add all loaded fonts to the document
            loadedFonts.forEach(function(font) {
                document.fonts.add(font);
            });
            
            // Mark fonts as loaded
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
            
            // Store in session storage to avoid reloading on subsequent page views
            sessionStorage.setItem('fontsLoaded', 'true');
            
            console.log('All fonts loaded successfully');
        })
        .catch(function(error) {
            console.error('Error loading fonts:', error);
            
            // Fallback to system fonts if loading fails
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-failed');
        });
    } else {
        // Fallback for browsers that don't support FontFace API
        // Use CSS font-display: swap instead
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
    }
    
    // Check if fonts were already loaded in this session
    if (sessionStorage.getItem('fontsLoaded') === 'true') {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
    }
});

// Optimization for subsequent page loads
if (sessionStorage.getItem('fontsLoaded') === 'true') {
    document.documentElement.classList.add('fonts-loaded');
}
