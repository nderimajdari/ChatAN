// chat.js - Frontend logic (integrates with existing responses.js)
/* Assumptions:
   - responses.js defines function getBotResponse(input)
   - keep responses.js unchanged
*/

document.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox");
  const textInput = document.getElementById("textInput");
  const sendButton = document.getElementById("sendButton");

  // initial greeting (kept from original)
  const firstMessage = "Hello, I'm chatbot AN! How can I help you today?";
  // replace the initial loading text
  const starter = document.getElementById("botStarterMessage");
  if (starter) starter.textContent = firstMessage;

  // helper to scroll to bottom
  function scrollToBottom() {
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // create message nodes
  function appendUserMessage(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "userText";
    const span = document.createElement("span");
    span.textContent = text;
    wrapper.appendChild(span);
    chatbox.appendChild(wrapper);
    scrollToBottom();
  }

  function appendBotMessage(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "botText";
    const span = document.createElement("span");
    span.innerHTML = text; // responses.js returns plain text (safe)
    wrapper.appendChild(span);
    chatbox.appendChild(wrapper);
    scrollToBottom();
  }

  // typing indicator
  function showTypingIndicator() {
    const wrap = document.createElement("div");
    wrap.className = "botText typing-wrapper";
    wrap.setAttribute("data-typing", "1");
    const container = document.createElement("div");
    container.className = "typing";
    const d1 = document.createElement("div"); d1.className = "dot";
    const d2 = document.createElement("div"); d2.className = "dot";
    const d3 = document.createElement("div"); d3.className = "dot";
    container.appendChild(d1); container.appendChild(d2); container.appendChild(d3);
    wrap.appendChild(container);
    chatbox.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function removeTypingIndicator(indicatorNode) {
    if (indicatorNode && indicatorNode.parentNode) {
      indicatorNode.parentNode.removeChild(indicatorNode);
    }
  }

  // process and reply (uses getBotResponse from responses.js)
  function processMessage(userText) {
    // show typing dots
    const typingNode = showTypingIndicator();

    // simulate "thinking" time: proportional to message length but bounded
    const baseDelay = 300; // ms
    const perChar = 25; // ms per char
    const delay = Math.min(2000, baseDelay + userText.length * perChar);

    setTimeout(() => {
      // get bot response from responses.js
      let botResponse = "Më vjen keq, nuk e kuptova."; // fallback
      try {
        botResponse = getBotResponse(userText);
      } catch (e) {
        console.error("Error calling getBotResponse:", e);
      }
      removeTypingIndicator(typingNode);
      appendBotMessage(botResponse);
    }, delay);
  }

  // send handler
  function sendMessage() {
    const text = textInput.value.trim();
    if (!text) return;
    appendUserMessage(text);
    textInput.value = "";
    processMessage(text);
  }

  // events
  sendButton.addEventListener("click", sendMessage);
  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // make initial scroll position appropriate
  scrollToBottom();
});
