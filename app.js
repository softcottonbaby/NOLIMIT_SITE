// Wait for everything to load (fonts, images)
window.addEventListener('load', () => {
    initLoader();
});

function initLoader() {
    const textElement = document.getElementById('typewriter-text');
    const progressBar = document.querySelector('.progress-bar');
    const statusText = document.querySelector('.loading-status');
    
    const textToType = "LOADING NOLIMIT...";
    
    // Timeline for the loader
    const loaderTl = gsap.timeline();

    // 1. Animate Progress Bar (0.4s for 2x speed)
    loaderTl.to(progressBar, {
        width: "100%",
        duration: 0.4, 
        ease: "power2.inOut"
    });

    // 2. Typewriter Effect
    let charIndex = 0;
    loaderTl.to({}, {
        duration: 0.2, 
        repeat: textToType.length - 1,
        onRepeat: () => {
            charIndex++;
            textElement.textContent = textToType.substring(0, charIndex);
        },
        ease: "linear" 
    }, "<"); // Start at same time as progress bar

    // 3. Status update
    loaderTl.to(statusText, {
        text: "ACCESS GRANTED",
        duration: 0.1,
        color: "#00f3ff"
    });

    // 4. Exit Loader and Enter Site
    loaderTl.to("#loader-overlay", {
        opacity: 0,
        y: -50, 
        duration: 0.4,
        ease: "power2.inOut",
        delay: 0.1, 
        onComplete: () => {
            document.querySelector('#loader-overlay').style.display = 'none';
            document.body.classList.remove('loading-state'); // Enable scrolling
        }
    });

    // 5. Trigger Homepage Animations
    loaderTl.add(() => {
        initSiteAnimations();
    }, "-=0.2"); 
}

function initSiteAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Initial Set
    gsap.set("#main-nav", { y: -100, opacity: 0 });

    // Hero Text Reveal
    gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        skewY: 5
    });

    gsap.from(".hero-subtitle, .hero-desc", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        delay: 0.3,
        ease: "power3.out"
    });

    // Nav Slide Down
    gsap.to("#main-nav", {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
    });

    // Project Cards Stagger
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1, 
            ease: "power2.out"
        });
    });

    // Skill Bars Animation
    gsap.utils.toArray('.skill-bar .fill').forEach((bar) => {
        gsap.fromTo(bar, 
            { scaleX: 0 },
            {
                scaleX: 1,
                duration: 1.5,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: bar,
                    start: "top 90%"
                }
            }
        );
    });
}