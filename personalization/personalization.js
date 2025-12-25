// Initialize or Load Data
window.personalization = JSON.parse(localStorage.getItem('nebula_pers')) || {
    userName: '',
    studyLevel: 'college',
    major: '',
    responseStyle: 'balanced',
    customInstructions: '' // Added new field
};

// Open Popup
window.openPersonalization = function() {
    if(typeof closeMenu === "function") closeMenu();
    
    // Set current values to inputs
    document.getElementById('persName').value = window.personalization.userName || '';
    document.getElementById('persLevel').value = window.personalization.studyLevel || 'college';
    document.getElementById('persMajor').value = window.personalization.major || '';
    document.getElementById('persStyle').value = window.personalization.responseStyle || 'balanced';
    document.getElementById('persCustom').value = window.personalization.customInstructions || ''; // Added loading logic
    
    document.getElementById('personalizationModal').classList.add('active');
};

// Close Popup
window.closePersonalization = function() {
    document.getElementById('personalizationModal').classList.remove('active');
};

// Save Data
window.savePersonalization = function() {
    window.personalization = {
        userName: document.getElementById('persName').value.trim(),
        studyLevel: document.getElementById('persLevel').value,
        major: document.getElementById('persMajor').value.trim(),
        responseStyle: document.getElementById('persStyle').value,
        customInstructions: document.getElementById('persCustom').value.trim() // Added saving logic
    };
    
    localStorage.setItem('nebula_pers', JSON.stringify(window.personalization));
    window.closePersonalization();
    
    if(typeof showToast === "function") showToast("Identity Updated! ✨");
};
