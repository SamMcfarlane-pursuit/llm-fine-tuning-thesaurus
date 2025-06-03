/**
 * AI Assistant Visibility Test
 * Ensures the AI assistant button is visible and working properly
 */

console.log('🔍 AI Assistant Visibility Test: Starting...');

// Wait for DOM to be ready
function testAIAssistantVisibility() {
    console.log('🤖 Testing AI Assistant visibility...');

    // Check for Simple AI button first (our primary AI button)
    const simpleAIButton = document.getElementById('simple-ai-button');
    if (simpleAIButton) {
        console.log('✅ Simple AI Button found and working!', simpleAIButton);
        const rect = simpleAIButton.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0;
        console.log(`📊 Simple AI Button visibility: ${isVisible}, Size: ${rect.width}x${rect.height}`);

        if (isVisible) {
            console.log('🎉 Simple AI Button is properly visible and positioned!');
            return {
                simpleAIButton: true,
                buttonVisible: true,
                buttonSize: `${rect.width}x${rect.height}`,
                status: 'success'
            };
        }
    } else {
        console.log('❌ Simple AI Button not found!');
    }

    // Check for other AI assistant buttons as fallback
    const aiButtons = document.querySelectorAll(`
        .unified-ai-button,
        .final-ai-button,
        .working-ai-button,
        .ai-assistant-button,
        .simple-ai-button,
        [class*="ai-button"],
        [id*="ai-button"],
        [class*="ai-assistant"],
        [id*="ai-assistant"]
    `);

    console.log(`🔍 Found ${aiButtons.length} AI-related elements:`, aiButtons);

    // Check for robot emoji buttons
    const robotButtons = Array.from(document.querySelectorAll('button, div, a')).filter(el =>
        el.innerHTML && el.innerHTML.includes('🤖')
    );

    console.log(`🤖 Found ${robotButtons.length} robot emoji elements:`, robotButtons);

    // Check for fixed positioned elements in bottom right
    const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'fixed' &&
               (style.bottom !== 'auto' || style.right !== 'auto');
    });

    console.log(`📍 Found ${fixedElements.length} fixed positioned elements:`, fixedElements);

    // Check if unified AI assistant is initialized
    if (window.unifiedAI) {
        console.log('✅ Unified AI Assistant object found:', window.unifiedAI);
    } else {
        console.log('❌ Unified AI Assistant object not found');
    }

    // Check for AI assistant interface
    const aiInterface = document.querySelector('.unified-ai-interface');
    if (aiInterface) {
        console.log('✅ AI Interface found:', aiInterface);
        console.log('Interface display style:', aiInterface.style.display);
    } else {
        console.log('❌ AI Interface not found');
    }

    // Check if toggleSimpleAI function exists
    if (typeof toggleSimpleAI === 'function') {
        console.log('✅ toggleSimpleAI function is available');
    } else {
        console.log('❌ toggleSimpleAI function not found');
    }

    // Force create AI assistant if not found
    if (!simpleAIButton && aiButtons.length === 0 && robotButtons.length === 0) {
        console.log('🚨 No AI assistant found! Creating emergency AI button...');
        createEmergencyAIButton();
    }

    return {
        simpleAIButton: !!simpleAIButton,
        aiButtons: aiButtons.length,
        robotButtons: robotButtons.length,
        fixedElements: fixedElements.length,
        unifiedAI: !!window.unifiedAI,
        aiInterface: !!aiInterface,
        toggleFunction: typeof toggleSimpleAI === 'function'
    };
}

function createEmergencyAIButton() {
    console.log('🆘 Creating emergency AI assistant button...');

    // Remove any existing emergency buttons
    const existingEmergency = document.querySelectorAll('.emergency-ai-button');
    existingEmergency.forEach(btn => btn.remove());

    // Create emergency AI button with same styling as simple AI button
    const button = document.createElement('div');
    button.id = 'emergency-ai-button';
    button.className = 'emergency-ai-button';
    button.innerHTML = '🤖';
    button.title = 'Emergency AI Assistant - Backup System';

    // Style the button to match simple AI button
    button.style.cssText = `
        position: fixed !important;
        bottom: 25px !important;
        right: 25px !important;
        width: 70px !important;
        height: 70px !important;
        background: linear-gradient(135deg, #3c6430, #4f7a41) !important;
        border: 3px solid #5a8a4d !important;
        border-radius: 50% !important;
        color: white !important;
        font-size: 30px !important;
        cursor: pointer !important;
        box-shadow: 0 10px 30px rgba(60, 100, 48, 0.6) !important;
        font-family: Arial, sans-serif !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        user-select: none !important;
        animation: emergencyPulse 2s infinite !important;
    `;

    // Add emergency pulse animation
    if (!document.getElementById('emergency-ai-styles')) {
        const style = document.createElement('style');
        style.id = 'emergency-ai-styles';
        style.textContent = `
            @keyframes emergencyPulse {
                0% {
                    box-shadow: 0 10px 30px rgba(60, 100, 48, 0.6), 0 0 0 0 rgba(255, 193, 7, 0.7);
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 10px 30px rgba(60, 100, 48, 0.6), 0 0 0 15px rgba(255, 193, 7, 0);
                    transform: scale(1.05);
                }
                100% {
                    box-shadow: 0 10px 30px rgba(60, 100, 48, 0.6), 0 0 0 0 rgba(255, 193, 7, 0);
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add hover effects
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 15px 40px rgba(60, 100, 48, 0.8)';
        button.style.animation = 'none';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 10px 30px rgba(60, 100, 48, 0.6)';
        button.style.animation = 'emergencyPulse 2s infinite';
    });

    // Click handler - try to use simple AI functionality if available
    button.addEventListener('click', () => {
        console.log('🤖 Emergency AI Assistant clicked!');

        // Try to use toggleSimpleAI if available
        if (typeof toggleSimpleAI === 'function') {
            console.log('✅ Using toggleSimpleAI function');
            toggleSimpleAI();
        } else {
            console.log('⚠️ toggleSimpleAI not available, showing emergency interface');
            showEmergencyAIInterface();
        }
    });

    document.body.appendChild(button);
    console.log('✅ Emergency AI button created successfully!');
}

function showEmergencyAIInterface() {
    const existingInterface = document.getElementById('emergency-ai-interface');
    if (existingInterface) {
        existingInterface.remove();
        return;
    }

    const interface = document.createElement('div');
    interface.id = 'emergency-ai-interface';
    interface.innerHTML = `
        <div style="position: fixed; bottom: 110px; right: 25px; width: 350px; height: 400px; background: #0d140a; border: 2px solid #ffc107; border-radius: 12px; z-index: 999998; font-family: Arial, sans-serif; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);">
            <div style="background: linear-gradient(135deg, #ffc107, #e0a800); color: #000; padding: 15px; border-radius: 10px 10px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">🚨</span>
                    <span style="font-weight: bold;">Emergency AI Assistant</span>
                </div>
                <button onclick="document.getElementById('emergency-ai-interface').remove()" style="background: none; border: none; color: #000; font-size: 18px; cursor: pointer;">×</button>
            </div>
            <div style="flex: 1; padding: 15px; color: #e2eedd; overflow-y: auto; font-size: 13px; line-height: 1.4;">
                <div style="margin-bottom: 15px; padding: 12px; background: rgba(255, 193, 7, 0.15); border-radius: 6px; border-left: 4px solid #ffc107;">
                    <div style="font-weight: bold; margin-bottom: 6px; color: #ffc107;">⚠️ Backup AI System Active</div>
                    <div>The main AI assistant may not be loading properly. This is the emergency backup interface.</div>
                </div>

                <div style="margin-bottom: 12px;">
                    <div style="font-weight: bold; margin-bottom: 8px; color: #a7cf9b;">🔧 Troubleshooting:</div>
                    <div style="margin-bottom: 6px;">• Refresh the page (Ctrl+F5 or Cmd+R)</div>
                    <div style="margin-bottom: 6px;">• Check browser console for errors</div>
                    <div style="margin-bottom: 6px;">• Clear browser cache and cookies</div>
                    <div style="margin-bottom: 6px;">• Try a different browser</div>
                </div>

                <div style="margin-bottom: 12px; padding: 10px; background: rgba(60, 100, 48, 0.1); border-radius: 6px;">
                    <div style="font-weight: bold; margin-bottom: 6px; color: #a7cf9b;">📍 Available Features:</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <a href="/learn" style="color: #a7cf9b; text-decoration: none; padding: 3px 6px; background: rgba(60, 100, 48, 0.2); border-radius: 3px; font-size: 11px;">📚 Learn</a>
                        <a href="/workshops" style="color: #a7cf9b; text-decoration: none; padding: 3px 6px; background: rgba(60, 100, 48, 0.2); border-radius: 3px; font-size: 11px;">🔧 Workshops</a>
                        <a href="/tutorials" style="color: #a7cf9b; text-decoration: none; padding: 3px 6px; background: rgba(60, 100, 48, 0.2); border-radius: 3px; font-size: 11px;">📖 Tutorials</a>
                    </div>
                </div>

                <div style="font-size: 11px; color: #999; text-align: center; margin-top: 10px;">
                    🚨 <em>Emergency AI Assistant - Backup System</em>
                </div>
            </div>
            <div style="padding: 12px; border-top: 1px solid #ffc107;">
                <button onclick="location.reload()" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #ffc107, #e0a800); color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px;">
                    🔄 Refresh Page
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(interface);
}

// Run test when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testAIAssistantVisibility, 2000);
    });
} else {
    setTimeout(testAIAssistantVisibility, 2000);
}

// Run test again after 5 seconds to catch dynamically loaded content
setTimeout(() => {
    console.log('🔄 Running AI Assistant visibility test again...');
    const results = testAIAssistantVisibility();
    console.log('📊 Final test results:', results);
}, 5000);

console.log('✅ AI Assistant Visibility Test script loaded');
