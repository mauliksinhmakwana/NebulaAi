// manu/manu.js
function toggleBottomMenu() {
    const options = document.getElementById('menuExpandedOptions');
    options.classList.toggle('active');
}

// Close menu if user clicks outside of it
document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.menu-bottom-wrapper');
    const options = document.getElementById('menuExpandedOptions');
    if (wrapper && !wrapper.contains(e.target)) {
        options.classList.remove('active');
    }
});

function handleMenuAction(actionFunction) {
    const options = document.getElementById('menuExpandedOptions');
    options.classList.remove('active'); // Close after click
    if (typeof window[actionFunction] === 'function') {
        window[actionFunction]();
    }
}
