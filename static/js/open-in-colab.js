/**
 * JavaScript utility to open notebooks in Google Colab
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add "Open in Colab" button to any notebook iframe
    const addOpenInColabButton = () => {
        const notebookIframes = document.querySelectorAll('.notebook-iframe');
        
        notebookIframes.forEach(iframe => {
            const notebookPath = iframe.getAttribute('data-notebook-path');
            if (!notebookPath) return;
            
            // Create the button container
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'open-in-colab-container';
            
            // Create the button
            const button = document.createElement('a');
            button.className = 'btn btn-primary open-in-colab-btn';
            button.href = `https://colab.research.google.com/github/SamMcfarlane-pursuit/llm-fine-tuning-thesaurus/blob/main/${notebookPath}`;
            button.target = '_blank';
            button.innerHTML = '<i class="bi bi-box-arrow-up-right me-2"></i>Open in Colab';
            
            // Add the button to the container
            buttonContainer.appendChild(button);
            
            // Add the container before the iframe
            iframe.parentNode.insertBefore(buttonContainer, iframe);
        });
    };
    
    // Call the function
    addOpenInColabButton();
});
