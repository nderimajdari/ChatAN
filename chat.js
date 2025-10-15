// chat.js - Frontend with "displayTypingAnimation" and responses.js integration

document.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox");
  const textInput = document.getElementById("textInput");
  const sendButton = document.getElementById("sendButton");

  // initial message
  const firstMessage = "Hello, I'm chatbot AN! How can I help you today?";
  document.getElementById("botStarterMessage").textContent = firstMessage;

  // scroll to bottom
  const scrollToBottom = () => (chatbox.scrollTop = chatbox.scrollHeight);

  const appendUserMessage = (text) => {
    const div = document.createElement("div");
    div.className = "userText";
    div.innerHTML = `<span>${text}</span>`;
    chatbox.appendChild(div);
    scrollToBottom();
  };

  const appendBotMessage = (text) => {
    const div = document.createElement("div");
    div.className = "botText";
    const span = document.createElement("span");
    div.appendChild(span);
    chatbox.appendChild(div);
    displayTypingAnimation(span, text);
  };

  // Typing animation with human-like effect + small "mistakes/backspace"
  function displayTypingAnimation(element, fullText) {
    let i = 0;
    let text = "";
    const mistakeChance = 0.08; // 8% chance of a typo
    const speed = 35 + Math.random() * 30;

    function typeChar() {
      if (i < fullText.length) {
        if (Math.random() < mistakeChance && /[a-z]/i.test(fullText[i])) {
          const wrongChar = String.fromCharCode(
            fullText.charCodeAt(i) + (Math.random() > 0.5 ? 1 : -1)
          );
          text += wrongChar;
          element.textContent = text;
          setTimeout(() => {
            text = text.slice(0, -1); // backspace
            element.textContent = text;
            setTimeout(() => {
              text += fullText[i];
              element.textContent = text;
              i++;
              setTimeout(typeChar, speed);
            }, 120 + Math.random() * 120);
          }, 100 + Math.random() * 100);
        } else {
          text += fullText[i];
          element.textContent = text;
          i++;
          setTimeout(typeChar, speed);
        }
      }
    }
    typeChar();
    scrollToBottom();
  }

  // Process input message
  function sendMessage() {
    const text = textInput.value.trim();
    if (!text) return;
    appendUserMessage(text);
    textInput.value = "";
    processMessage(text);
  }

  function processMessage(userText) {
    let botResponse = "Më vjen keq, nuk e kuptova.";
    try {
      botResponse = getBotResponse(userText); // nga responses.js
    } catch (e) {
      console.error("Gabim nga responses.js:", e);
    }
    // Shto pak vonesë për realizëm
    setTimeout(() => appendBotMessage(botResponse), 700 + Math.random() * 600);
  }

  sendButton.addEventListener("click", sendMessage);
  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
