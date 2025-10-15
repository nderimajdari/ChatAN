// chat.js - Chat AN frontend with human-like typing animation
// Uses getBotResponse() from responses.js (left unchanged)

document.addEventListener("DOMContentLoaded", () => {
  const chatbox = document.getElementById("chatbox");
  const textInput = document.getElementById("textInput");
  const sendButton = document.getElementById("sendButton");

  // Mesazhi fillestar
  const firstMessage = "Hello, I'm chatbot AN! How can I help you today?";
  const starter = document.getElementById("botStarterMessage");
  if (starter) starter.textContent = firstMessage;

  // ========== FUNKSIONE BAZË ==========

  function scrollToBottom() {
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  function appendUserMessage(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "userText";
    const span = document.createElement("span");
    span.textContent = text;
    wrapper.appendChild(span);
    chatbox.appendChild(wrapper);
    scrollToBottom();
  }

  function appendBotMessageElement() {
    const wrapper = document.createElement("div");
    wrapper.className = "botText";
    const span = document.createElement("span");
    span.innerHTML = "";
    wrapper.appendChild(span);
    chatbox.appendChild(wrapper);
    scrollToBottom();
    return span;
  }

  // ========== EFEKTI I TYPING ME “GABIME” ==========

  async function displayTypingAnimation(element, text) {
    // Ky efekt shkruan ngadalë tekstin si njeri,
    // ndonjëherë fshin një shkronjë dhe e shkruan prapë
    const minDelay = 15;
    const maxDelay = 55;
    const errorChance = 0.07; // 7% mundësi për "gabim"

    element.textContent = ""; // fillon bosh

    for (let i = 0; i < text.length; i++) {
      // mundësi e vogël për të bërë një "gabim" si njeri
      if (Math.random() < errorChance && i > 0 && i < text.length - 2) {
        element.textContent = element.textContent.slice(0, -1); // fshi 1 karakter
        await sleep(randomDelay(minDelay, maxDelay));
        element.textContent += text[i - 1]; // e shkruan prapë të saktën
      }

      element.textContent += text[i];
      await sleep(randomDelay(minDelay, maxDelay));

      scrollToBottom();
    }
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ========== LOGJIKA KRYESORE ==========

  async function processMessage(userText) {
    const botBubble = appendBotMessageElement();

    // Merr përgjigjen nga responses.js
    let botResponse = "Më vjen keq, nuk e kuptova.";
    try {
      botResponse = getBotResponse(userText);
    } catch (e) {
      console.error("Gabim gjatë marrjes së përgjigjes:", e);
    }

    // Simulo vonesën e leximit para se të shkruajë
    await sleep(600 + Math.random() * 700);

    // Shfaq efektin e typing
    await displayTypingAnimation(botBubble, botResponse);
  }

  // ========== NDËRVEPRIMI I PËRDORUESIT ==========

  function sendMessage() {
    const text = textInput.value.trim();
    if (!text) return;

    appendUserMessage(text);
    textInput.value = "";
    processMessage(text);
  }

  sendButton.addEventListener("click", sendMessage);

  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
