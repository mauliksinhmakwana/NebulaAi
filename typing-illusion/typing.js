function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeText(element, text, speed = 25) {
  element.textContent = "";
  for (let i = 0; i < text.length; i++) {
    element.textContent += text[i];
    await sleep(speed);
  }
}

/* 🔴 CRITICAL: expose globally */
window.typeText = typeText;
