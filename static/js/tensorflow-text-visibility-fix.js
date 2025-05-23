/**
 * TensorFlow Text Visibility Fix
 * Specifically targets and enhances text visibility in the TensorFlow section
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fix TensorFlow text visibility
    fixTensorFlowTextVisibility();

    // Re-apply fix when theme changes
    document.addEventListener('themeChanged', function() {
        fixTensorFlowTextVisibility();
    });

    // Observe DOM changes to fix dynamically added content
    observeTensorFlowContentChanges();
});

/**
 * Fix text visibility in TensorFlow sections
 */
function fixTensorFlowTextVisibility() {
    console.log('Fixing TensorFlow text visibility...');

    // Check if we're in dark mode
    const isDarkMode = !document.body.classList.contains('light-theme');

    // Find all TensorFlow sections
    const tensorflowSections = document.querySelectorAll('.framework-section.tensorflow-section');

    tensorflowSections.forEach(section => {
        // Apply balanced background to section based on theme
        if (isDarkMode) {
            // Dark mode styling with updated colors from realtimecolors.com
            section.style.backgroundColor = '#020024'; // secondary color
            section.style.border = '1px solid #8a88ad'; // primary color from realtimecolors.com
            section.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        } else {
            // Light mode styling with exact colors from the image
            section.style.backgroundColor = '#FFFFFF'; // White background (from second box in image)
            section.style.border = '1px solid #dddbff'; // secondary color (from fourth box in image)
            section.style.boxShadow = '0 4px 15px rgba(221, 219, 255, 0.6)';
            section.style.borderRadius = '8px';
        }

        // Common styling
        section.style.borderRadius = '8px';
        section.style.padding = '2rem';
        section.style.margin = '2rem 0';

        // Fix headings with balanced colors
        const headings = section.querySelectorAll('h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            if (isDarkMode) {
                // Dark mode heading styling
                if (heading.tagName === 'H2') {
                    heading.style.color = '#eae9fc'; // text color from realtimecolors.com
                    heading.style.fontWeight = '700';
                    heading.style.textShadow = 'none';
                    heading.style.marginBottom = '1.2rem';
                    heading.style.borderBottom = '2px solid rgba(138, 136, 173, 0.3)'; // primary with opacity
                    heading.style.paddingBottom = '0.5rem';
                } else if (heading.tagName === 'H3') {
                    heading.style.color = '#eae9fc'; // text color from realtimecolors.com
                    heading.style.fontWeight = '600';
                    heading.style.textShadow = 'none';
                    heading.style.marginTop = '1.8rem';
                    heading.style.marginBottom = '1rem';
                } else {
                    heading.style.color = 'rgba(234, 233, 252, 0.9)'; // text with opacity from realtimecolors.com
                    heading.style.fontWeight = '500';
                    heading.style.textShadow = 'none';
                    heading.style.marginTop = '1.5rem';
                    heading.style.marginBottom = '0.8rem';
                }
            } else {
                // Light mode heading styling with exact colors from the image
                if (heading.tagName === 'H2') {
                    heading.style.color = '#3531d8'; // primary color from image
                    heading.style.fontWeight = '700';
                    heading.style.textShadow = 'none';
                    heading.style.marginBottom = '1.2rem';
                    heading.style.borderBottom = '2px solid rgba(53, 49, 216, 0.2)'; // primary with opacity
                    heading.style.paddingBottom = '0.5rem';
                    heading.style.fontSize = '3.158rem'; // 50.56px as specified
                    heading.style.letterSpacing = '0.01em';
                    heading.style.fontFamily = "'Noto Sans Modi', sans-serif";
                } else if (heading.tagName === 'H3') {
                    heading.style.color = '#3531d8'; // primary color from image
                    heading.style.fontWeight = '600';
                    heading.style.textShadow = 'none';
                    heading.style.marginTop = '1.8rem';
                    heading.style.marginBottom = '1rem';
                    heading.style.fontSize = '2.369rem'; // 37.92px as specified
                    heading.style.letterSpacing = '0.01em';
                    heading.style.fontFamily = "'Noto Sans Modi', sans-serif";
                } else {
                    heading.style.color = '#040316'; // text color from image
                    heading.style.fontWeight = '500';
                    heading.style.textShadow = 'none';
                    heading.style.marginTop = '1.5rem';
                    heading.style.marginBottom = '0.8rem';
                    heading.style.letterSpacing = '0.01em';
                    heading.style.fontFamily = "'Noto Sans Modi', sans-serif";
                }
            }
        });

        // Fix paragraphs with balanced colors
        const paragraphs = section.querySelectorAll('p');
        paragraphs.forEach(paragraph => {
            if (isDarkMode) {
                paragraph.style.color = '#eae9fc'; // dark mode text color from realtimecolors.com
            } else {
                paragraph.style.color = '#040316'; // text color from image
                paragraph.style.fontSize = '1rem';
                paragraph.style.letterSpacing = '0.01em';
                paragraph.style.fontFamily = "'Noto Sans Modi', sans-serif";
            }
            paragraph.style.fontWeight = '400';
            paragraph.style.lineHeight = '1.7';
            paragraph.style.textShadow = 'none';
            paragraph.style.marginBottom = '1.2rem';
        });

        // Fix list items with balanced colors
        const lists = section.querySelectorAll('ul, ol');
        lists.forEach(list => {
            list.style.paddingLeft = '1.5rem';
            list.style.marginBottom = '1.5rem';
        });

        const listItems = section.querySelectorAll('li');
        listItems.forEach(item => {
            if (isDarkMode) {
                item.style.color = '#eae9fc'; // dark mode text color from realtimecolors.com
            } else {
                item.style.color = '#040316'; // text color from image
                item.style.fontSize = '1rem';
                item.style.letterSpacing = '0.01em';
                item.style.fontFamily = "'Noto Sans Modi', sans-serif";
            }
            item.style.fontWeight = '400';
            item.style.lineHeight = '1.7';
            item.style.textShadow = 'none';
            item.style.marginBottom = '0.5rem';
            item.style.position = 'relative';
        });

        // Fix code blocks with balanced colors
        const codeBlocks = section.querySelectorAll('.framework-code.tensorflow-code');
        codeBlocks.forEach(codeBlock => {
            if (isDarkMode) {
                codeBlock.style.backgroundColor = '#030312'; // Slightly lighter than background
                codeBlock.style.borderLeft = '5px solid #8a88ad'; // primary color from realtimecolors.com
                codeBlock.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
            } else {
                codeBlock.style.backgroundColor = '#f5f5ff'; // Light code background
                codeBlock.style.borderLeft = '5px solid #3531d8'; // primary color from image
                codeBlock.style.boxShadow = '0 6px 16px rgba(53, 49, 216, 0.08)'; // Enhanced shadow with primary color
                codeBlock.style.border = '1px solid #dddbff'; // secondary color from image
            }
            codeBlock.style.borderRadius = '6px';
            codeBlock.style.margin = '1.5rem 0';

            const preElements = codeBlock.querySelectorAll('pre, code');
            preElements.forEach(pre => {
                if (isDarkMode) {
                    pre.style.color = '#eae9fc'; // dark mode text color from realtimecolors.com
                } else {
                    pre.style.color = '#040316'; // light mode text color
                }
                pre.style.textShadow = 'none';
                pre.style.fontFamily = "'Fira Code', Consolas, Monaco, 'Andale Mono', monospace";
                pre.style.fontSize = '0.95rem';
                pre.style.lineHeight = '1.5';
            });

            const codeHeaders = codeBlock.querySelectorAll('.code-header');
            codeHeaders.forEach(header => {
                if (isDarkMode) {
                    header.style.backgroundColor = '#0a0a2a'; // Slightly lighter than background
                    header.style.color = '#eae9fc'; // dark mode text color from realtimecolors.com
                    header.style.borderBottom = '1px solid rgba(138, 136, 173, 0.3)'; // primary with opacity
                } else {
                    header.style.backgroundColor = '#dddbff'; // secondary color from image
                    header.style.color = '#040316'; // text color from image
                    header.style.borderBottom = '1px solid rgba(53, 49, 216, 0.2)'; // primary with opacity
                    header.style.fontWeight = '600';
                    header.style.fontSize = '0.95rem';
                    header.style.borderTopLeftRadius = '6px';
                    header.style.borderTopRightRadius = '6px';
                    header.style.fontFamily = "'Noto Sans Modi', sans-serif";
                }
                header.style.fontWeight = '600';
                header.style.textShadow = 'none';
                header.style.padding = '0.6rem 1rem';
            });
        });

        // Fix links with balanced colors
        const links = section.querySelectorAll('a:not(.btn)');
        links.forEach(link => {
            if (isDarkMode) {
                link.style.color = '#8a88ad'; // dark mode primary color from realtimecolors.com
                link.style.borderBottom = '1px solid rgba(138, 136, 173, 0.3)'; // primary with opacity

                // Add hover effect for dark mode
                link.addEventListener('mouseenter', function() {
                    this.style.color = '#0600c2'; // dark mode accent color from realtimecolors.com
                    this.style.borderBottom = '1px solid rgba(6, 0, 194, 0.7)'; // accent with opacity
                });

                link.addEventListener('mouseleave', function() {
                    this.style.color = '#8a88ad'; // dark mode primary color from realtimecolors.com
                    this.style.borderBottom = '1px solid rgba(138, 136, 173, 0.3)'; // primary with opacity
                });
            } else {
                link.style.color = '#3531d8'; // primary color from image
                link.style.borderBottom = '1px solid rgba(53, 49, 216, 0.3)'; // primary with opacity
                link.style.fontSize = '1rem';
                link.style.fontFamily = "'Noto Sans Modi', sans-serif";

                // Add hover effect for light mode
                link.addEventListener('mouseenter', function() {
                    this.style.color = '#443dff'; // accent color from image
                    this.style.borderBottom = '1px solid rgba(68, 61, 255, 0.7)'; // accent with opacity
                    this.style.transition = 'all 0.2s ease';
                });

                link.addEventListener('mouseleave', function() {
                    this.style.color = '#3531d8'; // primary color from image
                    this.style.borderBottom = '1px solid rgba(53, 49, 216, 0.3)'; // primary with opacity
                    this.style.transition = 'all 0.2s ease';
                });
            }

            link.style.fontWeight = '500';
            link.style.textDecoration = 'none';
            link.style.transition = 'all 0.2s ease';
            link.style.textShadow = 'none';
            link.style.paddingBottom = '1px';
        });

        // Fix buttons with balanced colors and proper layout
        const buttons = section.querySelectorAll('.btn');
        buttons.forEach(button => {
            // Layout properties (common for all button types)
            button.style.margin = '0.5rem 1rem 0.5rem 0'; // Proper spacing between buttons
            button.style.display = 'inline-block'; // Ensure proper layout
            button.style.textAlign = 'center';
            button.style.verticalAlign = 'middle';
            button.style.webkitUserSelect = 'none'; // Safari support
            button.style.mozUserSelect = 'none'; // Firefox support
            button.style.msUserSelect = 'none'; // IE/Edge support
            button.style.userSelect = 'none';
            button.style.lineHeight = '1.5';
            button.style.fontSize = '0.95rem';
            button.style.letterSpacing = '0.01em';
            button.style.textDecoration = 'none';
            button.style.whiteSpace = 'nowrap'; // Prevent text wrapping
            button.style.borderWidth = '1px';
            button.style.borderStyle = 'solid';
            button.style.cursor = 'pointer';
            button.style.padding = '0.5rem 1.25rem'; // Slightly wider padding for better proportions
            button.style.borderRadius = '4px';
            button.style.transition = 'all 0.2s ease';
            button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
            button.style.fontWeight = '600';
            button.style.textShadow = 'none';

            // Remove any conflicting styles that might interfere
            button.style.float = 'none';
            button.style.position = 'static';
            button.style.zIndex = 'auto';

            // Apply specific styles based on button type and theme
            if (isDarkMode) {
                // Dark mode button styling
                if (button.classList.contains('btn-primary') || (!button.classList.contains('btn-secondary') &&
                    !button.classList.contains('btn-success') && !button.classList.contains('btn-danger') &&
                    !button.classList.contains('btn-warning') && !button.classList.contains('btn-info') &&
                    !button.classList.contains('btn-light') && !button.classList.contains('btn-dark') &&
                    !button.classList.contains('btn-outline-primary'))) {
                    // Primary button (default) in dark mode
                    button.style.backgroundColor = '#8a88ad'; // primary color from realtimecolors.com
                    button.style.borderColor = '#8a88ad'; // primary color from realtimecolors.com
                    button.style.color = '#eae9fc'; // text color from realtimecolors.com

                    // Add hover effect
                    button.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = '#0600c2'; // accent color from realtimecolors.com
                        this.style.borderColor = '#0600c2'; // accent color from realtimecolors.com
                        this.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.3)';
                        this.style.transform = 'translateY(-1px)';
                    });

                    button.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = '#8a88ad'; // primary color from realtimecolors.com
                        this.style.borderColor = '#8a88ad'; // primary color from realtimecolors.com
                        this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
                        this.style.transform = 'translateY(0)';
                    });
                } else if (button.classList.contains('btn-secondary')) {
                    // Secondary button in dark mode
                    button.style.backgroundColor = '#020024'; // secondary color from realtimecolors.com
                    button.style.borderColor = '#8a88ad'; // primary color from realtimecolors.com
                    button.style.color = '#eae9fc'; // text color from realtimecolors.com

                    // Add hover effect
                    button.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = '#0a0a2a'; // Slightly lighter than secondary
                        this.style.borderColor = '#0600c2'; // accent color from realtimecolors.com
                        this.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.3)';
                        this.style.transform = 'translateY(-1px)';
                    });

                    button.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = '#020024'; // secondary color from realtimecolors.com
                        this.style.borderColor = '#8a88ad'; // primary color from realtimecolors.com
                        this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
                        this.style.transform = 'translateY(0)';
                    });
                } else if (button.classList.contains('btn-outline-primary')) {
                    // Outline primary button in dark mode
                    button.style.backgroundColor = 'transparent';
                    button.style.borderColor = '#8a88ad'; // primary color from realtimecolors.com
                    button.style.color = '#8a88ad'; // primary color from realtimecolors.com

                    // Add hover effect
                    button.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = '#8a88ad'; // primary color from realtimecolors.com
                        this.style.color = '#eae9fc'; // text color from realtimecolors.com
                        this.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.3)';
                        this.style.transform = 'translateY(-1px)';
                    });

                    button.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = 'transparent';
                        this.style.color = '#8a88ad'; // primary color from realtimecolors.com
                        this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
                        this.style.transform = 'translateY(0)';
                    });
                }
            } else {
                // Light mode button styling
                if (button.classList.contains('btn-primary') || (!button.classList.contains('btn-secondary') &&
                    !button.classList.contains('btn-success') && !button.classList.contains('btn-danger') &&
                    !button.classList.contains('btn-warning') && !button.classList.contains('btn-info') &&
                    !button.classList.contains('btn-light') && !button.classList.contains('btn-dark') &&
                    !button.classList.contains('btn-outline-primary'))) {
                    // Primary button (default) in light mode with exact colors from image
                    button.style.backgroundColor = '#3531d8'; // primary color from image
                    button.style.borderColor = '#3531d8'; // primary color from image
                    button.style.color = '#FFFFFF'; // White text
                    button.style.boxShadow = '0 2px 5px rgba(53, 49, 216, 0.3)'; // primary with opacity
                    button.style.borderRadius = '4px';
                    button.style.fontWeight = '500';
                    button.style.fontFamily = "'Noto Sans Modi', sans-serif";

                    // Add hover effect
                    button.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = '#443dff'; // accent color from image
                        this.style.borderColor = '#443dff'; // accent color from image
                        this.style.boxShadow = '0 3px 8px rgba(68, 61, 255, 0.4)'; // accent with opacity
                        this.style.transform = 'translateY(-1px)';
                        this.style.transition = 'all 0.2s ease';
                    });

                    button.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = '#3531d8'; // Back to primary color from image
                        this.style.borderColor = '#3531d8'; // primary color from image
                        this.style.boxShadow = '0 2px 5px rgba(53, 49, 216, 0.3)'; // primary with opacity
                        this.style.transform = 'translateY(0)';
                        this.style.transition = 'all 0.2s ease';
                    });
                } else if (button.classList.contains('btn-secondary')) {
                    // Secondary button in light mode with exact colors from image
                    button.style.backgroundColor = '#dddbff'; // secondary color from image
                    button.style.borderColor = '#dddbff'; // secondary color from image
                    button.style.color = '#040316'; // text color from image
                    button.style.boxShadow = '0 2px 5px rgba(221, 219, 255, 0.5)'; // secondary with opacity
                    button.style.borderRadius = '4px';
                    button.style.fontWeight = '500';
                    button.style.fontFamily = "'Noto Sans Modi', sans-serif";

                    // Add hover effect
                    button.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = '#cecbff'; // slightly darker secondary
                        this.style.borderColor = '#cecbff';
                        this.style.boxShadow = '0 3px 8px rgba(206, 203, 255, 0.6)';
                        this.style.transform = 'translateY(-1px)';
                        this.style.transition = 'all 0.2s ease';
                    });

                    button.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = '#dddbff'; // Back to secondary color from image
                        this.style.borderColor = '#dddbff'; // secondary color from image
                        this.style.boxShadow = '0 2px 5px rgba(221, 219, 255, 0.5)'; // secondary with opacity
                        this.style.transform = 'translateY(0)';
                        this.style.transition = 'all 0.2s ease';
                    });
                } else if (button.classList.contains('btn-outline-primary')) {
                    // Outline primary button in light mode with exact colors from image
                    button.style.backgroundColor = 'transparent';
                    button.style.borderColor = '#3531d8'; // primary color from image
                    button.style.color = '#3531d8'; // primary color from image
                    button.style.borderWidth = '1px';
                    button.style.borderRadius = '4px';
                    button.style.fontWeight = '500';
                    button.style.fontFamily = "'Noto Sans Modi', sans-serif";

                    // Add hover effect
                    button.addEventListener('mouseenter', function() {
                        this.style.backgroundColor = '#3531d8'; // primary color from image
                        this.style.color = '#FFFFFF';
                        this.style.boxShadow = '0 3px 8px rgba(53, 49, 216, 0.4)'; // primary with opacity
                        this.style.transform = 'translateY(-1px)';
                        this.style.transition = 'all 0.2s ease';
                    });

                    button.addEventListener('mouseleave', function() {
                        this.style.backgroundColor = 'transparent';
                        this.style.color = '#3531d8'; // primary color from image
                        this.style.boxShadow = 'none';
                        this.style.transform = 'translateY(0)';
                        this.style.transition = 'all 0.2s ease';
                    });
                }
            }

            // Handle size variations
            if (button.classList.contains('btn-sm')) {
                button.style.padding = '0.25rem 0.75rem';
                button.style.fontSize = '0.875rem';
            } else if (button.classList.contains('btn-lg')) {
                button.style.padding = '0.75rem 1.5rem';
                button.style.fontSize = '1.1rem';
            }
        });

        // Fix button containers for proper layout
        const buttonContainers = section.querySelectorAll('.button-container, .action-buttons, .button-row');
        buttonContainers.forEach(container => {
            // Apply flex layout
            container.style.display = 'flex';
            container.style.flexWrap = 'wrap';
            container.style.gap = '0.75rem';
            container.style.margin = '1.5rem 0';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'flex-start';
            container.style.width = '100%';
            container.style.position = 'relative';
            container.style.padding = '0';
            container.style.clear = 'both';

            // Ensure container doesn't interfere with other elements
            container.style.zIndex = '1';
            container.style.isolation = 'isolate';

            // Remove any conflicting styles
            container.style.float = 'none';
            container.style.overflow = 'visible';
        });

        // Fix button groups for proper layout
        const buttonGroups = section.querySelectorAll('.btn-group');
        buttonGroups.forEach(group => {
            // Apply flex layout
            group.style.display = 'inline-flex';
            group.style.position = 'relative';
            group.style.verticalAlign = 'middle';
            group.style.margin = '0.5rem 1rem 0.5rem 0';
            group.style.borderRadius = '4px';
            group.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
            group.style.zIndex = '1';
            group.style.isolation = 'isolate';

            // Remove any conflicting styles
            group.style.float = 'none';
            group.style.overflow = 'visible';

            // Fix buttons within groups
            const groupButtons = group.querySelectorAll('.btn');
            groupButtons.forEach((button, index) => {
                // Override default margin for buttons in groups
                button.style.margin = '0';
                button.style.position = 'relative';
                button.style.flex = '0 1 auto';
                button.style.borderRadius = '0';
                button.style.boxShadow = 'none';
                button.style.minWidth = 'auto';
                button.style.zIndex = '2';

                // Handle border radius for first and last buttons
                if (index === 0) {
                    // First button
                    button.style.borderTopLeftRadius = '4px';
                    button.style.borderBottomLeftRadius = '4px';
                } else if (index === groupButtons.length - 1) {
                    // Last button
                    button.style.borderTopRightRadius = '4px';
                    button.style.borderBottomRightRadius = '4px';
                    button.style.marginLeft = '-1px';
                } else {
                    // Middle buttons
                    button.style.borderRadius = '0';
                    button.style.marginLeft = '-1px';
                }

                // Add hover effect to bring button to front
                button.addEventListener('mouseenter', function() {
                    this.style.zIndex = '3';
                });

                button.addEventListener('mouseleave', function() {
                    this.style.zIndex = '2';
                });
            });
        });

        // Fix button toolbars for proper layout
        const buttonToolbars = section.querySelectorAll('.btn-toolbar');
        buttonToolbars.forEach(toolbar => {
            // Apply flex layout
            toolbar.style.display = 'flex';
            toolbar.style.flexWrap = 'wrap';
            toolbar.style.justifyContent = 'flex-start';
            toolbar.style.alignItems = 'center';
            toolbar.style.gap = '0.75rem';
            toolbar.style.margin = '1.5rem 0';
            toolbar.style.width = '100%';
            toolbar.style.position = 'relative';
            toolbar.style.padding = '0';
            toolbar.style.clear = 'both';

            // Ensure toolbar doesn't interfere with other elements
            toolbar.style.zIndex = '1';
            toolbar.style.isolation = 'isolate';

            // Remove any conflicting styles
            toolbar.style.float = 'none';
            toolbar.style.overflow = 'visible';

            // Fix button groups within toolbars
            const toolbarGroups = toolbar.querySelectorAll('.btn-group');
            toolbarGroups.forEach(group => {
                group.style.margin = '0.25rem';
                group.style.flex = '0 0 auto';
            });

            // Fix individual buttons within toolbars
            const toolbarButtons = toolbar.querySelectorAll(':scope > .btn');
            toolbarButtons.forEach(button => {
                button.style.margin = '0.25rem';
                button.style.flex = '0 0 auto';
            });
        });

        // Fix inline code with balanced colors
        const inlineCodes = section.querySelectorAll('code:not([class*="language-"])');
        inlineCodes.forEach(code => {
            code.style.backgroundColor = '#F5F5F5'; // Light gray background
            code.style.color = '#D84315'; // Balanced dark orange - not too bright
            code.style.padding = '0.2rem 0.4rem';
            code.style.borderRadius = '4px';
            code.style.fontFamily = "'Fira Code', Consolas, Monaco, 'Andale Mono', monospace";
            code.style.fontSize = '0.9em';
            code.style.textShadow = 'none';
            code.style.border = '1px solid rgba(0, 0, 0, 0.05)';
        });

        // Fix blockquotes with balanced colors
        const blockquotes = section.querySelectorAll('blockquote');
        blockquotes.forEach(blockquote => {
            blockquote.style.backgroundColor = '#FFF8E1'; // Soft light orange background
            blockquote.style.borderLeft = '4px solid #FF9800'; // Balanced orange - not too bright
            blockquote.style.padding = '1.2rem 1.5rem';
            blockquote.style.margin = '1.5rem 0';
            blockquote.style.borderRadius = '0 6px 6px 0';
            blockquote.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';

            const blockquoteParagraphs = blockquote.querySelectorAll('p');
            blockquoteParagraphs.forEach((p, index) => {
                p.style.color = '#333333'; // Dark gray but not pure black
                p.style.fontStyle = 'italic';
                p.style.marginBottom = index === blockquoteParagraphs.length - 1 ? '0' : '0.5rem';
                p.style.textShadow = 'none';
                p.style.lineHeight = '1.6';
            });
        });

        // Fix tables with balanced colors
        const tables = section.querySelectorAll('table');
        tables.forEach(table => {
            table.style.borderCollapse = 'collapse';
            table.style.width = '100%';
            table.style.margin = '1.5rem 0';
            table.style.border = '1px solid #E9ECEF';
            table.style.borderRadius = '6px';
            table.style.overflow = 'hidden';
            table.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';

            const tableHeaders = table.querySelectorAll('th');
            tableHeaders.forEach(th => {
                th.style.backgroundColor = '#E67E22'; // Balanced orange - not too bright
                th.style.color = '#FFFFFF'; // White text
                th.style.fontWeight = '600';
                th.style.padding = '0.75rem 1rem';
                th.style.textAlign = 'left';
                th.style.textShadow = 'none';
                th.style.borderBottom = '2px solid #D35400'; // Darker border for definition
            });

            const tableRows = table.querySelectorAll('tr');
            tableRows.forEach((row, index) => {
                // Apply zebra striping for better readability
                const cells = row.querySelectorAll('td');
                cells.forEach(td => {
                    td.style.backgroundColor = index % 2 === 0 ? '#F8F9FA' : '#F1F3F5';
                    td.style.color = '#333333'; // Dark gray but not pure black
                    td.style.padding = '0.75rem 1rem';
                    td.style.borderTop = '1px solid #E9ECEF';
                    td.style.textShadow = 'none';
                });
            });
        });
    });

    // Fix button interactions with other elements
    fixButtonInteractions();

    // Fix "What is TensorFlow?" section specifically with enhanced visibility
    const whatIsTensorFlowHeadings = document.querySelectorAll('h2:contains("What is TensorFlow?")');
    whatIsTensorFlowHeadings.forEach(heading => {
        // Check if we're in dark mode
        const isDarkMode = !document.body.classList.contains('light-theme');

        // Apply special styling to this important heading based on theme
        if (isDarkMode) {
            heading.style.color = '#ebe9fc'; // text color
            heading.style.borderBottom = '2px solid rgba(58, 49, 216, 0.3)'; // primary with opacity

            // Add a subtle highlight effect for dark mode
            const highlight = document.createElement('div');
            highlight.style.position = 'absolute';
            highlight.style.bottom = '-2px';
            highlight.style.left = '0';
            highlight.style.width = '100px';
            highlight.style.height = '2px';
            highlight.style.background = 'linear-gradient(to right, #3a31d8, rgba(58, 49, 216, 0.1))'; // primary with gradient
            heading.appendChild(highlight);
        } else {
            heading.style.color = '#2f27ce'; // primary color - exact color from picture
            heading.style.borderBottom = '2px solid rgba(47, 39, 206, 0.3)'; // primary with opacity
            heading.style.fontSize = '2rem';
            heading.style.letterSpacing = '0.01em';

            // Add a subtle highlight effect for light mode with exact colors from picture
            const highlight = document.createElement('div');
            highlight.style.position = 'absolute';
            highlight.style.bottom = '-2px';
            highlight.style.left = '0';
            highlight.style.width = '100px';
            highlight.style.height = '2px';
            highlight.style.background = 'linear-gradient(to right, #2f27ce, rgba(47, 39, 206, 0.1))'; // primary with gradient - exact color from picture
            heading.appendChild(highlight);
        }

        // Common heading styles
        heading.style.fontWeight = '700';
        heading.style.textShadow = 'none';
        heading.style.fontSize = '2.2rem';
        heading.style.marginBottom = '1.5rem';
        heading.style.paddingBottom = '0.75rem';
        heading.style.position = 'relative';

        // Get the parent section
        let section = heading.closest('.framework-section');
        if (section) {
            // Apply special styling to this important section based on theme
            if (isDarkMode) {
                section.style.backgroundColor = '#020024'; // secondary color
                section.style.border = '1px solid #3a31d8'; // primary color
                section.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';

                // Fix all text in this section with balanced colors for dark mode
                const paragraphs = section.querySelectorAll('p');
                paragraphs.forEach(p => {
                    p.style.color = '#ebe9fc'; // text color
                    p.style.fontWeight = '400';
                    p.style.lineHeight = '1.8';
                    p.style.fontSize = '1.15rem';
                    p.style.marginBottom = '1.2rem';
                    p.style.textShadow = 'none';
                });

                // Fix list items with balanced colors for dark mode
                const listItems = section.querySelectorAll('li');
                listItems.forEach(item => {
                    item.style.color = '#ebe9fc'; // text color
                    item.style.fontWeight = '400';
                    item.style.lineHeight = '1.8';
                    item.style.fontSize = '1.15rem';
                    item.style.marginBottom = '0.75rem';
                    item.style.position = 'relative';
                    item.style.paddingLeft = '0.5rem';
                    item.style.textShadow = 'none';
                });
            } else {
                section.style.backgroundColor = '#FFFFFF'; // White background for better contrast with #F3F3F6
                section.style.border = '1px solid #dddbff'; // secondary color
                section.style.boxShadow = '0 8px 20px rgba(47, 39, 206, 0.08)'; // Enhanced shadow for depth
                section.style.borderRadius = '10px'; // Slightly larger radius for a more modern look

                // Fix all text in this section with balanced colors for light mode
                const paragraphs = section.querySelectorAll('p');
                paragraphs.forEach(p => {
                    p.style.color = '#040316'; // text color - exact color from picture
                    p.style.fontWeight = '400';
                    p.style.lineHeight = '1.8';
                    p.style.fontSize = '1.15rem';
                    p.style.marginBottom = '1.2rem';
                    p.style.textShadow = 'none';
                    p.style.letterSpacing = '0.01em';
                });

                // Fix list items with balanced colors for light mode
                const listItems = section.querySelectorAll('li');
                listItems.forEach(item => {
                    item.style.color = '#040316'; // text color - exact color from picture
                    item.style.fontWeight = '400';
                    item.style.lineHeight = '1.8';
                    item.style.fontSize = '1.15rem';
                    item.style.marginBottom = '0.75rem';
                    item.style.position = 'relative';
                    item.style.paddingLeft = '0.5rem';
                    item.style.textShadow = 'none';
                    item.style.letterSpacing = '0.01em';
                });
            }

            // Common section styles
            section.style.borderRadius = '8px';
            section.style.padding = '2.5rem';
            section.style.margin = '2.5rem 0';

            // Fix list items with balanced colors and custom bullets
            const lists = section.querySelectorAll('ul, ol');
            lists.forEach(list => {
                list.style.paddingLeft = '1.5rem';
                list.style.marginBottom = '1.5rem';
                list.style.marginTop = '1rem';
            });
        }
    });
}

/**
 * Fix button interactions with other elements
 */
function fixButtonInteractions() {
    // Check if we're in dark mode
    const isDarkMode = !document.body.classList.contains('light-theme');

    // Find all buttons in TensorFlow sections
    const buttons = document.querySelectorAll('.framework-section.tensorflow-section .btn');

    // Ensure buttons don't interfere with other interactive elements
    buttons.forEach(button => {
        // Create button containers for isolated stacking context if needed
        if (!button.parentElement.classList.contains('btn-group') &&
            !button.parentElement.classList.contains('btn-toolbar') &&
            !button.parentElement.classList.contains('button-container') &&
            !button.parentElement.classList.contains('action-buttons') &&
            !button.parentElement.classList.contains('button-row') &&
            !button.parentElement.classList.contains('btn-container')) {

            // Check if button is directly in the section
            const isDirectChild = button.parentElement.classList.contains('framework-section') ||
                                 button.parentElement.classList.contains('tensorflow-section');

            if (isDirectChild) {
                // Create a container for the button
                const container = document.createElement('div');
                container.className = 'btn-container';
                container.style.display = 'inline-block';
                container.style.margin = '0';
                container.style.padding = '0';
                container.style.isolation = 'isolate';
                container.style.position = 'relative';
                container.style.zIndex = '1';

                // Apply theme-specific styles
                if (isDarkMode) {
                    container.style.backgroundColor = 'transparent';
                    container.style.boxShadow = 'none';
                }

                // Replace button with container containing button
                button.parentNode.insertBefore(container, button);
                container.appendChild(button);
            }
        }

        // Fix spacing around buttons
        const prevSibling = button.previousElementSibling;
        const nextSibling = button.nextElementSibling;

        if (prevSibling && (
            prevSibling.tagName === 'H2' ||
            prevSibling.tagName === 'H3' ||
            prevSibling.tagName === 'P' ||
            prevSibling.tagName === 'UL' ||
            prevSibling.tagName === 'OL' ||
            prevSibling.tagName === 'TABLE' ||
            prevSibling.tagName === 'BLOCKQUOTE' ||
            prevSibling.classList.contains('code-block')
        )) {
            button.style.marginTop = '1.5rem';
        }

        if (nextSibling && (
            nextSibling.tagName === 'H2' ||
            nextSibling.tagName === 'H3' ||
            nextSibling.tagName === 'P' ||
            nextSibling.tagName === 'UL' ||
            nextSibling.tagName === 'OL' ||
            nextSibling.tagName === 'TABLE' ||
            nextSibling.tagName === 'BLOCKQUOTE' ||
            nextSibling.classList.contains('code-block')
        )) {
            nextSibling.style.marginTop = '1.5rem';
        }
    });
}

/**
 * Observe DOM changes to fix dynamically added TensorFlow content
 */
function observeTensorFlowContentChanges() {
    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes contain TensorFlow sections
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node itself is a TensorFlow section
                        if (node.classList && (node.classList.contains('tensorflow-section') || node.classList.contains('framework-section'))) {
                            fixTensorFlowTextVisibility();
                        }

                        // Check if the node contains any TensorFlow sections
                        const tensorflowSections = node.querySelectorAll('.framework-section.tensorflow-section');
                        if (tensorflowSections.length > 0) {
                            fixTensorFlowTextVisibility();
                            fixButtonInteractions(); // Also fix button interactions
                        }

                        // Check if the node contains "What is TensorFlow?" heading
                        const whatIsTensorFlowHeadings = node.querySelectorAll('h2:contains("What is TensorFlow?")');
                        if (whatIsTensorFlowHeadings.length > 0) {
                            fixTensorFlowTextVisibility();
                            fixButtonInteractions(); // Also fix button interactions
                        }

                        // Check if the node contains buttons
                        const buttons = node.querySelectorAll('.btn');
                        if (buttons.length > 0) {
                            fixButtonInteractions(); // Fix button interactions
                        }
                    }
                });
            }
        });
    });

    // Start observing the document body for DOM changes
    observer.observe(document.body, { childList: true, subtree: true });
}
