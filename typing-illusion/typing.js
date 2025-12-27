async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function typeWriterInto(element, text, speed = 45) {
  element.innerHTML = "";
  const words = text.split(" ");
  let i = 0;

  return new Promise(resolve => {
    const timer = setInterval(() => {
      if (i >= words.length) {
        clearInterval(timer);
        resolve();
        return;
      }
      element.innerHTML += words[i] + (i < words.length - 1 ? " " : "");
      i++;
      if (typeof scrollToBottom === "function") scrollToBottom();
    }, speed);
  });
}

async function renderAIResponse(targetElement, text) {
  await sleep(500);              // thinking pause
  await typeWriterInto(targetElement, text, 45);
}

window.renderAIResponse = renderAIResponse;
