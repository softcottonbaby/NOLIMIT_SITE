
const SUPABASE_URL = 'https://kjhcsvciwneqccqrejqr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RXAwpWWYdAePzggVecWmvg_2kSgv8gB';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function startStatsAnimation() {
    const statsSection = document.querySelector('.stats-row');
    const statNumbers = document.querySelectorAll('.counter');
    let hasAnimatedStats = false; 

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const suffix = element.getAttribute('data-suffix') || '';
        const duration = 2000; 
        const stepTime = 20; 
        const steps = duration / stepTime;
        const increment = target / steps;
        
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(current) + suffix;
        }, stepTime);
    }

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimatedStats) {
                statNumbers.forEach((number) => animateCounter(number));
                hasAnimatedStats = true;
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) statsObserver.observe(statsSection);
}


window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');
    
  
    setTimeout(() => {
        loader.classList.add('fade-out');
       
        startStatsAnimation();
    }, 2500);

    loader.addEventListener('transitionend', () => {
        loader.remove();
    });
    
 
    loadVouchesToMarquee();
});

async function loadVouchesToMarquee() {
    const track = document.getElementById('marquee-track');
    
    const { data, error } = await supabase
        .from('vouches')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
        track.innerHTML = '<p style="color:white; padding: 20px;">No vouches yet.</p>';
        return;
    }

    const generateCard = (vouch) => {
     
        let avatarHTML = `<i class="fas fa-user"></i>`;
        if (vouch.avatar_url) {
            avatarHTML = `<img src="${vouch.avatar_url}" alt="${vouch.name}">`;
        }

        return `
        <div class="vouch-card">
            <div class="vouch-header">
                <div class="vouch-avatar">${avatarHTML}</div>
                <div>
                    <h4>${vouch.name}</h4>
                    <span class="vouch-role">${vouch.role || 'Client'}</span>
                </div>
            </div>
            <div class="stars">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
            </div>
            <p>"${vouch.message}"</p>
        </div>`;
    };

   
    const cardsHTML = data.map(v => generateCard(v)).join('');
    const multiplier = data.length < 5 ? 6 : 4;
    track.innerHTML = new Array(multiplier).fill(cardsHTML).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    
   
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            navLinks.classList.contains('active') ? 
                (icon.classList.remove('fa-bars'), icon.classList.add('fa-times')) : 
                (icon.classList.remove('fa-times'), icon.classList.add('fa-bars'));
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');
            });
        });
    }

  
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('show');
            else entry.target.classList.remove('show');
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));

  
    const addModal = document.getElementById('add-modal');
    const viewModal = document.getElementById('view-modal');
    const openAddBtn = document.getElementById('open-add-modal');
    const openViewBtn = document.getElementById('open-view-modal');
    const closeBtns = document.querySelectorAll('.close-modal');
    
    const addVouchForm = document.getElementById('add-vouch-form');
    const vouchesListContainer = document.getElementById('vouches-list-container');
    const modalLoader = document.getElementById('modal-loader');
    const fileInput = document.getElementById('vouch-file');
    const fileNameDisplay = document.getElementById('file-name');

    if(openAddBtn) openAddBtn.addEventListener('click', () => addModal.classList.add('active'));
    
    if(openViewBtn) openViewBtn.addEventListener('click', () => {
        viewModal.classList.add('active');
        fetchVouchesList();
    });

    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        addModal.classList.remove('active');
        viewModal.classList.remove('active');
    }));

    window.addEventListener('click', (e) => {
        if (e.target == addModal) addModal.classList.remove('active');
        if (e.target == viewModal) viewModal.classList.remove('active');
    });

    if(fileInput) {
        fileInput.addEventListener('change', () => {
            if(fileInput.files.length > 0) {
                fileNameDisplay.textContent = fileInput.files[0].name;
                fileNameDisplay.style.color = "#00b4d8";
            } else {
                fileNameDisplay.textContent = "No file chosen";
            }
        });
    }

   
    if(addVouchForm) {
        addVouchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('vouch-password').value;
            const name = document.getElementById('vouch-name').value;
            const role = document.getElementById('vouch-role').value;
            const message = document.getElementById('vouch-message').value;
            const statusMsg = document.getElementById('vouch-status');
            const file = fileInput.files[0];

            if(password !== "admin123") {
                statusMsg.textContent = "Incorrect Admin Password";
                statusMsg.className = "form-status error";
                return;
            }

            modalLoader.classList.remove('hidden');
            statusMsg.textContent = "";

            let avatarUrl = null;

            try {
               
                if (file) {
                    const fileName = `${Date.now()}-${file.name}`;
                    const { data: uploadData, error: uploadError } = await supabase
                        .storage.from('avatars').upload(fileName, file);

                    if (uploadError) throw uploadError;

                    const { data: publicData } = supabase
                        .storage.from('avatars').getPublicUrl(fileName);
                    
                    avatarUrl = publicData.publicUrl;
                }

               
                const { error: insertError } = await supabase
                    .from('vouches')
                    .insert([{ name, role, message, avatar_url: avatarUrl }]);

                if (insertError) throw insertError;

                statusMsg.textContent = "Success! Vouch Added.";
                statusMsg.className = "form-status success";
                addVouchForm.reset();
                fileNameDisplay.textContent = "No file chosen";
                
                loadVouchesToMarquee(); 
                
                setTimeout(() => {
                    modalLoader.classList.add('hidden');
                    addModal.classList.remove('active');
                    statusMsg.textContent = "";
                }, 1000);

            } catch (err) {
                console.error(err);
                modalLoader.classList.add('hidden');
                statusMsg.textContent = "Error: " + err.message;
                statusMsg.className = "form-status error";
            }
        });
    }

    async function fetchVouchesList() {
        vouchesListContainer.innerHTML = "<p class='loading-text'>Loading...</p>";
        const { data, error } = await supabase
            .from('vouches').select('*').order('created_at', { ascending: false });

        if(data && data.length > 0) {
            vouchesListContainer.innerHTML = "";
            data.forEach(vouch => {
                const card = document.createElement('div');
                card.className = "vouch-card";
                
                let avatarHTML = `<i class="fas fa-user"></i>`;
                if(vouch.avatar_url) avatarHTML = `<img src="${vouch.avatar_url}" alt="${vouch.name}">`;

                card.innerHTML = `
                    <div class="vouch-header">
                        <div class="vouch-avatar">${avatarHTML}</div>
                        <div><h4>${vouch.name}</h4><span class="vouch-role">${vouch.role}</span></div>
                    </div>
                    <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                    <p>"${vouch.message}"</p>
                `;
                vouchesListContainer.appendChild(card);
            });
        } else {
            vouchesListContainer.innerHTML = "<p class='text-center'>No vouches found.</p>";
        }
    }

   
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formStatus.textContent = "Thanks! Your message has been sent successfully.";
                    formStatus.className = "form-status success";
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        formStatus.textContent = data.errors.map(error => error.message).join(", ");
                    } else {
                        formStatus.textContent = "Oops! There was a problem submitting your form.";
                    }
                    formStatus.className = "form-status error";
                }
            } catch (error) {
                formStatus.textContent = "Oops! There was a problem submitting your form.";
                formStatus.className = "form-status error";
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                setTimeout(() => {
                    formStatus.textContent = "";
                    formStatus.className = "form-status";
                }, 5000);
            }
        });
    }
});