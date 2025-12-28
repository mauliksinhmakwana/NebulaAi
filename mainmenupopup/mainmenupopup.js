// mainmenupopup/mainmenupopup.js

const sections = {
    goals: {
        title: "Your Goals",
        render: () => `
            <div class="add-task-bar">
                <input type="text" id="popupTaskInput" placeholder="Add a new goal...">
                <button class="add-task-btn" onclick="addPopupTask()">ADD</button>
            </div>
            <div id="popupTaskList"></div>
            <div class="note-section">
                <label>Study Notes</label>
                <textarea id="popup-notes-area" placeholder="Notes auto-save..."></textarea>
            </div>
        `,
        init: () => {
            renderPopupTasks();
            const area = document.getElementById('popup-notes-area');
            area.value = localStorage.getItem('ventora_study_notes') || '';
            area.oninput = (e) => localStorage.setItem('ventora_study_notes', e.target.value);
        }
    },
    personalization: {
        title: "Personalization",
        render: () => `
            <div class="pers-group">
                <label class="pers-label">Preferred Name</label>
                <input type="text" id="p_persName" class="pers-input">
            </div>
            <div class="pers-group">
                <label class="pers-label">Proficiency Level</label>
                <select id="p_persLevel" class="pers-select">
                    <option value="school">Foundation</option>
                    <option value="college">Advanced Academic</option>
                </select>
            </div>
            <div class="pers-group"><label class="pers-label">Interests</label><input type="text" id="p_persMajor" class="pers-input"></div>
            <button class="pers-btn save" style="width:100%" onclick="savePopupPers()">Save Personalization</button>
        `,
        init: () => {
            document.getElementById('p_persName').value = window.personalization.userName;
            document.getElementById('p_persLevel').value = window.personalization.studyLevel;
            document.getElementById('p_persMajor').value = window.personalization.major;
        }
    },
    settings: {
        title: "Settings",
        render: () => `
            <div class="settings-group">
                <label class="settings-label">Model</label>
                <select class="settings-select" id="p_modelSelect">
                    <option value="groq:general">MIA – General</option>
                    <option value="groq:research">MIA – Research</option>
                </select>
            </div>
            <button class="settings-btn" onclick="exportChat()">Export Chat History</button>
            <button class="settings-btn primary" onclick="savePopupSettings()">Save Settings</button>
            <button class="settings-btn" style="color:red; border-color:red; margin-top:20px" onclick="clearAllData()">Reset All Data</button>
        `,
        init: () => {
            document.getElementById('p_modelSelect').value = settings.model;
        }
    },
    about: {
        title: "About Ventora",
        render: () => `
            <div style="text-align:center">
                <h2 style="letter-spacing:4px">VENTORA<span style="color:var(--accent-blue)">AI</span></h2>
                <p>Version 5.4 MIA</p>
                <p style="color:var(--text-secondary)">Created by Maulik Makwana</p>
                <hr style="opacity:0.1; margin:20px 0">
                <p>Ventora is a Virtual Educational Assistant focused on Pharmaceutical Science and Health education.</p>
            </div>
        `,
        init: () => {}
    }
};

function openMainPopup(sectionId = 'goals') {
    const overlay = document.getElementById('mainMenuPopup');
    overlay.classList.add('active');
    switchSection(sectionId);
    if(typeof closeMenu === "function") closeMenu();
}

function closeMainPopup() {
    document.getElementById('mainMenuPopup').classList.remove('active');
}

function switchSection(id) {
    const section = sections[id];
    const content = document.getElementById('popupMainContent');
    const body = document.getElementById('popupBody');
    const title = document.getElementById('popupTitle');
    
    // Update Sidebar Active UI
    document.querySelectorAll('.sidebar-nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });

    title.innerText = section.title;
    body.innerHTML = section.render();
    section.init();

    if (window.innerWidth <= 768) {
        content.classList.add('mobile-active');
    }
}

function closeSectionMobile() {
    document.getElementById('popupMainContent').classList.remove('mobile-active');
}

// Helper Functions for Task Management inside Popup
function addPopupTask() {
    const input = document.getElementById('popupTaskInput');
    if (!input.value.trim()) return;
    tasks.push({ text: input.value, completed: false });
    input.value = '';
    saveAndRenderPopup();
}

function saveAndRenderPopup() {
    localStorage.setItem('ventora_tasks', JSON.stringify(tasks));
    renderPopupTasks();
}

function renderPopupTasks() {
    const list = document.getElementById('popupTaskList');
    if(!list) return;
    list.innerHTML = tasks.map((task, index) => `
        <div class="task-item">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index}); renderPopupTasks();">
            <span style="${task.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${task.text}</span>
            <i class="fas fa-trash" style="cursor:pointer; opacity:0.5" onclick="deleteTask(${index}); renderPopupTasks();"></i>
        </div>
    `).join('');
}

function savePopupPers() {
    window.personalization.userName = document.getElementById('p_persName').value;
    window.personalization.studyLevel = document.getElementById('p_persLevel').value;
    window.personalization.major = document.getElementById('p_persMajor').value;
    localStorage.setItem('nebula_pers', JSON.stringify(window.personalization));
    showToast("Profile Updated");
}

function savePopupSettings() {
    settings.model = document.getElementById('p_modelSelect').value;
    localStorage.setItem('nebula_settings', JSON.stringify(settings));
    showToast("Settings Saved");
}
