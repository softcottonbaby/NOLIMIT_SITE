document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.getElementById('nolimit-text');
    const cursorElement = document.getElementById('cursor');
    const navElement = document.getElementById('main-nav');
    const contentElement = document.getElementById('portfolio-content');
    const fullText = textElement.getAttribute('data-glitch'); 
    
    // Set up the main GSAP timeline
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // --- Initial Setup and Text Splitting ---
    
    // Manually split the text into spans for letter-by-letter control
    textElement.textContent = '';
    const chars = [];
    for (let i = 0; i < fullText.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.textContent = fullText[i];
        charSpan.style.display = 'inline-block';
        charSpan.style.opacity = 0; // Start completely invisible
        textElement.appendChild(charSpan);
        chars.push(charSpan);
    }
    
    // Get the final width of the text container for cursor destination
    // Wait for the next tick to ensure the DOM has rendered the spans correctly
    setTimeout(() => {
        // Calculate dimensions after the text is split into spans
        const finalTextWidth = textElement.offsetWidth;
        const textStartPos = textElement.getBoundingClientRect().left;
        
        // Start the main animation sequence
        startIntroSequence(finalTextWidth, textStartPos);
    }, 50); // Small delay to ensure accurate measurement


    // --- Utility Function: Glitch Reveal ---
    function glitchInChar(char) {
        gsap.fromTo(char, 
            { opacity: 0, scale: 0.8 }, 
            { 
                opacity: 1, 
                scale: 1,
                duration: 0.1,
                repeat: 3, 
                yoyo: true, 
                ease: "steps(1)",
                x: () => gsap.utils.random(-3, 3), 
                y: () => gsap.utils.random(-3, 3),
                onComplete: () => {
                    gsap.to(char, { x: 0, y: 0, duration: 0.2, ease: "power2.out" });
                }
            }
        );
    }

    // --- The Animation Timeline ---
    function startIntroSequence(finalTextWidth, textStartPos) {
        
        // 0. Initial State setup
        gsap.set(cursorElement, { autoAlpha: 0 }); 
        gsap.set(textElement, { opacity: 1, x: 0 }); 

        // 1. Initial Glitch Burst (The general blue effect when page loads)
        tl.to(textElement.querySelectorAll('::before, ::after'), { opacity: 1, duration: 0.1 }, 0);
        
        // Flicker the entire text for a short time
        tl.to(textElement, {
            duration: 0.8,
            x: () => gsap.utils.random(-10, 10),
            y: () => gsap.utils.random(-10, 10),
            filter: `hue-rotate(${gsap.utils.random(-25, 25)}deg)`,
            ease: "steps(1)",
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                gsap.set(textElement, { x: 0, y: 0, filter: 'hue-rotate(0deg)' });
            }
        }, 0); 
        
        // Settle the text and prepare for the cursor animation
        tl.to(textElement.querySelectorAll('::before, ::after'), { opacity: 0, duration: 0.3 }, 0.9);
        
        // 2. Cursor (Pipeline) Entry
        tl.fromTo(cursorElement, 
            { autoAlpha: 0, x: textStartPos - 50 }, // Start off-screen slightly to the left
            { autoAlpha: 1, x: textStartPos, duration: 0.5, ease: "power2.out" }, 1.2); 

        // 3. Cursor Writes and Reveals Text (The Core Effect)
        const writeDuration = 1.5; 
        
        // Animate the cursor moving from the start position to the end of the text
        tl.to(cursorElement, { 
            x: textStartPos + finalTextWidth, 
            duration: writeDuration, 
            ease: "none" 
        }, 1.7); 

        // Stagger the letter reveals, timed perfectly with the cursor movement
        chars.forEach((char, index) => {
            const charRevealTime = 1.7 + (index / chars.length) * writeDuration;
            tl.call(glitchInChar, [char], charRevealTime);
        });

        // 4. Final Text Settle and Blinking Cursor
        tl.to(cursorElement, { 
            animation: 'blink-anim 0.4s infinite alternate',
            duration: 0 
        }, 1.7 + writeDuration); 


        // 5. Cleanup and Content Reveal (The Transition to the Main Site)
        const transitionTime = 1.7 + writeDuration + 1; // 1 second after cursor starts blinking

        // Animate the hero section moving up and shrinking
        tl.to(".hero-container", {
            duration: 1.0,
            scale: 0.8,
            y: -200, // Move up slightly
            autoAlpha: 0, // Fade out
            ease: "power2.in",
            onStart: () => {
                // Remove the initial centering and enable scrolling
                document.body.classList.add('content-active'); 
                contentElement.classList.remove('hidden'); // Show the hidden content container
            }
        }, transitionTime); 

        // Animate the navigation bar sliding down
        tl.to(navElement, {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "power2.out"
        }, transitionTime + 0.3); // Start nav slide slightly later

        // Final cleanup of the intro elements
        tl.set(cursorElement, { display: 'none' }, transitionTime);
        tl.set(".hero-container", { display: 'none' }, transitionTime + 1.0);
    }
});