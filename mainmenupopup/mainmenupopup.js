// Main Menu Popup - DeepSeek Style

// Global state
let currentSection = null;
let sections = {
    'goals': {
        title: 'Your Goals',
        icon: 'fas fa-check-circle',
        render: renderGoalsSection
    },
    'personalization': {
        title: 'Personalization',
        icon: 'fas fa-user-circle',
        render: renderPersonalizationSection
    },
    'settings': {
        title: 'Settings',
        icon: 'fas fa-cog',
        render: renderSettingsSection
    },
    'about': {
        title: 'About',
        icon: 'fas fa-info-circle',
        render: renderAboutSection
    },
    'export': {
        title: 'Export Chat',
        icon: 'fas fa-download',
        render: renderExportSection
    }
};

// Initialize popup
function initMainMenuPopup() {
    loadAllData();
    setupEventListeners();
}

// Open the main menu popup
function openMainMenuPopup() {
    const modal = document.getElementById('mainmenu-modal');
    const container = document.querySelector('.mainmenu-container');
    
    if (!modal || !container) return;
    
    // Close sidebar menu if open
    if (typeof closeMenu === 'function') closeMenu();
    
    // Reset to menu view on mobile
    if (window.innerWidth <= 768) {
        container.classList.add('menu-view');
        container.classList.remove('content-view');
        currentSection = null;
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Render menu
    renderMenu();
}

// Close the popup
function closeMainMenuPopup() {
    const modal = document.getElementById('mainmenu-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Go back to menu (mobile)
function goBackToMenu() {
    if (window.innerWidth <= 768) {
        const container = document.querySelector('.mainmenu-container');
        container.classList.add('menu-view');
        container.classList.remove('content-view');
        currentSection = null;
    }
}

// Open a section
function openSection(sectionId) {
    const section = sections[sectionId];
    if (!section) return;
    
    currentSection = sectionId;
    
    // Update UI based on device
    if (window.innerWidth <= 768) {
        const container = document.querySelector('.mainmenu-container');
        container.classList.remove('menu-view');
        container.classList.add('content-view');
    }
    
    // Update active menu item
    renderMenu();
    
    // Render the section
    renderSection(sectionId);
}

// Render the sidebar menu
function renderMenu() {
    const menuContainer = document.querySelector('.sidebar-menu');
    if (!menuContainer) return;
    
    // User info
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const userName = localStorage.getItem('userName') || 'User';
    
    // Menu HTML
    menuContainer.innerHTML = `
        <div class="menu-section">
            <h4 class="section-title">Preferences</h4>
            ${renderMenuItem('goals', 'Your Goals', 'fas fa-check-circle')}
            ${renderMenuItem('personalization', 'Personalization', 'fas fa-user-circle')}
            ${renderMenuItem('settings', 'Settings', 'fas fa-cog')}
        </div>
        
        <div class="menu-section">
            <h4 class="section-title">Data</h4>
            ${renderMenuItem('export', 'Export Chat', 'fas fa-download')}
            <div class="menu-item" onclick="showClearDataConfirm()">
                <i class="fas fa-trash-alt"></i>
                <span>Clear All Data</span>
            </div>
        </div>
        
        <div class="menu-section">
            <h4 class="section-title">About</h4>
            ${renderMenuItem('about', 'About Ventora', 'fas fa-info-circle')}
            <div class="menu-item">
                <i class="fas fa-shield-alt"></i>
                <span>Privacy & Security</span>
            </div>
        </div>
    `;
    
    // Update user info
    const userAvatar = document.querySelector('.user-avatar');
    const userNameEl = document.querySelector('.user-name');
    const userEmailEl = document.querySelector('.user-email');
    
    if (userAvatar) userAvatar.textContent = userName.charAt(0).toUpperCase();
    if (userNameEl) userNameEl.textContent = userName;
    if (userEmailEl) userEmailEl.textContent = userEmail;
}

// Helper to render menu item
function renderMenuItem(id, title, icon) {
    const activeClass = currentSection === id ? 'active' : '';
    return `
        <div class="menu-item ${activeClass}" onclick="openSection('${id}')">
            <i class="${icon}"></i>
            <span>${title}</span>
        </div>
    `;
}

// Render a section
function renderSection(sectionId) {
    const section = sections[sectionId];
    if (!section) return;
    
    const contentTitle = document.querySelector('.content-title');
    const contentBody = document.querySelector('.content-body');
    
    if (contentTitle) contentTitle.textContent = section.title;
    if (contentBody) section.render(contentBody);
}

// Load all data
function loadAllData() {
    // Personalization
    if (!window.personalization) {
        window.personalization = JSON.parse(localStorage.getItem('nebula_pers')) || {
            userName: '',
            studyLevel: 'college',
            major: '',
            responseStyle: 'balanced',
            customInstructions: ''
        };
    }
    
    // App Settings
    if (!window.nebulaSettings) {
        window.nebulaSettings = JSON.parse(localStorage.getItem('nebula_settings')) || {
            model: 'groq:general',
            temperature: 0.7,
            maxTokens: 1024
        };
    }
    
    // Goals/Tasks
    if (!window.ventoraTasks) {
        window.ventoraTasks = JSON.parse(localStorage.getItem('ventora_tasks')) || [];
    }
    
    // Study Notes
    if (!window.ventoraNotes) {
        window.ventoraNotes = localStorage.getItem('ventora_study_notes') || '';
    }
}

// ===== SECTION RENDER FUNCTIONS =====

// Personalization Section
function renderPersonalizationSection(container) {
    container.innerHTML = `
        <div class="form-group">
            <label class="form-label">Your Name</label>
            <input type="text" class="form-input" id="menu-pers-name" 
                   placeholder="What should I call you?" 
                   value="${window.personalization.userName || ''}">
        </div>
        
        <div class="form-group">
            <label class="form-label">Proficiency Level</label>
            <select class="form-select" id="menu-pers-level">
                <option value="school" ${window.personalization.studyLevel === 'school' ? 'selected' : ''}>Foundation</option>
                <option value="highschool" ${window.personalization.studyLevel === 'highschool' ? 'selected' : ''}>Intermediate</option>
                <option value="college" ${window.personalization.studyLevel === 'college' ? 'selected' : ''}>Advanced Academic</option>
                <option value="researcher" ${window.personalization.studyLevel === 'researcher' ? 'selected' : ''}>Expert / Scholar</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Interest / Major</label>
            <input type="text" class="form-input" id="menu-pers-major" 
                   placeholder="e.g. Medicine, Computer Science"
                   value="${window.personalization.major || ''}">
        </div>
        
        <div class="form-group">
            <label class="form-label">Response Style</label>
            <select class="form-select" id="menu-pers-style">
                <option value="balanced" ${window.personalization.responseStyle === 'balanced' ? 'selected' : ''}>Standard (Optimal)</option>
                <option value="technical" ${window.personalization.responseStyle === 'technical' ? 'selected' : ''}>Technical & Analytical</option>
                <option value="encouraging" ${window.personalization.responseStyle === 'encouraging' ? 'selected' : ''}>Socratic Tutor</option>
                <option value="concise" ${window.personalization.responseStyle === 'concise' ? 'selected' : ''}>Direct & Precise</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Custom Instructions</label>
            <textarea class="form-textarea" id="menu-pers-custom" 
                      placeholder="What would you like Ventora to know? Any specific preferences...">
${window.personalization.customInstructions || ''}</textarea>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-primary" onclick="saveMenuPersonalization()">Save Changes</button>
            <button class="btn btn-secondary" onclick="resetMenuPersonalization()">Reset to Default</button>
        </div>
    `;
}

// Settings Section
function renderSettingsSection(container) {
    container.innerHTML = `
        <div class="form-group">
            <label class="form-label">AI Model</label>
            <select class="form-select" id="menu-settings-model">
                <option value="groq:general" ${window.nebulaSettings.model === 'groq:general' ? 'selected' : ''}>MIA – General</option>
                <option value="groq:research" ${window.nebulaSettings.model === 'groq:research' ? 'selected' : ''}>MIA – Research & Analysis</option>
                <option value="groq:study" ${window.nebulaSettings.model === 'groq:study' ? 'selected' : ''}>MIA – Clinical Reasoning</option>
            </select>
            <div class="form-info">Choose the AI model for responses</div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Temperature: <span id="temp-value">${window.nebulaSettings.temperature}</span></label>
            <input type="range" class="form-range" id="menu-settings-temp" 
                   min="0" max="1" step="0.1" value="${window.nebulaSettings.temperature}">
            <div class="range-labels">
                <span>Precise</span>
                <span>Balanced</span>
                <span>Creative</span>
            </div>
            <div class="form-info">Lower values = more focused, Higher values = more creative</div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Max Tokens</label>
            <select class="form-select" id="menu-settings-tokens">
                <option value="512" ${window.nebulaSettings.maxTokens === 512 ? 'selected' : ''}>512</option>
                <option value="1024" ${window.nebulaSettings.maxTokens === 1024 ? 'selected' : ''}>1024</option>
                <option value="2048" ${window.nebulaSettings.maxTokens === 2048 ? 'selected' : ''}>2048</option>
                <option value="4096" ${window.nebulaSettings.maxTokens === 4096 ? 'selected' : ''}>4096</option>
                <option value="8192" ${window.nebulaSettings.maxTokens === 8192 ? 'selected' : ''}>8192</option>
            </select>
            <div class="form-info">Maximum length of AI responses</div>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-primary" onclick="saveMenuSettings()">Save Settings</button>
            <button class="btn btn-secondary" onclick="resetMenuSettings()">Reset to Default</button>
        </div>
    `;
    
    // Add event listener for temperature slider
    const tempSlider = document.getElementById('menu-settings-temp');
    const tempValue = document.getElementById('temp-value');
    if (tempSlider && tempValue) {
        tempSlider.addEventListener('input', function() {
            tempValue.textContent = this.value;
        });
    }
}

// Goals Section
function renderGoalsSection(container) {
    // Get tasks HTML
    let tasksHTML = '';
    if (window.ventoraTasks.length === 0) {
        tasksHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><h4>No goals yet</h4><p>Add your first study goal!</p></div>';
    } else {
        window.ventoraTasks.forEach((task, index) => {
            const completedClass = task.completed ? 'completed' : '';
            tasksHTML += `
                <div class="task-item">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="toggleMenuTask(${index})">
                    <span class="task-text ${completedClass}">${task.text}</span>
                    <button class="task-delete" onclick="deleteMenuTask(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }
    
    container.innerHTML = `
        <div class="task-container">
            <input type="text" class="task-input" id="menu-new-task" 
                   placeholder="Add a new study goal...">
            <button class="task-add-btn" onclick="addMenuTask()">Add</button>
        </div>
        
        <div class="task-list">
            ${tasksHTML}
        </div>
        
        <div class="form-group" style="margin-top: 30px;">
            <label class="form-label">Study Notes (Auto-saves)</label>
            <textarea class="form-textarea" id="menu-study-notes" 
                      placeholder="Write down important things to remember...">${window.ventoraNotes}</textarea>
            <div class="form-info">Notes are automatically saved as you type</div>
        </div>
    `;
    
    // Set up auto-save for notes
    const notesArea = document.getElementById('menu-study-notes');
    if (notesArea) {
        let notesTimer;
        notesArea.addEventListener('input', function() {
            clearTimeout(notesTimer);
            notesTimer = setTimeout(() => {
                localStorage.setItem('ventora_study_notes', this.value);
                window.ventoraNotes = this.value;
                showMenuToast('Notes saved!');
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
            <div class="form-input" style="background: rgba(0,122,255,0.1); border-color: rgba(0,122,255,0.3); font-weight: 500;">
                <strong>V5.4 MIA</strong> (Medical Information Assistant)
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Developer</label>
            <div class="form-input" style="font-weight: 500;">
                Created by <strong>Maulik Makwana</strong>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Privacy & Security</label>
            <div class="form-textarea" style="font-size: 0.9rem; line-height: 1.6; background: rgba(255,255,255,0.03);">
                • Conversations stay in your browser<br>
                • No external data storage<br>
                • Secure API connections only<br>
                • No personal information shared
            </div>
        </div>
        
        <div class="social-links">
            <a href="#" class="social-link" target="_blank" aria-label="LinkedIn">
                <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="#" class="social-link" target="_blank" aria-label="Facebook">
                <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="social-link" target="_blank" aria-label="X">
                <i class="fab fa-x-twitter"></i>
            </a>
        </div>
    `;
}

// Export Section
function renderExportSection(container) {
    const conversation = getCurrentConversation();
    const hasConversation = conversation && conversation.messages.length > 0;
    const messageCount = hasConversation ? conversation.messages.length : 0;
    const userMessages = hasConversation ? conversation.messages.filter(m => m.role === 'user').length : 0;
    const aiMessages = hasConversation ? conversation.messages.filter(m => m.role === 'assistant').length : 0;
    
    if (!hasConversation) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment-slash"></i>
                <h4>No Conversation</h4>
                <p>Start a chat to export it.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="form-group">
            <label class="form-label">Current Conversation</label>
            <div class="form-input" style="background: rgba(255,255,255,0.03);">
                <strong>${conversation.title}</strong><br>
                <small>Last updated: ${new Date(conversation.updatedAt).toLocaleString()}</small>
            </div>
        </div>
        
        <div class="export-stats">
            <div class="stat-box">
                <div class="stat-value">${messageCount}</div>
                <div class="stat-label">Total Messages</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${userMessages}</div>
                <div class="stat-label">Your Messages</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${aiMessages}</div>
                <div class="stat-label">AI Responses</div>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Export Format</label>
            <select class="form-select" id="menu-export-format">
                <option value="txt">Text File (.txt)</option>
                <option value="json">JSON (.json)</option>
                <option value="html">HTML (.html)</option>
                <option value="markdown">Markdown (.md)</option>
            </select>
        </div>
        
        <div class="form-group">
            <label class="form-label">Include</label>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="menu-include-timestamps" checked>
                    <span>Timestamps</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="menu-include-metadata" checked>
                    <span>Metadata (title, date)</span>
                </label>
            </div>
        </div>
        
        <div class="btn-group">
            <button class="btn btn-primary" onclick="exportMenuChat()">Export Now</button>
            <button class="btn btn-secondary" onclick="previewMenuExport()">Preview</button>
        </div>
        
        <div class="form-info" style="margin-top: 20px;">
            <i class="fas fa-info-circle"></i> Exported files contain only your conversation data.
        </div>
    `;
}

// ===== DATA MANAGEMENT FUNCTIONS =====

// Save personalization
function saveMenuPersonalization() {
    window.personalization = {
        userName: document.getElementById('menu-pers-name')?.value.trim() || '',
        studyLevel: document.getElementById('menu-pers-level')?.value || 'college',
        major: document.getElementById('menu-pers-major')?.value.trim() || '',
        responseStyle: document.getElementById('menu-pers-style')?.value || 'balanced',
        customInstructions: document.getElementById('menu-pers-custom')?.value.trim() || ''
    };
    
    localStorage.setItem('nebula_pers', JSON.stringify(window.personalization));
    showMenuToast('Personalization saved!');
}

// Reset personalization
function resetMenuPersonalization() {
    if (confirm('Reset personalization to default values?')) {
        window.personalization = {
            userName: '',
            studyLevel: 'college',
            major: '',
            responseStyle: 'balanced',
            customInstructions: ''
        };
        
        localStorage.setItem('nebula_pers', JSON.stringify(window.personalization));
        renderPersonalizationSection(document.querySelector('.content-body'));
        showMenuToast('Personalization reset');
    }
}

// Save settings
function saveMenuSettings() {
    window.nebulaSettings = {
        model: document.getElementById('menu-settings-model')?.value || 'groq:general',
        temperature: parseFloat(document.getElementById('menu-settings-temp')?.value || 0.7),
        maxTokens: parseInt(document.getElementById('menu-settings-tokens')?.value || 1024)
    };
    
    localStorage.setItem('nebula_settings', JSON.stringify(window.nebulaSettings));
    showMenuToast('Settings saved!');
}

// Reset settings
function resetMenuSettings() {
    if (confirm('Reset settings to default values?')) {
        window.nebulaSettings = {
            model: 'groq:general',
            temperature: 0.7,
            maxTokens: 1024
        };
        
        localStorage.setItem('nebula_settings', JSON.stringify(window.nebulaSettings));
        renderSettingsSection(document.querySelector('.content-body'));
        showMenuToast('Settings reset');
    }
}

// Tasks management
function addMenuTask() {
    const input = document.getElementById('menu-new-task');
    if (!input || !input.value.trim()) return;
    
    window.ventoraTasks.push({ text: input.value, completed: false });
    localStorage.setItem('ventora_tasks', JSON.stringify(window.ventoraTasks));
    
    input.value = '';
    renderGoalsSection(document.querySelector('.content-body'));
    showMenuToast('Task added!');
}

function toggleMenuTask(index) {
    if (index >= 0 && index < window.ventoraTasks.length) {
        window.ventoraTasks[index].completed = !window.ventoraTasks[index].completed;
        localStorage.setItem('ventora_tasks', JSON.stringify(window.ventoraTasks));
        renderGoalsSection(document.querySelector('.content-body'));
    }
}

function deleteMenuTask(index) {
    if (index >= 0 && index < window.ventoraTasks.length) {
        window.ventoraTasks.splice(index, 1);
        localStorage.setItem('ventora_tasks', JSON.stringify(window.ventoraTasks));
        renderGoalsSection(document.querySelector('.content-body'));
        showMenuToast('Task deleted');
    }
}

// Export chat
function exportMenuChat() {
    const conversation = getCurrentConversation();
    if (!conversation || conversation.messages.length === 0) {
        showMenuToast('No conversation to export');
        return;
    }
    
    const format = document.getElementById('menu-export-format')?.value || 'txt';
    const includeTimestamps = document.getElementById('menu-include-timestamps')?.checked !== false;
    const includeMetadata = document.getElementById('menu-include-metadata')?.checked !== false;
    
    let content = '';
    let filename = `ventora-chat-${conversation.id}`;
    let mimeType = 'text/plain';
    
    switch(format) {
        case 'txt':
            content = exportConversationAsText(conversation, includeTimestamps, includeMetadata);
            filename += '.txt';
            break;
        case 'json':
            content = exportConversationAsJSON(conversation);
            filename += '.json';
            mimeType = 'application/json';
            break;
        case 'html':
            content = exportConversationAsHTML(conversation, includeTimestamps, includeMetadata);
            filename += '.html';
            mimeType = 'text/html';
            break;
        case 'markdown':
            content = exportConversationAsMarkdown(conversation, includeTimestamps, includeMetadata);
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
    
    showMenuToast('Chat exported!');
}

// Export helper functions
function exportConversationAsText(conversation, includeTimestamps, includeMetadata) {
    let text = '';
    
    if (includeMetadata) {
        text += `=== Ventora AI Conversation ===\n\n`;
        text += `Title: ${conversation.title}\n`;
        text += `Date: ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
    }
    
    conversation.messages.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'Ventora AI';
        const time = includeTimestamps ? `[${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ` : '';
        text += `${time}${role}:\n${msg.content}\n\n`;
    });
    
    if (includeMetadata) {
        text += '\n=== End of Conversation ===\n';
    }
    
    return text;
}

function exportConversationAsJSON(conversation) {
    const exportData = {
        metadata: {
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            exportDate: new Date().toISOString(),
            model: window.nebulaSettings?.model
        },
        messages: conversation.messages
    };
    
    return JSON.stringify(exportData, null, 2);
}

function exportConversationAsHTML(conversation, includeTimestamps, includeMetadata) {
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${conversation.title}</title>
    <style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:20px;line-height:1.6}
    .message{margin-bottom:20px;padding:15px;border-radius:8px}.user{background:#f0f7ff}
    .ai{background:#f8f9fa}.timestamp{font-size:0.8rem;color:#666}</style></head><body>`;
    
    if (includeMetadata) {
        html += `<h1>${conversation.title}</h1><p><small>${new Date(conversation.updatedAt).toLocaleString()}</small></p><hr>`;
    }
    
    conversation.messages.forEach(msg => {
        const roleClass = msg.role === 'user' ? 'user' : 'ai';
        const roleName = msg.role === 'user' ? 'You' : 'Ventora AI';
        const time = includeTimestamps ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        
        html += `<div class="message ${roleClass}"><strong>${roleName}</strong><br>${msg.content.replace(/\n/g, '<br>')}`;
        if (time) html += `<div class="timestamp">${time}</div>`;
        html += `</div>`;
    });
    
    html += `</body></html>`;
    return html;
}

function exportConversationAsMarkdown(conversation, includeTimestamps, includeMetadata) {
    let md = '';
    
    if (includeMetadata) {
        md += `# ${conversation.title}\n\n`;
        md += `**Date:** ${new Date(conversation.updatedAt).toLocaleString()}\n\n`;
        md += `---\n\n`;
    }
    
    conversation.messages.forEach(msg => {
        const role = msg.role === 'user' ? '**You**' : '**Ventora AI**';
        const time = includeTimestamps ? `*${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}* ` : '';
        md += `${time}${role}\n\n${msg.content}\n\n---\n\n`;
    });
    
    return md;
}

// Clear all data
function showClearDataConfirm() {
    if (confirm('Are you sure? This will delete ALL chat history, settings, goals, and personalization.')) {
        clearAllMenuData();
    }
}

function clearAllMenuData() {
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
        model: 'groq:general',
        temperature: 0.7,
        maxTokens: 1024
    };
    
    window.ventoraTasks = [];
    window.ventoraNotes = '';
    
    showMenuToast('All data cleared');
    
    // If on a section, refresh it
    if (currentSection) {
        renderSection(currentSection);
    }
    
    // Refresh chat if function exists
    if (typeof createNewConversation === 'function') {
        createNewConversation();
    }
}

// Helper to get current conversation
function getCurrentConversation() {
    if (typeof window.getCurrentConversation === 'function') {
        return window.getCurrentConversation();
    }
    
    const conversations = JSON.parse(localStorage.getItem('nebula_conversations')) || [];
    const currentId = localStorage.getItem('current_conversation_id');
    
    if (currentId) {
        return conversations.find(c => c.id === currentId);
    }
    
    return conversations[0] || null;
}

// Toast notification
function showMenuToast(message) {
    if (typeof showToast === 'function') {
        showToast(message);
        return;
    }
    
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 122, 255, 0.9);
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

// Preview export (placeholder)
function previewMenuExport() {
    showMenuToast('Preview feature coming soon!');
}

// Setup event listeners
function setupEventListeners() {
    // Close button
    const closeBtn = document.querySelector('.content-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMainMenuPopup);
    }
    
    // Back button for mobile
    const backBtn = document.querySelector('.content-back');
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
        if (window.innerWidth > 768 && currentSection) {
            // On desktop, just update the menu highlights
            renderMenu();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initMainMenuPopup);

function logoutUser() {
    if (confirm('Log out from Ventora AI?')) {
        showMenuToast('Logged out');
        closeMainMenuPopup();
    }
}

// Export functions
window.openMainMenuPopup = openMainMenuPopup;
window.closeMainMenuPopup = closeMainMenuPopup;
window.openSection = openSection;
