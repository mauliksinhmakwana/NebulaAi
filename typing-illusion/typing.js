// ========= Ventora Typing Illusion =========

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function typeWriterEffect(element, text, speed = 40) {
  element.classList.add("ai-typing", "typing-cursor");
  element.innerHTML = "";

  const words = text.split(" ");
  let index = 0;

  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (index >= words.length) {
        clearInterval(interval);
        element.classList.remove("typing-cursor");
        resolve();
        return;
      }

      element.innerHTML += words[index] + " ";
      index++;
      scrollToBottom?.();
    }, speed);
  });
}

// Public helper to render AI message
async function renderAIResponse(container, rawText) {
  // thinking pause (illusion)
  await sleep(600);
  await typeWriterEffect(container, rawText, 45);
}
