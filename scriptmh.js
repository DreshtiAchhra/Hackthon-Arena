// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animated counter for hero stats
// function animateCounter(element, target, duration = 2000) {
//     let start = 0;
//     const increment = target / (duration / 16);
    
//     function updateCounter() {
//         start += increment;
//         if (start < target) {
//             element.textContent = Math.floor(start).toLocaleString();
//             requestAnimationFrame(updateCounter);
//         } else {
//             element.textContent = target.toLocaleString();
//         }
//     }
    
//     updateCounter();
// }

// Intersection Observer for counter animation
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                // animateCounter(counter, target);
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe hero stats section
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    observer.observe(heroStats);
}

// Chatbot functionality
let chatbotOpen = false;

function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    const fab = document.querySelector('.chatbot-fab');
    
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        chatbot.classList.add('active');
        fab.style.display = 'none';
    } else {
        chatbot.classList.remove('active');
        fab.style.display = 'flex';
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatMessages');
    const message = input.value.trim();
    
    if (message) {
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.innerHTML = `<p>${message}</p>`;
        messagesContainer.appendChild(userMessage);
        
        // Clear input
        input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            const botMessage = document.createElement('div');
            botMessage.className = 'message bot-message';
            
            // Simple response logic
            let response = getBotResponse(message.toLowerCase());
            botMessage.innerHTML = `<p>${response}</p>`;
            messagesContainer.appendChild(botMessage);
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function getBotResponse(message) {
    const responses = {
        'hello': 'Hello! I\'m here to help with your mental health questions. How are you feeling today?',
        'help': 'I can provide information about our services, crisis support, or general mental health resources. What would you like to know?',
        'crisis': 'If you\'re in crisis, please call our 24/7 crisis line at 1-800-MIND-HELP or contact emergency services at 911.',
        'appointment': 'You can book an appointment with our licensed counselors through the "Book Appointment" section. Would you like me to guide you there?',
        'resources': 'Our Resource Hub contains articles, self-help guides, and educational materials. You can access it from the main menu.',
        'chat': 'Our peer-to-peer chat connects you with other students in moderated support groups. It\'s a safe space to share and connect.',
        'activities': 'We offer mindfulness games, meditation exercises, and stress-relief activities in our Refreshing Activities section.',
        'default': 'I understand you\'re reaching out for support. Can you tell me more about what you\'re looking for? I can help with information about our services, resources, or direct you to immediate help if needed.'
    };
    
    for (let key in responses) {
        if (message.includes(key)) {
            return responses[key];
        }
    }
    
    return responses['default'];
}

// Allow Enter key to send messages
const chatInputEl = document.getElementById('chatInput');
if (chatInputEl) {
    chatInputEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Contact form submission
document.querySelector('.contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const message = this.querySelector('textarea').value;
    
    // Simulate form submission
    alert(`Thank you, ${name}! Your message has been sent. We'll get back to you at ${email} within 24 hours.`);
    
    // Reset form
    this.reset();
});

// Feature card click handlers
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', function() {
        const title = this.querySelector('h3').textContent;
        
        // Simulate navigation to feature pages
        switch(title) {
            case 'Resource Hub':
                alert('Redirecting to Resource Hub - Access curated mental health resources and guides.');
                break;
            case 'Book Appointment':
                alert('Redirecting to Appointment Booking - Schedule a session with our licensed counselors.');
                break;
            case 'Peer to Peer Chat':
                alert('Redirecting to Peer Chat - Join our supportive student community.');
                break;
            case 'Refreshing Activities':
                alert('Redirecting to Activities - Explore mindfulness games and wellness exercises.');
                break;
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#ffffff';
        navbar.style.backdropFilter = 'none';
    }
});

// Add loading animation for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    
    // Set initial opacity for smooth loading
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Add entrance animations
    const elements = document.querySelectorAll('.hero-content, .feature-card, .about-content');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
});