/* AI Interaction Styles */
.ai-interaction-section {
    margin: 25px 0;
    background: var(--dose-surface-light);
    border: 1px solid var(--dose-border);
    border-radius: 12px;
    padding: 20px;
}

.ai-interaction-section h4 {
    margin-top: 0;
    color: var(--dose-text);
    display: flex;
    align-items: center;
    gap: 10px;
}

.ai-interaction-section h4 i {
    color: #10a37f; /* ChatGPT green color */
}

.ai-input-group {
    display: flex;
    gap: 10px;
    margin: 15px 0;
}

.ai-input {
    flex: 1;
    padding: 12px 15px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--dose-border);
    border-radius: 10px;
    color: var(--dose-text);
    font-size: 0.9rem;
    outline: none;
}

.ai-input:focus {
    border-color: #10a37f;
}

.ai-send-btn {
    background: #10a37f;
    color: white;
    border: none;
    border-radius: 10px;
    width: 50px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ai-send-btn:hover {
    background: #0d8c6d;
}

.ai-response-area {
    min-height: 100px;
    max-height: 300px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--dose-border);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
}

.ai-placeholder {
    text-align: center;
    padding: 20px;
    color: var(--dose-text-secondary);
}

.ai-placeholder i {
    font-size: 2rem;
    margin-bottom: 10px;
    opacity: 0.5;
}

.ai-message {
    padding: 10px;
    margin: 10px 0;
    border-radius: 8px;
    line-height: 1.5;
}

.ai-message.user {
    background: rgba(0, 122, 255, 0.1);
    border-left: 3px solid var(--dose-accent);
}

.ai-message.assistant {
    background: rgba(16, 163, 127, 0.1);
    border-left: 3px solid #10a37f;
}

.ai-message.system {
    background: rgba(255, 149, 0, 0.1);
    border-left: 3px solid var(--dose-warning);
}

.ai-quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
}

.ai-quick-btn {
    flex: 1;
    min-width: 150px;
    padding: 10px 15px;
    background: rgba(16, 163, 127, 0.15);
    border: 1px solid rgba(16, 163, 127, 0.3);
    border-radius: 8px;
    color: var(--dose-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.ai-quick-btn:hover {
    background: rgba(16, 163, 127, 0.25);
}

/* Typing indicator */
.typing-indicator {
    display: flex;
    gap: 5px;
    padding: 15px;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    background: #10a37f;
    border-radius: 50%;
    animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
