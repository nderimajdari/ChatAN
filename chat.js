const getTime = () => {
  const today = new Date();
  const time = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return time;
};

let firstMessage = "Hello, I'm chat AN! How can I help you today?";
document.getElementById("botStarterMessage").innerHTML = `<p class="botText"><span>${firstMessage}</span></p><div class="bot-icons"><span class="material-symbols-rounded">thumb_up_off_alt</span><span class="material-symbols-rounded">thumb_down_off_alt</span><span class="material-symbols-rounded">content_copy</span><span class="material-symbols-rounded">autorenew</span><span class="material-symbols-rounded">more_horiz</span></div>`;

document.getElementById("chatbox").scrollIntoView(false);

let questionQueue = [];
let isAnsweringQuestion = false;
let intervalId = null;
let scrollIntervalId = null;

const displayTypingAnimation = (botResponse, backspaceProb = 0.1, onComplete, $targetSpan) => {
  let words = botResponse.split(" ");
  let currentWord = 0;
  let currentLetter = 0;
  let wrongWord = false;
  let wrongCount = 0;

  // target span to write into (fallback to last bot span)
  const $span = ($targetSpan && $targetSpan.length) ? $targetSpan : $(".botText:last span");

  intervalId = setInterval(() => {
    // safety: if target was removed, stop
    if (!$span || !$span.length) {
      clearInterval(intervalId);
      clearInterval(scrollIntervalId);
      return;
    }

    if (currentWord >= words.length) return; // extra safety

    if (currentLetter <= words[currentWord].length) {
      let sentence = words.slice(0, currentWord + 1).join(" ");
      let cursor = currentLetter % 2 === 0 ? "_" : "";
      if (wrongWord && currentLetter !== 0) {
        $span.text(`${sentence}${cursor}`);
      } else {
        $span.text(`${sentence}${currentWord === words.length - 1 ? "" : " "}${cursor}`);
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
        $span.not(':last-child').fadeOut("slow");
      }, 2000);

      // remove generating flag on the message element
      try {
        $span.closest('.botText').removeAttr('data-generating');
      } catch (e) {}

      // call completion handler to replace the specific element
      if (typeof onComplete === 'function') onComplete();
      // NOTE: do not call clearQuestionQueue here; let onComplete handle it
      clearInterval(scrollIntervalId);
    }

    // Generate some wrong words
    if (
      currentWord < words.length &&
      currentLetter === Math.floor(words[currentWord].length / 2) &&
      !wrongWord &&
      wrongCount < 2 &&
      Math.random() < backspaceProb
    ) {
      let wrongLength = Math.floor(Math.random() * (words[currentWord].length - currentLetter)) + 1;
      let wrong = "";
      for (let i = 0; i < wrongLength; i++) {
        wrong += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      }
      let correctedSentence = words.slice(0, currentWord).join(" ");
      let wrongSentence = `${correctedSentence} ${wrong}`;
      let cursor = currentLetter % 2 === 0 ? "_" : "";
      $span.text(`${wrongSentence}${cursor}`);
      wrongWord = true;
      wrongCount++;
      setTimeout(() => {
        if (Math.random() < 0.5) {
          $span.text(`${correctedSentence}${currentWord === words.length - 1 ? "" : " "}${cursor}`);
          wrongWord = false;
        } else {
          $span.text(`${correctedSentence}${cursor}`);
          currentLetter = correctedSentence.length;
        }
      }, 100);
    }
  }, 150);
}

// small helper to safely inject user text into attributes
function escapeHtml(text) {
  if (!text && text !== '') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const displayBotResponse = (botResponse, $targetBot, userText = '', userId = '') => {
  const userAttr = userText ? ` data-user="${escapeHtml(userText)}"` : '';
  const idAttr = userId ? ` data-user-id="${escapeHtml(userId)}"` : '';
  const forAttr = userId ? ` data-for="${escapeHtml(userId)}"` : '';
  let botHtml = `<p class="botText"${forAttr}><span>${botResponse}</span></p><div class="bot-icons"${userAttr}${idAttr}><span class="material-symbols-rounded">thumb_up_off_alt</span><span class="material-symbols-rounded">thumb_down_off_alt</span><span class="material-symbols-rounded">content_copy</span><span class="material-symbols-rounded">autorenew</span><span class="material-symbols-rounded">more_horiz</span></div>`;
  
  if ($targetBot && $targetBot.length) {
    // remove target and any following orphaned icons
    const $nextIcons = $targetBot.next('.bot-icons');
    if ($nextIcons.length) {
      $nextIcons.remove();
    }
    $targetBot.replaceWith(botHtml);
  } else {
    // fallback: replace last botText
    $(".botText:last").replaceWith(botHtml);
  }
};

const clearQuestionQueue = () => {
  isAnsweringQuestion = false;
  processQuestionQueue();
};

const getHardResponse = (messageObj) => {
  const userText = messageObj.text;
  const msgId = messageObj.id;
  // avoid generating twice for same message
  if (generatingMap[msgId]) return;
  // skip if a response already exists for this message in the DOM
  const $existing = $(`.botText[data-for="${msgId}"]`);
  if ($existing.length > 0) {
    generatingMap[msgId] = false;
    return;
  }
  generatingMap[msgId] = true;
  let botResponse = getBotResponse(userText);
  // create placeholder elements and insert them right after the specific user message
  const $userMsg = $(`.userText[data-msgid="${msgId}"]`);
  if ($userMsg.length === 0) {
    // user message was removed, skip
    generatingMap[msgId] = false;
    return;
  }
  const $botText = $(`<p class="botText" data-for="${msgId}"><span>|</span></p>`);
  const $icons = $(`<div class="bot-icons" data-user="${escapeHtml(userText)}" data-user-id="${msgId}"><span class="material-symbols-rounded">thumb_up_off_alt</span><span class="material-symbols-rounded">thumb_down_off_alt</span><span class="material-symbols-rounded">content_copy</span><span class="material-symbols-rounded">autorenew</span><span class="material-symbols-rounded">more_horiz</span></div>`);
  $userMsg.after($botText);
  $botText.after($icons);

  // mark this placeholder as generating to prevent duplicate regenerations
  $botText.attr('data-generating', 'true');

  // start typing animation targeting this placeholder's span
  let completedFlag = false;
  displayTypingAnimation(botResponse, 0.1, function() {
    if (completedFlag) return; // only run once
    completedFlag = true;
    displayBotResponse(botResponse, $botText, userText, msgId);
    // clear generating lock for this message
    generatingMap[msgId] = false;
    clearQuestionQueue();
  }, $botText.find('span'));

  scrollIntervalId = setInterval(() => {
    const chatBox = document.querySelector('.chat-container');
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 10);
};

const queueQuestion = async (messageObj) => {
  questionQueue.push(messageObj);
  if (!isAnsweringQuestion) {
    processQuestionQueue();
  }
};

const processQuestionQueue = async () => {
  if (questionQueue.length > 0 && !isAnsweringQuestion) {
    isAnsweringQuestion = true;
    // pop until we find a message that is not currently generating
    let question = null;
    while (questionQueue.length > 0) {
      const candidate = questionQueue.pop();
      // skip if already generating or already has a response
      if (!generatingMap[candidate.id] && $(`.botText[data-for="${candidate.id}"]`).length === 0) {
        question = candidate;
        break;
      }
    }

    if (!question) {
      isAnsweringQuestion = false;
      return;
    }

    clearInterval(intervalId);
    clearInterval(scrollIntervalId);
    getHardResponse(question);
  }
};

const getResponse = () => {
  let userText = $("#textInput").val();

  if (userText.trim() === "") {
    return;
  }

  const msgId = 'm' + Date.now() + Math.floor(Math.random() * 1000);
  let userHtml = `<p class="userText" data-msgid="${msgId}"><span>${userText}</span></p>`;

  // store last user message for regenerate functionality
  lastUserMessage = userText;
  lastUserMessageId = msgId;

  $("#textInput").val("");
  $("#chatbox").append(userHtml);
  const chatBox = document.querySelector('.chat-container');
  chatBox.scrollTop = chatBox.scrollHeight;

  queueQuestion({ id: msgId, text: userText });
};

const sendButton = document.querySelector("#send-btn");
sendButton.addEventListener("click", getResponse);

$("#textInput").keypress((e) => {
  if (e.which === 13 && !e.shiftKey) {
    getResponse();
    e.preventDefault();
  }
});

// Auto resize textarea
const textarea = document.querySelector('#textInput');
textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
});

// Regenerate button functionality
let lastUserMessage = "";
let isRegenerating = false;
let lastUserMessageId = "";
// per-message generating lock map
let generatingMap = {};


$(document).on('click', '.bot-icons span', function() {
  if (isRegenerating) return;
  
  const icon = $(this).text().toLowerCase();
  const botMessage = $(this).parent().prev('.botText').find('span').text();
  const iconContainer = $(this);
  
  if (icon.includes('autorenew')) {
    // Regenerate response
    isRegenerating = true;
    
    if (lastUserMessage) {
      // Show loading animation on icon
      iconContainer.addClass('spinning');

      const oldIcons = iconContainer.parent();
      const oldMessage = oldIcons.prev('.botText');

      // if that message is currently being generated, ignore duplicate regenerate
      if (oldMessage.data('generating') || generatingMap[lastUserMessageId]) {
        iconContainer.removeClass('spinning');
        isRegenerating = false;
        return;
      }

      // Prepare placeholder elements to insert in-place
      const userId = oldIcons.data('user-id') || lastUserMessageId;
      const $botText = $(`<p class="botText" data-for="${userId}"><span>|</span></p>`);
      const $icons = $(`<div class="bot-icons" data-user="${escapeHtml(lastUserMessage)}" data-user-id="${escapeHtml(userId)}"><span class="material-symbols-rounded">thumb_up_off_alt</span><span class="material-symbols-rounded">thumb_down_off_alt</span><span class="material-symbols-rounded">content_copy</span><span class="material-symbols-rounded">autorenew</span><span class="material-symbols-rounded">more_horiz</span></div>`);
      $botText.attr('data-generating', 'true');
      // mark generating in map to block queue from creating duplicates
      generatingMap[userId] = true;

      // get an alternative response
      const alt = (window.getAlternativeResponse) ? window.getAlternativeResponse(lastUserMessage) : getBotResponse(lastUserMessage);

      // Remove old icons first, then replace the old message with the placeholder
      oldIcons.remove();
      oldMessage.replaceWith($botText);
      $botText.after($icons);

      // Start typing animation for the alternative response targeting the new placeholder
      let regCompleted = false;
      displayTypingAnimation(alt, 0.1, function() {
        if (regCompleted) return; // only run once
        regCompleted = true;
        // when typing completes, replace that specific placeholder with final content
        displayBotResponse(alt, $botText, lastUserMessage, userId);
        // clear generating map for this id
        generatingMap[userId] = false;
        isRegenerating = false;
        iconContainer.removeClass('spinning');
        clearQuestionQueue();
      }, $botText.find('span'));
    }
  } else if (icon.includes('content_copy')) {
    // Copy to clipboard
    navigator.clipboard.writeText(botMessage).then(() => {
      const originalText = iconContainer.text();
      iconContainer.text('check').css({
        'color': '#06b6d4',
        'transform': 'scale(1.2)'
      });
      
      setTimeout(() => {
        iconContainer.text(originalText).css({
          'color': '',
          'transform': ''
        });
      }, 2000);
    });
  } else if (icon.includes('thumb_up')) {
    // Thumbs up
    iconContainer.toggleClass('liked');
    if (iconContainer.hasClass('liked')) {
      iconContainer.css('color', '#06b6d4');
    } else {
      iconContainer.css('color', '');
    }
  } else if (icon.includes('thumb_down')) {
    // Thumbs down
    iconContainer.toggleClass('disliked');
    if (iconContainer.hasClass('disliked')) {
      iconContainer.css('color', '#ef4444');
    } else {
      iconContainer.css('color', '');
    }
  }
});

// lastUserMessage is set inside getResponse; no extra handler needed

