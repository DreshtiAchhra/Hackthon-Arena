async function sendMessage() {
    const userMessage = document.getElementById("user-input").value;
    const chatBox = document.getElementById("chat-box");

    chatBox.innerHTML += `<p><b>You:</b> ${userMessage}</p>`;

    try {
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        chatBox.innerHTML += `<p><b>MindHeaven:</b> ${data.reply}</p>`;
    } catch (error) {
        chatBox.innerHTML += `<p><b>MindHeaven:</b> Sorry, I am having trouble responding right now.</p>`;
        console.error(error);
    }

    document.getElementById("user-input").value = "";
}
function toggleChat() {
    const chatWindow = document.getElementById("chatWindow");
    if (chatWindow.style.display === "none" || chatWindow.style.display === "") {
      chatWindow.style.display = "flex";
    } else {
      chatWindow.style.display = "none";
    }
  }
