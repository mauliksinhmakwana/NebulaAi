// manu/manu.js - SIMPLE WORKING VERSION

// Initialize the menu system
function initMenuSystem() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const conversationsList = document.getElementById('conversationsList');
        
        if (!conversationsList) {
            console.error('conversationsList not found');
            return;
        }
        
        // Create bottom wrapper HTML
        const bottomWrapperHTML = `
            <div class="menu-bottom-wrapper">
                <div class="menu-expanded-options" id="menuExpandedOptions">
                    <div class="menu-item" onclick="handleMenuAction('toggleGoalModal')">
                        <i class="fas fa-check-circle"></i>
                        <span>Study Goals</span>
                    </div>
                    <div class="menu-item" onclick="handleMenuAction('openPersonalization')">
                        <i class="fas fa-user-circle"></i>
                        <span>Personalization</span>
                    </div>
                    <div class="menu-item" onclick="handleMenuAction('openSettings')">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </div>
                    <div class="menu-item" onclick="handleMenuAction('openAboutModal')">
                        <i class="fas fa-info-circle"></i>
                        <span>About</span>
                    </div>
                    <div class="menu-item" onclick="handleMenuAction('exportChat')">
                        <i class="fas fa-download"></i>
                        <span>Export Chat</span>
                    </div>
                </div>
                
                <button class="menu-trigger-btn" onclick="toggleBottomMenu()">
                    <div class="user-avatar-mini">M</div>
                    <div class="trigger-text">Maulik Makwana</div>
                    <i class="fas fa-chevron-up trigger-icon"></i>
                </button>
            </div>
        `;
        
        // Insert after conversationsList
        conversationsList.insertAdjacentHTML('afterend', bottomWrapperHTML);
        
        // Set up event listeners
        setupMenuEventListeners();
    }, 100);
}

// Toggle the bottom menu
function toggleBottomMenu() {
    const options = document.getElementById('menuExpandedOptions');
    if (options) {
        options.classList.toggle('active');
    }
}

// Handle menu actions
function handleMenuAction(actionFunction) {
    // Close the menu
    const options = document.getElementById('menuExpandedOptions');
    if (options) {
        options.classList.remove('active');
    }
    
    // Close the sidebar on mobile
    if (window.innerWidth <= 768) {
        closeMenu();
    }
    
    // Call the function
    if (typeof window[actionFunction] === 'function') {
        window[actionFunction]();
    }
}

// Set up event listeners
function setupMenuEventListeners() {
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.menu-bottom-wrapper');
        const options = document.getElementById('menuExpandedOptions');
        
        if (wrapper && options && !wrapper.contains(e.target)) {
            options.classList.remove('active');
        }
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const options = document.getElementById('menuExpandedOptions');
            if (options) {
                options.classList.remove('active');
            }
        }
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenuSystem);
} else {
    initMenuSystem();
}



// Add these functions if they don't exist
function toggleGoalModal() {
    // Your study goals modal function
    console.log('Open Study Goals');
}

function openAboutModal() {
    // Your about modal function
    console.log('Open About Modal');
}

// Make sure these functions are globally accessible
window.toggleGoalModal = toggleGoalModal;
window.openPersonalization = openPersonalization;
window.openSettings = openSettings;
window.openAboutModal = openAboutModal;
window.exportChat = exportChat;
window.clearAllData = clearAllData;
