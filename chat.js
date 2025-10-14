const coll = document.getElementsByClassName("collapsible");

const addCollapsibleEventListeners = () => {
  for (const item of coll) {
    item.addEventListener("click", () => {
      item.classList.toggle("active");
      const content = item.nextElementSibling;
      content.style.maxHeight = content.style.maxHeight ? null : `${content.scrollHeight}px`;
    });
  }
};

const getTime = () => {
  const today = new Date();
  const time = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return time;
};

let firstMessage = "Hello, I'm chatbot AN! How can I help you today?";
document.getElementById("botStarterMessage").innerHTML = `<p class="botText"><span>${firstMessage}</span></p>`;

let time = getTime();
$("#chat-timestamp").append(time);
document.getElementById("userInput").scrollIntoView(false);

let questionQueue = [];
let isAnsweringQuestion = false;
let intervalId = null;
let scrollIntervalId = null;

const displayTypingAnimation = (botResponse, backspaceProb = 0.1) => {
  let words = botResponse.split(" ");
  let currentWord = 0;
  let currentLetter = 0;
  let wrongWord = false;
  let wrongCount = 0;

  intervalId = setInterval(() => {
    if (currentLetter <= words[currentWord].length) {
      let sentence = words.slice(0, currentWord + 1).join(" ");
      let cursor = currentLetter % 2 === 0 ? "_" : "";
      if (wrongWord && currentLetter !== 0) {
        $(".botText:last span").text(`${sentence}${cursor}`);
      } else {
        $(".botText:last span").text(`${sentence}${currentWord === words.length - 1 ? "" : " "}${cursor}`);
      }
      currentLetter++;
    } else {
      currentWord++;
      currentLetter = 0;
      wrongWord = false;
      wrongCount = 0;
    }

    if (currentWord === words.length) {
      clearInterval(intervalId);

      setTimeout(() => {
        $(".botText:last span:not(:last-child)").fadeOut("slow");
      }, 2000);

      displayBotResponse(botResponse);
      clearQuestionQueue();
      clearInterval(scrollIntervalId);
    }

    // Generate some wrong words
    if (
      currentLetter === Math.floor(words[currentWord].length / 2) &&
      !wrongWord &&
      wrongCount < 2 &&
      Math.random() < backspaceProb
    ) {
      let wrongLength = Math.floor(Math.random() * (words[currentWord].length - currentLetter)) + 1;
      let wrong = "";
      for (let i = 0; i < wrongLength; i++) {
        wrong += String.fromCharCode(Math.floor(Math.random() * 26) + 97); // Generate random lowercase letter
      }
      let correctedSentence = words.slice(0, currentWord).join(" ");
      let wrongSentence = `${correctedSentence} ${wrong}`;
      let cursor = currentLetter % 2 === 0 ? "_" : "";
      $(".botText:last span").text(`${wrongSentence}${cursor}`);
      wrongWord = true;
      wrongCount++;
      setTimeout(() => {
        if (Math.random() < 0.5) {
          $(".botText:last span").text(`${correctedSentence}${currentWord === words.length - 1 ? "" : " "}${cursor}`);
          wrongWord = false;
        } else {
          $(".botText:last span").text(`${correctedSentence}${cursor}`);
          currentLetter = correctedSentence.length;
        }
      }, 100);
    }
  }, 150);
}

const displayBotResponse = (botResponse) => {
  let botHtml = `<p class="botText"><span>${botResponse}</span></p>`;
  $(".botText:last").replaceWith(botHtml);
};

const clearQuestionQueue = () => {
  isAnsweringQuestion = false;
  processQuestionQueue();
};

const getHardResponse = (userText) => {
  let botResponse = getBotResponse(userText);
  let botHtml = `<p class="botText"><span>|</span></p>`;

  $(".userText:last").after(botHtml);
  displayTypingAnimation(botResponse);

  scrollIntervalId = setInterval(() => {
    document.getElementById("chat-bar-bottom").scrollIntoView(true);
  }, 10);
};

const queueQuestion = async (userText) => {
  questionQueue.push(userText);
  await processQuestionQueue();
};

const processQuestionQueue = async () => {
  if (questionQueue.length > 0 && !isAnsweringQuestion) {
    isAnsweringQuestion = true;
    const question = questionQueue.pop();
    clearInterval(intervalId);
    clearInterval(scrollIntervalId);
    await getHardResponse(question);
    await processQuestionQueue();
    isAnsweringQuestion = false;
  }
};

const getResponse = () => {
  let userText = $("#textInput").val();

  if (userText.trim() === "") {
    return;
  }

  let userHtml = `<p class="userText"><span>${userText}</span></p>`;

  $("#textInput").val("");
  $("#chatbox").append(userHtml);
  document.getElementById("chat-bar-bottom").scrollIntoView(true);

  queueQuestion(userText);
};

const buttonSendText = (sampleText) => {
  let userHtml = `<p class="userText"><span>${sampleText}</span></p>`;

  $("#textInput").val("");
  $("#chatbox").append(userHtml);
  document.getElementById("chat-bar-bottom").scrollIntoView(true);
};

const sendButton = () => {
  getResponse();
};

$("#textInput").keypress((e) => {
  if (e.which === 13) {
    getResponse();
  }
});
