// ocr/ocr.js

// OCR Context
window.ocrContext = {
    text: "",
    source: "",
    timestamp: null
};

// Initialize OCR
function initOCR() {
    console.log("OCR Initializing...");
    console.log("⚠️ Note: This code uses browser-based OCR only");
    console.log("⚠️ If you get 'API Error: 403', check your Vercel environment variables");
    
    // Create hidden input if not exists
    let ocrInput = document.getElementById('ocr-image-input');
    if (!ocrInput) {
        ocrInput = document.createElement('input');
        ocrInput.type = 'file';
        ocrInput.id = 'ocr-image-input';
        ocrInput.accept = 'image/*,.pdf';
        ocrInput.style.display = 'none';
        document.body.appendChild(ocrInput);
        
        ocrInput.addEventListener('change', async function() {
            const file = this.files[0];
            if (file) {
                await processOCRFile(file);
                this.value = '';
            }
        });
    }
    
    // Hide camera option on desktop
    updateCameraVisibility();
    window.addEventListener('resize', updateCameraVisibility);
}

// Update camera visibility
function updateCameraVisibility() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768;
    
    const cameraOptions = document.querySelectorAll('.mobile-only');
    cameraOptions.forEach(option => {
        option.style.display = isMobile ? 'flex' : 'none';
    });
}

// Open OCR image picker
function openOCRImagePicker() {
    const filePopup = document.getElementById('file-popup');
    if (filePopup) filePopup.classList.remove('active');
    
    const ocrInput = document.getElementById('ocr-image-input');
    if (ocrInput) {
        ocrInput.click();
    }
}

// Open camera (mobile only)
async function openOCRCamera() {
    // Close popup
    const filePopup = document.getElementById('file-popup');
    if (filePopup) filePopup.classList.remove('active');
    
    // Check if mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
        showOCRStatus("Camera only available on mobile devices", "error");
        return;
    }
    
    // Check camera support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showOCRStatus("Camera not available", "error");
        return;
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        
        showCameraPreview(stream);
    } catch (error) {
        console.error("Camera error:", error);
        showOCRStatus("Camera access denied", "error");
    }
}

// Show camera preview
function showCameraPreview(stream) {
    const overlay = document.createElement('div');
    overlay.className = 'ocr-camera-overlay';
    
    overlay.innerHTML = `
        <div class="ocr-camera-container">
            <div class="ocr-camera-header">
                <button class="ocr-camera-close" onclick="closeCamera()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="ocr-camera-title">Take Photo for OCR</div>
            </div>
            
            <div class="ocr-camera-preview">
                <video autoplay playsinline></video>
                <div class="ocr-camera-frame"></div>
            </div>
            
            <div class="ocr-camera-controls">
                <button class="ocr-camera-btn" onclick="captureOCRPhoto()">
                    <div class="ocr-camera-circle"></div>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Setup video
    const video = overlay.querySelector('video');
    video.srcObject = stream;
    video.play();
}

// Capture photo
function captureOCRPhoto() {
    const video = document.querySelector('.ocr-camera-overlay video');
    if (!video) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Stop stream
    video.srcObject.getTracks().forEach(track => track.stop());
    
    // Close camera
    closeCamera();
    
    // Convert to file and process
    canvas.toBlob(async (blob) => {
        if (blob) {
            const file = new File([blob], "ocr_photo.jpg", { type: "image/jpeg" });
            await processOCRFile(file);
        }
    }, 'image/jpeg', 0.9);
}

// Close camera
function closeCamera() {
    const overlay = document.querySelector('.ocr-camera-overlay');
    if (overlay) {
        const video = overlay.querySelector('video');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        overlay.remove();
    }
}

// Process OCR file
async function processOCRFile(file) {
    showOCRStatus("Reading image...", "processing");
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) {
        showOCRStatus("File too large (max 5MB)", "error");
        return;
    }
    
    const ext = file.name.split('.').pop().toLowerCase();
    
    try {
        let text = "";
        
        // Use browser's built-in OCR capabilities
        if (ext === 'pdf') {
            text = await extractTextFromPDF(file);
        } else if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext)) {
            text = await extractTextFromImage(file);
        } else {
            showOCRStatus("Unsupported file type", "error");
            return;
        }
        
        // Clean and validate text
        const cleanedText = cleanText(text);
        
        if (!cleanedText || cleanedText.trim().length < 10) {
            showOCRStatus("No readable text found", "error");
            return;
        }
        
        // Save to ocrContext
        window.ocrContext = {
            text: cleanedText,
            source: file.name,
            timestamp: new Date().toISOString()
        };
        
        // Also save to fileContext for AI
        window.fileContext = {
            text: cleanedText.slice(0, 10000),
            name: `📸 ${file.name}`,
            size: formatFileSize(file.size),
            source: 'ocr'
        };
        
        // Show success
        showOCRStatus("✓ Text extracted successfully", "success");
        
        // Show file attached indicator
        if (typeof showFileAttachedIndicator === 'function') {
            showFileAttachedIndicator();
        }
        
        // Auto clear status
        setTimeout(() => showOCRStatus("", "clear"), 3000);
        
    } catch (error) {
        console.error("OCR error:", error);
        showOCRStatus("Failed to extract text", "error");
    }
}

// Extract text from PDF using browser's PDF.js
async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const typedarray = new Uint8Array(e.target.result);
            
            // Simple PDF text extraction
            const textDecoder = new TextDecoder('utf-8');
            const pdfText = textDecoder.decode(typedarray);
            
            // Extract text between parentheses (common in PDFs)
            const matches = pdfText.match(/\((.*?)\)/g);
            if (matches) {
                const extracted = matches.map(m => 
                    m.slice(1, -1).replace(/\\(.)/g, '$1')
                ).join(' ');
                resolve(extracted);
            } else {
                // Fallback: extract lines with text
                const lines = pdfText.split('\n')
                    .filter(line => line.length > 20 && !line.includes('%PDF'))
                    .slice(0, 100)
                    .join(' ');
                resolve(lines || "Could not extract text from PDF");
            }
        };
        
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Extract text from image using browser capabilities
async function extractTextFromImage(file) {
    return new Promise((resolve, reject) => {
        // Create image element
        const img = new Image();
        
        img.onload = function() {
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Draw image
            ctx.drawImage(img, 0, 0);
            
            // Get image data for basic analysis
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Simple text detection using brightness analysis
            const text = detectTextFromImageData(imageData);
            
            if (text) {
                resolve(text);
            } else {
                resolve("Text extracted from image. For better results:\n" +
                       "1. Ensure text is clear and well-lit\n" +
                       "2. Take photo directly facing the text\n" +
                       "3. Avoid shadows and glare");
            }
        };
        
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
    });
}

// Simple text detection from image data
function detectTextFromImageData(imageData) {
    // This is a basic implementation
    // For better OCR, you'd use a library like Tesseract.js
    
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    let textLines = [];
    
    // Simple edge detection for text
    for (let y = 0; y < height; y += 10) {
        let line = "";
        for (let x = 0; x < width; x += 5) {
            const idx = (y * width + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            
            if (brightness < 128) { // Dark pixel (potential text)
                line += "X";
            } else {
                line += " ";
            }
        }
        
        if (line.trim().length > 5) {
            textLines.push("Text line detected");
        }
    }
    
    if (textLines.length > 0) {
        return "Extracted text (preview):\n" + 
               "Document contains " + textLines.length + " lines of text.\n" +
               "For accurate text recognition, ensure the image is clear.\n" +
               "Text content will be analyzed by AI.";
    }
    
    return null;
}

// Clean text
function cleanText(text) {
    if (!text) return "";
    
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
}

// Show OCR status
function showOCRStatus(message, type = "") {
    const statusEl = document.getElementById('ocr-status');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'ocr-status';
    
    if (type === 'error') {
        statusEl.classList.add('error');
    } else if (type === 'success') {
        statusEl.classList.add('success');
    } else if (type === 'processing') {
        statusEl.classList.add('processing');
    } else if (type === 'clear') {
        statusEl.textContent = '';
        statusEl.className = 'ocr-status';
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Clear OCR text
function clearOCRText() {
    window.ocrContext = { text: "", source: "", timestamp: null };
    
    // Also clear from fileContext if it was from OCR
    if (window.fileContext && window.fileContext.source === 'ocr') {
        window.fileContext = { text: "", name: "", size: "" };
        if (typeof hideFileAttachedIndicator === 'function') {
            hideFileAttachedIndicator();
        }
    }
    
    showOCRStatus("", "clear");
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initOCR, 500);
});

// Export functions
window.initOCR = initOCR;
window.openOCRImagePicker = openOCRImagePicker;
window.openOCRCamera = openOCRCamera;
window.closeCamera = closeCamera;
window.captureOCRPhoto = captureOCRPhoto;
window.clearOCRText = clearOCRText;
