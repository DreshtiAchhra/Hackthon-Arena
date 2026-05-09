document.addEventListener("DOMContentLoaded", () => {
    // Inject the widget HTML
    const widgetHTML = `
        <div id="emp-chat-widget-container">
            <div id="emp-chat-window">
                <div id="emp-chat-header">
                    <span>Empathetic AI</span>
                    <button id="emp-close-btn">&times;</button>
                </div>
                <div id="emp-chat-body">
                    <div class="emp-message bot">Hello! I'm here to listen and support you. How are you feeling today?</div>
                </div>
                <div id="emp-typing-indicator">AI is typing...</div>
                <div id="emp-chat-input-container">
                    <input type="text" id="emp-chat-input" placeholder="Type a message..." />
                    <button id="emp-send-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>
            <div id="emp-chat-button">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    const chatButton = document.getElementById('emp-chat-button');
    const chatWindow = document.getElementById('emp-chat-window');
    const closeBtn = document.getElementById('emp-close-btn');
    const sendBtn = document.getElementById('emp-send-btn');
    const chatInput = document.getElementById('emp-chat-input');
    const chatBody = document.getElementById('emp-chat-body');
    const typingIndicator = document.getElementById('emp-typing-indicator');

    // Use shared session ID
    const sessionId = window.empSessionId || ('session_' + Math.random().toString(36).substring(2, 10));
    window.empSessionId = sessionId;

    chatButton.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message to UI
        addMessage(text, 'user');
        chatInput.value = '';
        
        typingIndicator.style.display = 'block';
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, session_id: sessionId })
            });

            if (!response.ok) {
                throw new Error('API error');
            }

            const data = await response.json();
            
            // Add bot message to UI with extra metadata
            addBotMessageWithMetrics(data);

        } catch (error) {
            console.error('Chat error:', error);
            addMessage("Sorry, I'm having trouble connecting to the server.", 'bot');
        } finally {
            typingIndicator.style.display = 'none';
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `emp-message ${sender}`;
        msgDiv.textContent = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addBotMessageWithMetrics(data) {
        const msgContainer = document.createElement('div');
        msgContainer.style.display = 'flex';
        msgContainer.style.flexDirection = 'column';
        msgContainer.style.alignSelf = 'flex-start';
        msgContainer.style.maxWidth = '80%';

        const msgDiv = document.createElement('div');
        msgDiv.className = 'emp-message bot';
        msgDiv.style.maxWidth = '100%';
        msgDiv.textContent = data.ai_response;
        msgContainer.appendChild(msgDiv);

        // Add metrics
        const metricsDiv = document.createElement('div');
        metricsDiv.className = 'emp-metrics';
        metricsDiv.textContent = `Emotion: ${data.emotion} | Stress: ${data.stress_score}/10`;
        msgContainer.appendChild(metricsDiv);

        if (data.intervention_needed) {
            const interventionDiv = document.createElement('div');
            interventionDiv.className = 'emp-intervention';
            interventionDiv.textContent = '⚠️ Intervention Flagged: Please seek professional help if you are in distress.';
            msgContainer.appendChild(interventionDiv);
        }

        if (data.recommended_resource) {
            const resourceDiv = document.createElement('a');
            resourceDiv.href = data.recommended_resource;
            resourceDiv.style.cssText = "display:inline-block; margin-top:8px; padding:8px 12px; background:linear-gradient(135deg, #00C6FF, #007BFF); color:white; text-decoration:none; border-radius:12px; font-size:12px; font-weight:bold; text-align:center;";
            resourceDiv.innerHTML = "🔗 View Suggested Resource ➔";
            msgContainer.appendChild(resourceDiv);
        }

        chatBody.appendChild(msgContainer);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});
