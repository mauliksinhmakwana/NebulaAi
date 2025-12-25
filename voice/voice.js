



// voice/voice.js

function toggleSpeech(btn) {
    const synth = window.speechSynthesis;

    // 1. If currently speaking this or any message, STOP
    if (synth.speaking) {
        synth.cancel();
        
        // If we clicked a button that WAS NOT the active one, 
        // we stop the old one and proceed to start the new one.
        if (btn.classList.contains('speaking')) {
            resetVoiceUI();
            return;
        }
        resetVoiceUI();
    }

    // 2. Get and Clean the Text
    const msgDiv = btn.closest('.msg');
    let text = msgDiv.innerText
        .replace(/[A-Z][a-z]{2}\s\d{1,2}\s•\s\d{1,2}:\d{2}\s(AM|PM)/g, '')
        .replace(/Copy|↻ Regenerate|Read|Stop/g, '') // Remove UI text
        .replace(/```[\s\S]*?```/g, ' [reading code skipped] ') // Skip large code blocks
        .replace(/\*\*/g, '') // Remove bold markdown
        .trim();

    // 3. Create Utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // 4. UI Feedback
    btn.classList.add('speaking');
    btn.innerHTML = '<i class="fas fa-stop"></i> Stop Reading';

    // 5. Cleanup when finished
    utterance.onend = () => resetVoiceUI();
    utterance.onerror = () => resetVoiceUI();

    synth.speak(utterance);
}

function resetVoiceUI() {
    const allBtns = document.querySelectorAll('.voice-btn');
    allBtns.forEach(b => {
        b.classList.remove('speaking');
        b.innerHTML = 'Read';
    });
}
