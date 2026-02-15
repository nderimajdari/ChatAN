// Enhanced Response System
let userName = "";
let userEmri = "";
let lastResponse = "";
let lastUserInput = "";
let responseHistory = [];

const preTrainedAnswers = {
    "pershendetje":["Përshëndetje! 👋 Si mund të ju ndihmoj?", "Përshëndetje! Çfarë mund të bëj për ju?", "Mirëmëngjesi! Jam këtu për t'ju ndihmuar."],
    
    "hello":["Hey there! 👋 What's up?", "Hello! How can I help you today?", "Hi! What can I do for you?"],
    "hey":["Hi! 😊 How can I assist you?", "Hey! What do you need?", "Hey there! What's on your mind?"],
    "hi":["Hello! 👋 How are you?", "Hi! How can I help?", "Hey! What can I do for you?"],
    
"what is your name?": ["I'm AN, your smart assistant! 🤖", "You can call me AN.", "I'm AN, nice to meet you!"],
"who are you": ["I'm AN, an AI assistant ready to help!", "I'm AN, your digital companion.", "I'm AN - intelligent assistant ready to help!"],
"how are you doing?": ["I'm doing well, thank you! 😊", "I'm functioning perfectly, thanks!", "I'm fantastic, thanks for asking!"],
"what time is it?": ["I don't have access to real-time info. Check your device! ⏰", "I can't access real-time data, sorry!", "Check your device for the current time!"],
"what is the meaning of life?": ["That's the ultimate question! 🤔 Some say 42, others say happiness!", "Life's meaning is what you make of it! 🌟", "I'd say it's about making connections and positive impact!"],
"tell me a joke": ["Why don't scientists trust atoms? They make up everything! 😄", "What do you call a computer that sings? A Dell! 🎵", "Why did the AI go to school? To improve its learning model! 🤓"],
"what is the weather like today?": ["I don't have real-time weather data! 🌤️ Check weather.com!", "I can't access weather info, sorry!", "Try checking your local weather app!"],
"what is the capital of france?": ["The capital of France is Paris! 🇫🇷 The City of Light!", "Paris is the capital of France.", "It's Paris!"],
"how do i reset my password?": ["Go to login → Click 'Forgot Password' → Follow instructions!", "Click 'Forgot Password' on the login screen.", "Use the password reset option on the login page!"],
"how do i place an order?": ["1. Browse items 2. Add to cart 3. Checkout 4. Pay!", "Add items and go through the checkout process.", "Select items, add to cart, and checkout!"],
"What is the meaning of the word 'serendipity'?": ["Serendipity means a happy or beneficial coincidence.", "It refers to finding something valuable or pleasant when you're not looking for it.", "Serendipity is when something good happens unexpectedly."],
"What is your favorite color?": ["I don't have the ability to have a favorite color.", "As an AI, I don't have the capability to experience preferences.", "I don't have the capacity for personal preferences like humans do."],
"How do I track my order?": ["To track your order, go to the order history page and click on the order you want to track.", "You can track your order by going to the order history page and selecting the order you want to track.", "To track your order, follow the instructions on the order history page."],
"What is the largest planet in our solar system?": ["Jupiter is the largest planet in our solar system.", "It's Jupiter.", "The largest planet in our solar system is Jupiter."],
"How do I contact customer support?": ["To contact customer support, go to the contact page and fill out the form or use the live chat feature.", "You can contact customer support by filling out the form on the contact page or using the live chat feature.", "To contact customer support, follow the instructions on the contact page."],
"What is the distance between Earth and Mars?": ["The distance between Earth and Mars varies depending on their positions in their respective orbits.", "It varies, but on average it's about 140 million miles (225 million kilometers).", "On average, it's about 140 million miles (225 million kilometers)."],
    "how are you ":[" I'm just a computer program, so I don't have feelings or physical sensations. But thank you for asking. How can I help you today?", " I am an AI and do not have the ability to feel emotions, but thank you for asking. How can I assist you?", " I’m good, thanks. How can I help you today?"],

    "default":"I'm sorry, My training data does not include the information you're asking for. Could you please try asking a different question?"
};


function getBotResponse(input) {
  lastUserInput = input;
  input = input.toLowerCase().trim();
  
  if (input.startsWith("my name is ")) {
    const name = input.replace("my name is ", "").trim();
    userName = name;
    const responses = [
      `Nice to meet you ${name}! 👋 How can I help you today?`,
      `Hey ${name}! 😊 What can I do for you?`,
      `Hello ${name}! Great to know you!`
    ];
    lastResponse = responses[Math.floor(Math.random() * responses.length)];
    return lastResponse;
  }

  if (input.startsWith("emri im eshte ") || input.startsWith("emri im është ")) {
    const emri = input.replace(/^emri im (eshte|është) /, "").trim();
    userEmri = emri;
    const responses = [
      `Gëzohem që ju njoha ${emri}! 👋`,
      `Përshëndetje ${emri}! 😊 Çfarë mund të bëj për ju?`,
      `Tung ${emri}! Mirë që ju njoha!`
    ];
    lastResponse = responses[Math.floor(Math.random() * responses.length)];
    return lastResponse;
  }

  let response = preTrainedAnswers[input];
  
  if (!response) {
    const defaultResponses = [
      "That's interesting! 🤔 I'm still learning about that topic.",
      "Hmm, I don't have info about that. 😅 Try asking something different!",
      "I'm not sure about that one. 🤷 Ask me about something else!",
      "That's outside my knowledge base. What else can I help with?",
      "Great question! I need more info. Try something else! 💡"
    ];
    response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  } else {
    response = response[Math.floor(Math.random() * response.length)];
  }

  if (userName && Math.random() > 0.5) {
    response = response.replace("Hello", `Hello ${userName}`);
  }

  lastResponse = response;
  return response;
}

// Provide an alternative response (tries to return a different one than lastResponse)
function getAlternativeResponse(input) {
  const original = lastResponse;
  for (let i = 0; i < 6; i++) {
    const alt = getBotResponse(input);
    if (alt !== original) return alt;
  }
  return lastResponse;
}

// expose helper to global scope
window.getAlternativeResponse = getAlternativeResponse;
