// ocr/ocr.js

// Global OCR context
window.ocrContext = {
    isProcessing: false,
    extractedText: '',
    fileName: '',
    type: ''
};

// Extract text from image using Browser OCR
async function extractTextFromImage(file) {
    return new Promise((resolve, reject) => {
        // Show processing notification
        if (window.showToast) {
            window.showToast('Extracting text from medicine image...', 'info');
        }
        
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = function() {
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set reasonable size for OCR (not too large)
            const maxWidth = 800;
            const scale = Math.min(maxWidth / img.width, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            
            // Draw image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Get image data for analysis
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Extract text using browser's built-in text recognition
            // Note: This uses the Shape Detection API if available
            extractTextFromCanvas(canvas, file.name)
                .then(text => {
                    URL.revokeObjectURL(url);
                    resolve({
                        success: true,
                        text: text,
                        fileName: file.name,
                        type: 'image',
                        dimensions: `${img.width}x${img.height}`
                    });
                })
                .catch(error => {
                    URL.revokeObjectURL(url);
                    resolve({
                        success: false,
                        error: error.message,
                        fileName: file.name,
                        fallbackText: `[Medicine Image Uploaded: ${file.name}]\n` +
                                     `Please describe the medicine details in the text box below.`
                    });
                });
        };
        
        img.onerror = function() {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        
        img.src = url;
    });
}

// Extract text from canvas using browser APIs
async function extractTextFromCanvas(canvas, fileName) {
    try {
        // Try using the Shape Detection API if available (Chrome/Edge)
        if ('TextDetector' in window) {
            const textDetector = new TextDetector();
            const textRegions = await textDetector.detect(canvas);
            
            if (textRegions.length > 0) {
                let extractedText = '';
                textRegions.forEach(region => {
                    if (region.rawValue) {
                        extractedText += region.rawValue + '\n';
                    }
                });
                
                if (extractedText.trim()) {
                    return formatMedicineText(extractedText, fileName);
                }
            }
        }
        
        // Fallback: Use canvas data to detect text patterns
        return fallbackTextExtraction(canvas, fileName);
        
    } catch (error) {
        console.warn('OCR failed:', error);
        throw new Error('Text extraction not supported in this browser');
    }
}

// Format medicine-specific text
function formatMedicineText(text, fileName) {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Common medicine text patterns
    const medicinePatterns = [
        /(?:tablet|capsule|injection|syrup|cream|ointment|drops)\s*(?:of)?\s*[A-Z][a-z]+/i,
        /(?:mg|mcg|g|ml|%)\s*\d+/,
        /(?:take|use|apply|inhale)\s*(?:\d+)?\s*(?:times?\s*(?:a|per)\s*(?:day|week))/i,
        /(?:expiry|exp\.|mfg\.|manufactured)/i,
        /(?:rx|prescription)/i
    ];
    
    let formattedText = `=== MEDICINE INFORMATION EXTRACTED ===\n`;
    formattedText += `File: ${fileName}\n`;
    formattedText += `Extracted on: ${new Date().toLocaleString()}\n\n`;
    
    // Group likely medicine information
    const likelyMedicineInfo = lines.filter(line => 
        medicinePatterns.some(pattern => pattern.test(line))
    );
    
    const otherText = lines.filter(line => 
        !medicinePatterns.some(pattern => pattern.test(line))
    );
    
    if (likelyMedicineInfo.length > 0) {
        formattedText += `🔍 DETECTED MEDICINE DETAILS:\n`;
        formattedText += likelyMedicineInfo.join('\n') + '\n\n';
    }
    
    if (otherText.length > 0) {
        formattedText += `📄 ADDITIONAL TEXT:\n`;
        formattedText += otherText.join('\n') + '\n';
    }
    
    formattedText += `\n=== END OF EXTRACTION ===\n`;
    formattedText += `Note: Please verify all medicine details with your doctor.\n`;
    
    return formattedText;
}

// Fallback text extraction for browsers without Shape Detection API
function fallbackTextExtraction(canvas, fileName) {
    // This is a simple placeholder - in real implementation, you'd use Tesseract.js
    // For now, we'll return instructions
    
    return `=== MEDICINE IMAGE UPLOADED ===\n` +
           `File: ${fileName}\n` +
           `Image processed successfully.\n\n` +
           `📸 What's in this medicine image?\n\n` +
           `Please describe what you see:\n` +
           `• Medicine name: _______________\n` +
           `• Dosage strength: _____________\n` +
           `• Instructions: ________________\n` +
           `• Expiry date: _________________\n\n` +
           `I'll help you understand this medicine based on your description.`;
}

// Extract text from PDF (basic)
async function extractTextFromPDF(file) {
    return new Promise((resolve) => {
        // For PDFs, we'll show a message
        resolve({
            success: true,
            text: `=== PDF DOCUMENT UPLOADED ===\n` +
                  `File: ${file.name}\n` +
                  `Size: ${(file.size / 1024).toFixed(1)} KB\n\n` +
                  `⚠️ PDF text extraction requires advanced processing.\n` +
                  `Please describe the medicine information from this PDF:\n\n` +
                  `1. Medicine name:\n` +
                  `2. Patient instructions:\n` +
                  `3. Doctor's notes:\n` +
                  `4. Any concerns/questions:\n\n` +
                  `I'll help analyze the information you provide.`,
            fileName: file.name,
            type: 'pdf'
        });
    });
}

// Main OCR processor
async function processFileWithOCR(file) {
    window.ocrContext.isProcessing = true;
    window.ocrContext.fileName = file.name;
    
    let result;
    
    if (file.type.startsWith('image/')) {
        result = await extractTextFromImage(file);
        window.ocrContext.type = 'image';
    } else if (file.type === 'application/pdf') {
        result = await extractTextFromPDF(file);
        window.ocrContext.type = 'pdf';
    } else {
        result = {
            success: false,
            error: 'Unsupported file type for OCR',
            fileName: file.name
        };
    }
    
    if (result.success) {
        window.ocrContext.extractedText = result.text;
        window.ocrContext.isProcessing = false;
        
        if (window.showToast) {
            window.showToast(`Text extracted from ${file.name}`, 'success');
        }
    } else {
        window.ocrContext.isProcessing = false;
        
        if (window.showToast) {
            window.showToast(`Could not extract text: ${result.error}`, 'error');
        }
    }
    
    return result;
}

// Clear OCR context
function clearOCRContext() {
    window.ocrContext = {
        isProcessing: false,
        extractedText: '',
        fileName: '',
        type: ''
    };
}

// Send extracted text to AI
function sendOCRTextToAI() {
    if (!window.ocrContext.extractedText || !window.userInput) {
        return;
    }
    
    const userInput = document.getElementById('user-input');
    if (!userInput) return;
    
    // Set the extracted text in the input
    userInput.value = window.ocrContext.extractedText + 
        '\n\n---\n' +
        'Please analyze this medicine information. ' +
        'Tell me about this medicine, its uses, precautions, and important safety information.';
    
    // Auto-expand the textarea
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
    
    // Focus on the input
    userInput.focus();
    
    if (window.showToast) {
        window.showToast('Text ready to send to AI. Click send or press Enter.', 'info');
    }
}

// Initialize OCR when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('OCR module loaded');
});
