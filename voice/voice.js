// voice/voice.js

function toggleSpeech(btn) {
    const synth = window.speechSynthesis;

    // 1. If currently speaking this or any message, STOP
    if (synth.speaking) {
        synth.cancel();
        
        // If we clicked the button that was already active, just reset and stop.
        if (btn.classList.contains('speaking')) {
            resetVoiceUI();
            return;
        }
        resetVoiceUI();
    }

    // 2. Get and Clean the Text (Pulls from .ai-text specifically to avoid icons/UI)
    const msgDiv = btn.closest('.msg');
    const textContainer = msgDiv.querySelector('.ai-text');
    
    let text = (textContainer ? textContainer.innerText : msgDiv.innerText)
        .replace(/[A-Z][a-z]{2}\s\d{1,2}\s•\s\d{1,2}:\d{2}\s/g, '') // Remove timestamps
        .replace(/```[\s\S]*?```/g, ' [reading code skipped] ') // Skip large code blocks
        .replace(/\*\*/g, '') // Remove bold markdown
        .trim();
    
    // 3. Create Utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // 4. UI Feedback - ICON ONLY
    btn.classList.add('speaking');
    btn.style.color = '#ff4757'; // Turn red to show it is active
    btn.innerHTML = '<i class="fas fa-stop"></i>'; // Icon only, no text

    // 5. Cleanup when finished
    utterance.onend = () => resetVoiceUI();
    utterance.onerror = () => resetVoiceUI();

    synth.speak(utterance);
}

function resetVoiceUI() {
    const allBtns = document.querySelectorAll('.voice-btn');
    allBtns.forEach(b => {
        b.classList.remove('speaking');
        b.style.color = ''; // Reset to default color
        b.innerHTML = '<i class="fas fa-volume-up"></i>'; // Back to play icon
    });
}
