async function typeText(element, html, speed = 25) {
    element.innerHTML = ""; // Clear existing
    
    // Create a temporary div to parse the HTML string into nodes
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const nodes = Array.from(temp.childNodes);
    
    for (const node of nodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            // If it's plain text, type it character by character
            const text = node.textContent;
            for (let i = 0; i < text.length; i++) {
                element.innerHTML += text[i];
                await sleep(speed);
            }
        } else {
            // If it's an HTML element (like <strong>), append it instantly
            // or you can recursively type it, but appending is safer for layout
            element.appendChild(node.cloneNode(true));
            await sleep(speed); 
        }
        // Keep the view scrolled to the bottom while typing
        scrollToBottom();
    }
}
/*
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
/*window.typeText = typeText;*/
