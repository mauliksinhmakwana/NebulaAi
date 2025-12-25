// math/math.js

// 1. Auto-load the KaTeX engine from CDN
const katexCSS = document.createElement('link');
katexCSS.rel = 'stylesheet';
katexCSS.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
document.head.appendChild(katexCSS);

const katexJS = document.createElement('script');
katexJS.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
document.head.appendChild(katexJS);

const autoRenderJS = document.createElement('script');
autoRenderJS.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
document.head.appendChild(autoRenderJS);

/**
 * Automatically scans an element for $ or $$ and turns them into math
 */
function autoRenderMath(element) {
    if (window.renderMathInElement) {
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
        // If the library is still loading, wait 100ms and try again
        setTimeout(() => autoRenderMath(element), 100);
    }
}
