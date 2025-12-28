// Main Menu Popup - Unified Settings Interface

// Global state
let currentView = 'menu';
let currentSection = null;

// Data structures
const sections = {
    personalization: {
        id: 'personalization',
        title: 'Personalization',
        icon: 'fas fa-user-circle',
        description: 'Customize how Ventora responds to you'
    },
    settings: {
        id: 'settings',
        title: 'Settings',
        icon: 'fas fa-cog',
        description: 'Configure model and preferences'
    },
    goals: {
        id: 'goals',
        title: 'Your Goals',
        icon: 'fas fa-check-circle',
        description: 'Track your study goals and notes'
    },
    about: {
        id: 'about',
        title: 'About',
        icon: 'fas fa-info-circle',
        description: 'Learn about Ventora AI'
    },
    export: {
        id: 'export',
        title: 'Export Chat',
        icon: 'fas fa-download',
        description: 'Export your current conversation'
    }
};

// Initialize the popup
function initMainMenuPopup() {
    // Load all data
    loadPersonalizationData();
    loadGoalsData();
    loadSettingsData();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('Main Menu Popup initialized');
}

// Open the main menu popup
function openMainMenuPopup() {
    const modal = document.getElementById('mainmenu-modal');
    if (!modal) return;
    
    // Reset to menu view on open (especially for mobile)
    currentView = 'menu';
    currentSection = null;
    
    // Update UI classes
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Set appropriate view class
    const content = modal.querySelector('.mainmenu-content');
    if (window.innerWidth <= 768) {
        content.classList.add('menu-view');
        content.classList.remove('content-view');
    } else {
        content.classList.remove('menu-view');
        content.classList.remove('content-view');
    }
    
    // Render the menu
    renderMenu();
}

// Close the main menu popup
function closeMainMenuPopup() {
    const modal = document.getElementById('mainmenu-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset after animation
    setTimeout(() => {
        currentView = 'menu';
        currentSection = null;
    }, 300);
}

// Render the left sidebar menu
function renderMenu() {
    const menuContainer = document.querySelector('.sidebar-menu');
    if (!menuContainer) return;
    
    let menuHTML = '';
    
    // Add all menu items
    Object.values(sections).forEach(section => {
        const activeClass = currentSection === section.id ? 'active' : '';
        menuHTML += `
            <div class="menu-item ${activeClass}" onclick="openSection('${section.id}')">
                <i class="${section.icon}"></i>
                <span>${section.title}</span>
            </div>
        `;
    });
    
    // Add "Clear All Data" at the bottom
    menuHTML += `
        <div class="menu-divider" style="margin: 16px 24px; height: 1px; background: var(--popup-border);"></div>
        <div class="menu-item" onclick="showClearDataConfirm()">
            <i class="fas fa-trash-alt" style="color: #ff3b30;"></i>
            <span style="color: #ff3b30;">Clear All Data</span>
        </div>
    `;
    
    menuContainer.innerHTML = menuHTML;
}

// Open a specific section
function openSection(sectionId) {
    currentSection = sectionId;
    const section = sections[sectionId];
    
    if (!section) {
        console.error('Section not found:', sectionId);
        return;
    }
    
    // Update view state for mobile
    if (window.innerWidth <= 768) {
        currentView = 'content';
        document.querySelector('.mainmenu-content').classList.remove('menu-view');
        document.querySelector('.mainmenu-content').classList.add('content-view');
    }
    
    // Update active state in menu
    renderMenu();
    
    // Render the section content
    renderSection(sectionId);
}

// Go back to menu (mobile)
function goBackToMenu() {
    if (window.innerWidth <= 768) {
        currentView = 'menu';
        currentSection = null;
        
        const content = document.querySelector('.mainmenu-content');
        content.classList.add('menu-view');
        content.classList.remove('content-view');
        
        renderMenu();
    }
}

// Render section content
function renderSection(sectionId) {
    const panelContent = document.querySelector('.panel-content');
    const panelTitle = document.querySelector('.panel-title');
    
    if (!panelContent || !panelTitle) return;
    
    const section = sections[sectionId];
    panelTitle.textContent = section.title;
    
    switch(sectionId) {
        case 'personalization':
            renderPersonalizationSection(panelContent);
            break;
        case 'settings':
            renderSettingsSection(panelContent);
            break;
        case 'goals':
            renderGoalsSection(panelContent);
            break;
        case 'about':
            renderAboutSection(panelContent);
            break;
        case 'export':
            renderExportSection(panelContent);
            break;
        default:
            panelContent.innerHTML = `<div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <h3>Section Not Found</h3>
                <p>This section is not available.</p>
            </div>`;
    }
}

// ===== SECTION RENDER FUNCTIONS =====

// Personalization Section
function renderPersonalizationSection(container) {
    // Get current personalization data
    const persData = window.personalization || {
        userName: '',
        studyLevel: 'college',
        major: '',
        responseStyle: 'balanced',
        customInstructions: ''
    };
    
    container.innerHTML = `
        <div class="form-group">
            <label class="form-label">Preferred Name</label>
            <input type="text" class="form-input" id="mainmenu-pers-name" 
                   placeholder="What should I call you?" 
                   value="${persData.userName || ''}">
        </div>
        
        <div class="form-group">
            <label class="form-label">Proficiency Level</label>
            <select class="form-select" id="mainmenu-pers-level">
                <option value="school" ${persData.studyLevel === 'school' ? 'selected' : ''}>Foundation</option>
                <option value="highschool" ${persData.studyLevel === 'highschool' ? 'selected' : ''}>Intermediate</option>
                <option value="college" ${persData.studyLevel === 'college' ? 'selected' : ''}>Advanced Academic</option>
                <option value="researcher" ${persData.studyLevel === 'researcher' ? 'selected' : ''}>Expert / Scholar</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Interest / Major</label>
            <input type="text" class="form-input" id="mainmenu-pers-major" 
                   placeholder="e.g. Computer Science, Physics, Medicine"
                   value="${persData.major || ''}">
        </div>
        
        <div class="form-group">
            <label class="form-label">Ventora Style</label>
            <select class="form-select" id="mainmenu-pers-style">
                <option value="balanced" ${persData.responseStyle === 'balanced' ? 'selected' : ''}>Standard (Optimal)</option>
                <option value="technical" ${persData.responseStyle === 'technical' ? 'selected' : ''}>Technical & Analytical</option>
                <option value="encouraging" ${persData.responseStyle === 'encouraging' ? 'selected' : ''}>Socratic Tutor</option>
                <option value="concise" ${persData.responseStyle === 'concise' ? 'selected' : ''}>Direct & Precise</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Your Instructions</label>
            <textarea class="form-textarea" id="mainmenu-pers-custom" 
                      placeholder="What would you like Ventora to know? Any specific preferences or context...">
${persData.customInstructions || ''}</textarea>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-secondary" onclick="saveMainMenuPersonalization()">Save Changes</button>
            <button class="btn" onclick="resetPersonalization()">Reset to Default</button>
        </div>
    `;
}

// Settings Section
function renderSettingsSection(container) {
    // Get current settings
    const settings = JSON.parse(localStorage.getItem('nebula_settings')) || {
        model: 'groq:llama-3.1-8b-instant',
        temperature: 0.7,
        maxTokens: 1024
    };
    
    container.innerHTML = `
        <div class="settings-group">
            <label class="form-label">AI Model</label>
            <select class="form-select" id="mainmenu-settings-model">
                <option value="groq:general" ${settings.model === 'groq:general' ? 'selected' : ''}>MIA – General</option>
                <option value="groq:research" ${settings.model === 'groq:research' ? 'selected' : ''}>MIA – Research & Analysis</option>
                <option value="groq:study" ${settings.model === 'groq:study' ? 'selected' : ''}>MIA – Clinical Reasoning</option>
                <option value="groq:llama-3.1-8b-instant" ${settings.model === 'groq:llama-3.1-8b-instant' ? 'selected' : ''}>Llama 3.1 8B Instant</option>
                <option value="groq:mixtral-8x7b-32768" ${settings.model === 'groq:mixtral-8x7b-32768' ? 'selected' : ''}>Mixtral 8x7B (32K)</option>
            </select>
            <div class="settings-note">Choose the AI model for responses</div>
        </div>
        
        <div class="settings-group">
            <label class="form-label">Temperature: <span id="temp-value">${settings.temperature}</span></label>
            <input type="range" class="form-range" id="mainmenu-settings-temp" 
                   min="0" max="1" step="0.1" value="${settings.temperature}">
            <div class="range-labels">
                <span>Precise</span>
                <span>Balanced</span>
                <span>Creative</span>
            </div>
            <div class="settings-note">Lower values = more focused, Higher values = more creative</div>
        </div>
        
        <div class="settings-group">
            <label class="form-label">Max Tokens</label>
            <select class="form-select" id="mainmenu-settings-tokens">
                <option value="512" ${settings.maxTokens === 512 ? 'selected' : ''}>512</option>
                <option value="1024" ${settings.maxTokens === 1024 ? 'selected' : ''}>1024</option>
                <option value="2048" ${settings.maxTokens === 2048 ? 'selected' : ''}>2048</option>
                <option value="4096" ${settings.maxTokens === 4096 ? 'selected' : ''}>4096</option>
                <option value="8192" ${settings.maxTokens === 8192 ? 'selected' : ''}>8192</option>
                <option value="32768" ${settings.maxTokens === 32768 ? 'selected' : ''}>32768 (Mixtral only)</option>
            </select>
            <div class="settings-note">Maximum length of AI responses</div>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-primary" onclick="saveMainMenuSettings()">Save Settings</button>
            <button class="btn btn-secondary" onclick="resetSettings()">Reset to Default</button>
        </div>
    `;
    
    // Add event listener for temperature slider
    const tempSlider = document.getElementById('mainmenu-settings-temp');
    const tempValue = document.getElementById('temp-value');
    if (tempSlider && tempValue) {
        tempSlider.addEventListener('input', function() {
            tempValue.textContent = this.value;
        });
    }
}

// Goals Section
function renderGoalsSection(container) {
    const tasks = JSON.parse(localStorage.getItem('ventora_tasks')) || [];
    const notes = localStorage.getItem('ventora_study_notes') || '';
    
    let tasksHTML = '';
    if (tasks.length === 0) {
        tasksHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><h3>No goals yet</h3><p>Add your first study goal!</p></div>';
    } else {
        tasks.forEach((task, index) => {
            const completedClass = task.completed ? 'completed' : '';
            tasksHTML += `
                <div class="task-item">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="toggleMainMenuTask(${index})">
                    <span class="task-text ${completedClass}">${task.text}</span>
                    <button class="task-delete" onclick="deleteMainMenuTask(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }
    
    container.innerHTML = `
        <div class="add-task-container">
            <input type="text" class="add-task-input" id="mainmenu-new-task" 
                   placeholder="Add a new study goal...">
            <button class="add-task-btn" onclick="addMainMenuTask()">ADD</button>
        </div>
        
        <div class="task-list">
            ${tasksHTML}
        </div>
        
        <div class="notes-section">
            <label class="form-label">Study Notes (Auto-saves)</label>
            <textarea class="notes-textarea" id="mainmenu-study-notes" 
                      placeholder="Write down important things to remember...">${notes}</textarea>
            <div class="settings-note">Notes are automatically saved as you type</div>
        </div>
    `;
    
    // Set up auto-save for notes
    const notesArea = document.getElementById('mainmenu-study-notes');
    if (notesArea) {
        let notesTimer;
        notesArea.addEventListener('input', function() {
            clearTimeout(notesTimer);
            notesTimer = setTimeout(() => {
                localStorage.setItem('ventora_study_notes', this.value);
                showMainMenuToast('Notes saved!', 'success');
            }, 1000);
        });
    }
}

// About Section
function renderAboutSection(container) {
    container.innerHTML = `
        <div class="about-logo">VENTORA<span>AI</span></div>
        <div class="about-tagline">Medical Information Assistant</div>
        
        <div class="about-description">
            Ventora AI helps people understand medicines, diseases, nutrition, 
            and health concepts from a pharmaceutical science perspective — 
            for education and awareness, not medical instruction.
        </div>
        
        <div class="form-group">
            <label class="form-label">Version</label>
            <div class="form-input" style="background: rgba(0,122,255,0.1); border-color: rgba(0,122,255,0.3);">
                <strong>V5.4 MIA</strong> (Medical Information Assistant)
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Developer</label>
            <div class="form-input">
                Created by <strong>Maulik Makwana</strong>
            </div>
        </div>
        
        <div class="about-socials">
            <a href="#" target="_blank" aria-label="Ventora on LinkedIn">
                <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="#" target="_blank" aria-label="Ventora on Facebook">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" target="_blank" aria-label="Ventora on X">
                <i class="fab fa-x-twitter"></i>
            </a>
        </div>
        
        <div class="form-group">
            <label class="form-label">Privacy & Security</label>
            <div class="form-input" style="font-size: 0.9rem; line-height: 1.5;">
                • Conversations stay in your browser<br>
                • No external data storage<br>
                • Secure API connections only<br>
                • No personal information shared
            </div>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-secondary" onclick="openPrivacyPolicy()">Privacy Policy</button>
            <button class="btn" onclick="openTerms()">Terms of Use</button>
        </div>
    `;
}

// Export Section
function renderExportSection(container) {
    const conversation = getCurrentConversation();
    const hasConversation = conversation && conversation.messages.length > 0;
    
    if (!hasConversation) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment-slash"></i>
                <h3>No Conversation</h3>
                <p>Start a chat to export it.</p>
            </div>
        `;
        return;
    }
    
    const messageCount = conversation.messages.length;
    const userMessages = conversation.messages.filter(m => m.role === 'user').length;
    const aiMessages = conversation.messages.filter(m => m.role === 'assistant').length;
    
    container.innerHTML = `
        <div class="form-group">
            <label class="form-label">Current Conversation</label>
            <div class="form-input" style="background: rgba(255,255,255,0.03);">
                <strong>${conversation.title}</strong><br>
                <small>Last updated: ${new Date(conversation.updatedAt).toLocaleString()}</small>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Statistics</label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                <div style="text-align: center; padding: 16px; background: rgba(0,122,255,0.1); border-radius: 10px;">
                    <div style="font-size: 1.5rem; font-weight: bold;">${messageCount}</div>
                    <div style="font-size: 0.8rem;">Total Messages</div>
                </div>
                <div style="text-align: center; padding: 16px; background: rgba(52,199,89,0.1); border-radius: 10px;">
                    <div style="font-size: 1.5rem; font-weight: bold;">${userMessages}</div>
                    <div style="font-size: 0.8rem;">Your Messages</div>
                </div>
                <div style="text-align: center; padding: 16px; background: rgba(88,86,214,0.1); border-radius: 10px;">
                    <div style="font-size: 1.5rem; font-weight: bold;">${aiMessages}</div>
                    <div style="font-size: 0.8rem;">AI Responses</div>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Export Format</label>
            <select class="form-select" id="export-format">
                <option value="txt">Text File (.txt)</option>
                <option value="json">JSON (.json)</option>
                <option value="html">HTML (.html)</option>
                <option value="markdown">Markdown (.md)</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Include</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="include-timestamps" checked>
                    <span>Timestamps</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="include-metadata" checked>
                    <span>Metadata (title, date)</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="include-formatting" checked>
                    <span>Basic formatting</span>
                </label>
            </div>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-primary" onclick="exportMainMenuChat()">Export Now</button>
            <button class="btn" onclick="previewExport()">Preview</button>
        </div>
        
        <div class="settings-note" style="margin-top: 20px;">
            <i class="fas fa-info-circle"></i> Exported files contain only your conversation data.
            No personal information is included.
        </div>
    `;
}

// ===== DATA MANAGEMENT FUNCTIONS =====

// Load all data
function loadPersonalizationData() {
    if (!window.personalization) {
        window.personalization = JSON.parse(localStorage.getItem('nebula_pers')) || {
            userName: '',
            studyLevel: 'college',
            major: '',
            responseStyle: 'balanced',
            customInstructions: ''
        };
    }
}

function loadGoalsData() {
    if (!window.ventoraTasks) {
        window.ventoraTasks = JSON.parse(localStorage.getItem('ventora_tasks')) || [];
    }
    if (!window.ventoraNotes) {
        window.ventoraNotes = localStorage.getItem('ventora_study_notes') || '';
    }
}

function loadSettingsData() {
    if (!window.nebulaSettings) {
        window.nebulaSettings = JSON.parse(localStorage.getItem('nebula_settings')) || {
            model: 'groq:llama-3.1-8b-instant',
            temperature: 0.7,
            maxTokens: 1024
        };
    }
}

// Save personalization from main menu
function saveMainMenuPersonalization() {
    const persData = {
        userName: document.getElementById('mainmenu-pers-name')?.value.trim() || '',
        studyLevel: document.getElementById('mainmenu-pers-level')?.value || 'college',
        major: document.getElementById('mainmenu-pers-major')?.value.trim() || '',
        responseStyle: document.getElementById('mainmenu-pers-style')?.value || 'balanced',
        customInstructions: document.getElementById('mainmenu-pers-custom')?.value.trim() || ''
    };
    
    window.personalization = persData;
    localStorage.setItem('nebula_pers', JSON.stringify(persData));
    
    showMainMenuToast('Personalization saved!', 'success');
}

// Save settings from main menu
function saveMainMenuSettings() {
    const settings = {
        model: document.getElementById('mainmenu-settings-model')?.value || 'groq:llama-3.1-8b-instant',
        temperature: parseFloat(document.getElementById('mainmenu-settings-temp')?.value || 0.7),
        maxTokens: parseInt(document.getElementById('mainmenu-settings-tokens')?.value || 1024)
    };
    
    window.nebulaSettings = settings;
    localStorage.setItem('nebula_settings', JSON.stringify(settings));
    
    showMainMenuToast('Settings saved!', 'success');
}

// Goals management
function addMainMenuTask() {
    const input = document.getElementById('mainmenu-new-task');
    if (!input || !input.value.trim()) return;
    
    const tasks = JSON.parse(localStorage.getItem('ventora_tasks')) || [];
    tasks.push({ text: input.value, completed: false });
    localStorage.setItem('ventora_tasks', JSON.stringify(tasks));
    
    input.value = '';
    renderGoalsSection(document.querySelector('.panel-content'));
    showMainMenuToast('Task added!', 'success');
}

function toggleMainMenuTask(index) {
    const tasks = JSON.parse(localStorage.getItem('ventora_tasks')) || [];
    if (index >= 0 && index < tasks.length) {
        tasks[index].completed = !tasks[index].completed;
        localStorage.setItem('ventora_tasks', JSON.stringify(tasks));
        renderGoalsSection(document.querySelector('.panel-content'));
    }
}

function deleteMainMenuTask(index) {
    const tasks = JSON.parse(localStorage.getItem('ventora_tasks')) || [];
    if (index >= 0 && index < tasks.length) {
        tasks.splice(index, 1);
        localStorage.setItem('ventora_tasks', JSON.stringify(tasks));
        renderGoalsSection(document.querySelector('.panel-content'));
        showMainMenuToast('Task deleted', 'info');
    }
}

// Export chat
function exportMainMenuChat() {
    const conversation = getCurrentConversation();
    if (!conversation || conversation.messages.length === 0) {
        showMainMenuToast('No conversation to export', 'error');
        return;
    }
    
    const format = document.getElementById('export-format')?.value || 'txt';
    const includeTimestamps = document.getElementById('include-timestamps')?.checked !== false;
    const includeMetadata = document.getElementById('include-metadata')?.checked !== false;
    const includeFormatting = document.getElementById('include-formatting')?.checked !== false;
    
    let content = '';
    let filename = `ventora-chat-${conversation.id}`;
    let mimeType = 'text/plain';
    
    switch(format) {
        case 'txt':
            content = exportAsText(conversation, includeTimestamps, includeMetadata, includeFormatting);
            filename += '.txt';
            break;
        case 'json':
            content = exportAsJSON(conversation);
            filename += '.json';
            mimeType = 'application/json';
            break;
        case 'html':
            content = exportAsHTML(conversation, includeTimestamps, includeMetadata);
            filename += '.html';
            mimeType = 'text/html';
            break;
        case 'markdown':
            content = exportAsMarkdown(conversation, includeTimestamps, includeMetadata);
            filename += '.md';
            break;
    }
    
    // Download the file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMainMenuToast('Chat exported!', 'success');
}

// Export helper functions
function exportAsText(conversation, includeTimestamps, includeMetadata, includeFormatting) {
    let text = '';
    
    if (includeMetadata) {
        text += `=== Ventora AI Conversation ===\n\n`;
        text += `Title: ${conversation.title}\n`;
        text += `Date: ${new Date(conversation.updatedAt).toLocaleString()}\n`;
        text += `Model: ${window.nebulaSettings?.model || 'Unknown'}\n`;
        text += `\n`;
    }
    
    conversation.messages.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'Ventora AI';
        const time = includeTimestamps ? `[${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ` : '';
        
        text += `${time}${role}:\n`;
        
        if (includeFormatting && msg.role === 'assistant') {
            // Remove HTML tags for text export
            const plainText = msg.content.replace(/<[^>]*>/g, '');
            text += `${plainText}\n\n`;
        } else {
            text += `${msg.content}\n\n`;
        }
    });
    
    if (includeMetadata) {
        text += '\n=== End of Conversation ===\n';
        text += 'Exported from Ventora AI\n';
    }
    
    return text;
}

function exportAsJSON(conversation) {
    const exportData = {
        metadata: {
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            exportDate: new Date().toISOString(),
            model: window.nebulaSettings?.model,
            version: 'V5.4 MIA'
        },
        messages: conversation.messages
    };
    
    return JSON.stringify(exportData, null, 2);
}

function exportAsHTML(conversation, includeTimestamps, includeMetadata) {
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${conversation.title} - Ventora AI</title>
    <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { border-bottom: 2px solid #007aff; padding-bottom: 20px; margin-bottom: 30px; }
        .message { margin-bottom: 25px; padding: 15px; border-radius: 10px; }
        .user { background: #f0f7ff; border-left: 4px solid #007aff; }
        .ai { background: #f8f9fa; border-left: 4px solid #34c759; }
        .timestamp { font-size: 0.8rem; color: #666; margin-top: 5px; }
        .role { font-weight: bold; margin-bottom: 5px; }
        pre { background: #1a1a1a; color: #fff; padding: 15px; border-radius: 8px; overflow-x: auto; }
        code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>`;
    
    if (includeMetadata) {
        html += `
    <div class="header">
        <h1>${conversation.title}</h1>
        <p><strong>Date:</strong> ${new Date(conversation.updatedAt).toLocaleString()}</p>
        <p><strong>Model:</strong> ${window.nebulaSettings?.model || 'Unknown'}</p>
        <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>
    </div>`;
    }
    
    conversation.messages.forEach(msg => {
        const roleClass = msg.role === 'user' ? 'user' : 'ai';
        const roleName = msg.role === 'user' ? 'You' : 'Ventora AI';
        const time = includeTimestamps ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        
        html += `
    <div class="message ${roleClass}">
        <div class="role">${roleName}</div>
        <div class="content">${msg.content.replace(/\n/g, '<br>')}</div>`;
        
        if (time) {
            html += `<div class="timestamp">${time}</div>`;
        }
        
        html += `</div>`;
    });
    
    html += `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 0.9rem;">
        Exported from Ventora AI • Created by Maulik Makwana
    </div>
</body>
</html>`;
    
    return html;
}

function exportAsMarkdown(conversation, includeTimestamps, includeMetadata) {
    let md = '';
    
    if (includeMetadata) {
        md += `# ${conversation.title}\n\n`;
        md += `**Date:** ${new Date(conversation.updatedAt).toLocaleString()}\n`;
        md += `**Model:** ${window.nebulaSettings?.model || 'Unknown'}\n`;
        md += `**Export Date:** ${new Date().toLocaleString()}\n\n`;
        md += `---\n\n`;
    }
    
    conversation.messages.forEach(msg => {
        const role = msg.role === 'user' ? '**You**' : '**Ventora AI**';
        const time = includeTimestamps ? `*${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}* ` : '';
        
        md += `${time}${role}\n\n`;
        md += `${msg.content}\n\n`;
        md += `---\n\n`;
    });
    
    md += `*Exported from Ventora AI*`;
    
    return md;
}

// Clear all data confirmation
function showClearDataConfirm() {
    if (confirm('Are you sure? This will delete ALL chat history, settings, goals, and personalization. This action cannot be undone.')) {
        clearAllData();
    }
}

function clearAllData() {
    // Clear all localStorage items
    localStorage.removeItem('nebula_conversations');
    localStorage.removeItem('nebula_settings');
    localStorage.removeItem('nebula_pers');
    localStorage.removeItem('ventora_tasks');
    localStorage.removeItem('ventora_study_notes');
    
    // Reset global variables
    window.personalization = {
        userName: '',
        studyLevel: 'college',
        major: '',
        responseStyle: 'balanced',
        customInstructions: ''
    };
    
    window.nebulaSettings = {
        model: 'groq:llama-3.1-8b-instant',
        temperature: 0.7,
        maxTokens: 1024
    };
    
    window.ventoraTasks = [];
    window.ventoraNotes = '';
    
    // Refresh the current view if we're in the popup
    if (currentSection) {
        renderSection(currentSection);
    }
    
    showMainMenuToast('All data cleared', 'success');
    
    // If we have a chat interface, refresh it too
    if (typeof createNewConversation === 'function') {
        createNewConversation();
    }
}

// Reset functions
function resetPersonalization() {
    if (confirm('Reset personalization to default values?')) {
        window.personalization = {
            userName: '',
            studyLevel: 'college',
            major: '',
            responseStyle: 'balanced',
            customInstructions: ''
        };
        
        localStorage.setItem('nebula_pers', JSON.stringify(window.personalization));
        renderPersonalizationSection(document.querySelector('.panel-content'));
        showMainMenuToast('Personalization reset', 'info');
    }
}

function resetSettings() {
    if (confirm('Reset settings to default values?')) {
        window.nebulaSettings = {
            model: 'groq:llama-3.1-8b-instant',
            temperature: 0.7,
            maxTokens: 1024
        };
        
        localStorage.setItem('nebula_settings', JSON.stringify(window.nebulaSettings));
        renderSettingsSection(document.querySelector('.panel-content'));
        showMainMenuToast('Settings reset', 'info');
    }
}

// Helper function to get current conversation
function getCurrentConversation() {
    if (typeof window.getCurrentConversation === 'function') {
        return window.getCurrentConversation();
    }
    
    // Fallback: try to get from localStorage
    const conversations = JSON.parse(localStorage.getItem('nebula_conversations')) || [];
    const currentId = localStorage.getItem('current_conversation_id');
    
    if (currentId) {
        return conversations.find(c => c.id === currentId);
    }
    
    return conversations[0] || null;
}

// Toast notification
function showMainMenuToast(message, type = 'info') {
    // Use existing toast if available
    if (typeof showToast === 'function') {
        showToast(message, type);
        return;
    }
    
    // Create a temporary toast
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#ff3b30' : type === 'success' ? '#34c759' : '#007aff'};
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        font-size: 0.9rem;
        z-index: 10000;
        animation: toastFade 3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// Privacy and Terms (placeholder functions)
function openPrivacyPolicy() {
    alert('Privacy Policy:\n\nVentora AI does not store conversations on external servers. Your data stays in your browser and is processed securely. No personal information is sold or shared.');
}

function openTerms() {
    alert('Terms of Use:\n\nVentora AI is for educational purposes only. It does not provide medical advice. Always consult healthcare professionals for medical decisions.');
}

function previewExport() {
    showMainMenuToast('Preview feature coming soon!', 'info');
}

// Set up event listeners
function setupEventListeners() {
    // Close button
    const closeBtn = document.querySelector('.panel-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMainMenuPopup);
    }
    
    // Back button for mobile
    const backBtn = document.querySelector('.panel-back');
    if (backBtn) {
        backBtn.addEventListener('click', goBackToMenu);
    }
    
    // Close on background click
    const modal = document.getElementById('mainmenu-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeMainMenuPopup();
            }
        });
    }
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeMainMenuPopup();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && currentView === 'content') {
            // On desktop, we're always in two-panel view
            const content = document.querySelector('.mainmenu-content');
            content?.classList.remove('menu-view', 'content-view');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if the popup HTML exists
    if (document.getElementById('mainmenu-modal')) {
        initMainMenuPopup();
    }
});

// Export functions for use in other files
window.openMainMenuPopup = openMainMenuPopup;
window.closeMainMenuPopup = closeMainMenuPopup;
window.openSection = openSection;
