// goal/goal.js

function initGoalTracker() {
    const goalsArea = document.getElementById('study-goals-area');
    const statusText = document.getElementById('goal-status');

    if (!goalsArea) return;

    // 1. Load existing goals from local storage
    const savedContent = localStorage.getItem('ventora_study_goals');
    if (savedContent) {
        goalsArea.value = savedContent;
    }

    // 2. Auto-save logic with visual feedback
    let saveTimeout;
    goalsArea.addEventListener('input', () => {
        statusText.innerText = "Typing...";
        
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            localStorage.setItem('ventora_study_goals', goalsArea.value);
            statusText.innerText = "Saved";
        }, 800); // Saves 800ms after user stops typing
    });
}

// Run initialization when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoalTracker);
} else {
    initGoalTracker();
}
