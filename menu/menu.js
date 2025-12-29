/* ===== PROFILE MENU TOGGLE ===== */
function toggleProfileMenu() {
    document.getElementById('profileMenu')
        .classList.toggle('active');
}

/* Close menu when clicking outside */
document.addEventListener('click', (e) => {
    if (!e.target.closest('.sidebar-profile-wrapper')) {
        document.getElementById('profileMenu')
            ?.classList.remove('active');
    }
});

/* ===== EDIT PROFILE POPUP ===== */

function openEditProfile() {
    const name = localStorage.getItem('profile_name') || 'Your Name';
    const role = localStorage.getItem('profile_role') || 'Role';

    const modal = document.createElement('div');
    modal.id = 'editProfileModal';
    modal.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.6);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:4000;
    `;

    modal.innerHTML = `
        <div style="
            background:rgba(20,20,20,0.98);
            border:1px solid var(--border);
            border-radius:16px;
            padding:20px;
            width:320px;
        ">
            <h3 style="margin-bottom:14px;">Edit profile</h3>

            <input id="epName"
                value="${name}"
                placeholder="Name"
                class="settings-select"
                style="margin-bottom:10px;">

            <input id="epRole"
                value="${role}"
                placeholder="Role"
                class="settings-select">

            <div style="display:flex; gap:10px; margin-top:16px;">
                <button class="settings-btn"
                    onclick="closeEditProfile()">Cancel</button>
                <button class="settings-btn primary"
                    onclick="saveProfile()">Save</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeEditProfile() {
    document.getElementById('editProfileModal')?.remove();
}

function saveProfile() {
    const name = document.getElementById('epName').value.trim();
    const role = document.getElementById('epRole').value.trim() || 'Student';

    if (!name) return;

    localStorage.setItem('profile_name', name);
    localStorage.setItem('profile_role', role);

    document.getElementById('profileName').textContent = name;
    document.getElementById('profileRole').textContent = role;
    document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();

    // ALSO SAVE TO PERSONALIZATION FOR AI TO USE
    updatePersonalizationWithProfileName(name);
    
    closeEditProfile();
    
    // Show toast if available
    if (typeof showToast === 'function') {
        showToast('Profile updated!');
    }
}

/* ===== SYNC PROFILE NAME WITH AI PERSONALIZATION ===== */
function updatePersonalizationWithProfileName(name) {
    // Update the global personalization object used by AI
    if (!window.personalization) {
        window.personalization = {};
    }
    window.personalization.userName = name;
    
    // Also save to personalization localStorage
    const savedPers = localStorage.getItem('ventora_personalization');
    if (savedPers) {
        try {
            const persData = JSON.parse(savedPers);
            persData.userName = name;
            localStorage.setItem('ventora_personalization', JSON.stringify(persData));
        } catch (e) {
            console.error('Error updating personalization:', e);
        }
    }
    
    // Alternative: Also save to a simpler key for easy access
    localStorage.setItem('ai_user_name', name);
}

/* ===== LOAD PROFILE ON STARTUP ===== */
function loadProfileData() {
    const name = localStorage.getItem('profile_name');
    const role = localStorage.getItem('profile_role');

    if (name && name !== 'Your Name') {
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();
        
        // Sync with AI personalization on load
        updatePersonalizationWithProfileName(name);
    }

    if (role && role !== 'Role') {
        document.getElementById('profileRole').textContent = role;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadProfileData);

/* ===== ALTERNATIVE: CREATE A GLOBAL GETTER FOR USERNAME ===== */
// This ensures the AI always has access to the current profile name
Object.defineProperty(window, 'userProfileName', {
    get: function() {
        return localStorage.getItem('profile_name') || 
               (window.personalization?.userName || '');
    },
    configurable: true
});
