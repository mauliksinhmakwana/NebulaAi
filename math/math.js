// math/math.js

// 1. Load KaTeX styles and scripts dynamically
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
document.head.appendChild(link);

const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
document.head.appendChild(script);

const autoRenderScript = document.createElement('script');
autoRenderScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
document.head.appendChild(autoRenderScript);

// 2. Function to render math in a specific element
function renderMath(element) {
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError: false
        });
    } else {
        // If script hasn't loaded yet, try again in 100ms
        setTimeout(() => renderMath(element), 100);
    }
}
