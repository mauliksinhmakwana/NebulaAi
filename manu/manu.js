// manu/manu.js

function toggleBottomMenu() {
    const options = document.getElementById('menuExpandedOptions');
    options.classList.toggle('active');
}

// Automatically close the menu after clicking an option
function handleMenuAction(functionName) {
    document.getElementById('menuExpandedOptions').classList.remove('active');
    
    // Check if the old function exists and run it
    if (typeof window[functionName] === 'function') {
        window[functionName]();
    }
}

// Close menu if user clicks elsewhere
document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.menu-bottom-wrapper');
    const options = document.getElementById('menuExpandedOptions');
    if (wrapper && !wrapper.contains(e.target)) {
        options.classList.remove('active');
    }
});
