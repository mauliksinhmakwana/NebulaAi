// manu/manu.js
function toggleBottomMenu() {
    const options = document.getElementById('menuExpandedOptions');
    options.classList.toggle('active');
}

function handleMenuAction(actionFunction) {
    // Close the slide-up menu
    document.getElementById('menuExpandedOptions').classList.remove('active');
    
    // Execute the requested function
    if (typeof window[actionFunction] === 'function') {
        window[actionFunction]();
    }
}

// Close if user clicks elsewhere in the sidebar
document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.menu-bottom-wrapper');
    const options = document.getElementById('menuExpandedOptions');
    if (wrapper && !wrapper.contains(e.target)) {
        options.classList.remove('active');
    }
});
