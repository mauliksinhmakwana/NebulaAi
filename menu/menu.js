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
    const name = localStorage.getItem('profile_name') || 'Maulik';
    const role = localStorage.getItem('profile_role') || 'Student';

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

    closeEditProfile();
}

/* Load profile on startup */
document.addEventListener('DOMContentLoaded', () => {
    const name = localStorage.getItem('profile_name');
    const role = localStorage.getItem('profile_role');

    if (name) {
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileAvatar').textContent =
            name.charAt(0).toUpperCase();
    }

    if (role) {
        document.getElementById('profileRole').textContent = role;
    }
});
