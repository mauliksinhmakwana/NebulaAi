// 1. DATA INITIALIZATION
// This part checks if you have saved info. If not, it uses empty defaults.
window.personalization = JSON.parse(localStorage.getItem('nebula_pers')) || {
    userName: '',
    studyLevel: 'college',
    major: '',
    responseStyle: 'balanced',
    customInstructions: '' 
};

// 2. OPEN MODAL FUNCTION
window.openPersonalization = function() {
    // Close the sidebar menu if it's open
    if(typeof closeMenu === "function") closeMenu();
    
    // Fill the boxes in the popup with your saved data
    const nameInput = document.getElementById('persName');
    const levelSelect = document.getElementById('persLevel');
    const majorInput = document.getElementById('persMajor');
    const styleSelect = document.getElementById('persStyle');
    const customTextArea = document.getElementById('persCustom');

    // Only fill if the elements actually exist on the page
    if(nameInput) nameInput.value = window.personalization.userName || '';
    if(levelSelect) levelSelect.value = window.personalization.studyLevel || 'college';
    if(majorInput) majorInput.value = window.personalization.major || '';
    if(styleSelect) styleSelect.value = window.personalization.responseStyle || 'balanced';
    if(customTextArea) customTextArea.value = window.personalization.customInstructions || '';
    
    // Show the popup
    document.getElementById('personalizationModal').classList.add('active');
};

// 3. CLOSE MODAL FUNCTION
window.closePersonalization = function() {
    document.getElementById('personalizationModal').classList.remove('active');
};

// 4. SAVE DATA FUNCTION
window.savePersonalization = function() {
    // Grab the new text from the 'persCustom' box
    const customText = document.getElementById('persCustom').value.trim();
    
    // Update the 'Brain' of the app
    window.personalization = {
        userName: document.getElementById('persName').value.trim(),
        studyLevel: document.getElementById('persLevel').value,
        major: document.getElementById('persMajor').value.trim(),
        responseStyle: document.getElementById('persStyle').value,
        customInstructions: customText 
    };
    
    // Lock the data into the browser's permanent memory (LocalStorage)
    localStorage.setItem('nebula_pers', JSON.stringify(window.personalization));
    
    // Close popup and show a success message
    window.closePersonalization();
    if(typeof showToast === "function") showToast("Updated!");
};
