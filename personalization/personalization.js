// 1. DATA INITIALIZATION
window.personalization = JSON.parse(localStorage.getItem('nebula_pers')) || {
    userName: '',
    studyLevel: 'college',
    major: '',
    responseStyle: 'balanced',
    customInstructions: '' 
};

// 2. OPEN MODAL FUNCTION
window.openPersonalization = function() {
    if(typeof closeMenu === "function") closeMenu();
    
    document.getElementById('persName').value = window.personalization.userName || '';
    document.getElementById('persLevel').value = window.personalization.studyLevel || 'college';
    document.getElementById('persMajor').value = window.personalization.major || '';
    document.getElementById('persStyle').value = window.personalization.responseStyle || 'balanced';
    document.getElementById('persCustom').value = window.personalization.customInstructions || '';
    
    document.getElementById('personalizationModal').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('personalizationModal').classList.add('active');
    }, 10);
};

// 3. CLOSE MODAL FUNCTION
window.closePersonalization = function() {
    document.getElementById('personalizationModal').classList.remove('active');
    setTimeout(() => {
        document.getElementById('personalizationModal').style.display = 'none';
    }, 300);
};

// 4. SAVE DATA FUNCTION
window.savePersonalization = function() {
    window.personalization = {
        userName: document.getElementById('persName').value.trim(),
        studyLevel: document.getElementById('persLevel').value,
        major: document.getElementById('persMajor').value.trim(),
        responseStyle: document.getElementById('persStyle').value,
        customInstructions: document.getElementById('persCustom').value.trim() 
    };
    
    localStorage.setItem('nebula_pers', JSON.stringify(window.personalization));
    window.closePersonalization();
    
    if(typeof showToast === "function") showToast("Identity Updated! ✨");
};
