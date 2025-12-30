// Add Tesseract.js to your head section in index.html
// <script src="https://cdn.jsdelivr.net/npm/tesseract.js@v4.0.0/dist/tesseract.min.js"></script>

// File Upload and OCR Management
let fileContext = {
    files: [],
    text: '',
    name: ''
};

// Initialize Tesseract worker
let tesseractWorker = null;

// Initialize file context from localStorage
function initFileContext() {
    const saved = localStorage.getItem('ventora_file_context');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            fileContext = parsed;
            updateFileContextDisplay();
        } catch (e) {
            console.error('Error loading file context:', e);
        }
    }
    window.fileContext = fileContext;
}

// Toggle file popup
function toggleFilePopup(event) {
    event.stopPropagation();
    const popup = document.getElementById('file-popup');
    const isOpen = popup.style.display === 'block';
    
    if (isOpen) {
        closeFilePopup();
    } else {
        openFilePopup();
    }
}

function openFilePopup() {
    const popup = document.getElementById('file-popup');
    popup.style.display = 'block';
    
    // Add click outside listener
    setTimeout(() => {
        document.addEventListener('click', closeFilePopupOnOutsideClick);
    }, 10);
    
    updateFilesList();
}

function closeFilePopup() {
    const popup = document.getElementById('file-popup');
    popup.style.display = 'none';
    document.removeEventListener('click', closeFilePopupOnOutsideClick);
}

function closeFilePopupOnOutsideClick(event) {
    const popup = document.getElementById('file-popup');
    const fileBtn = document.getElementById('file-btn');
    
    if (popup && !popup.contains(event.target) && !fileBtn.contains(event.target)) {
        closeFilePopup();
    }
}

// Open file picker
function openFilePicker() {
    document.getElementById('file-input').click();
}

// Take photo on mobile
function takePhoto() {
    document.getElementById('ocr-input').click();
}

// Handle file selection
document.getElementById('file-input').addEventListener('change', function(e) {
    if (this.files.length > 0) {
        handleFiles(this.files);
        this.value = '';
    }
});

// Handle camera input
document.getElementById('ocr-input').addEventListener('change', function(e) {
    if (this.files.length > 0) {
        // Rename camera images to indicate they're photos
        const files = Array.from(this.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                // Create a new file with better name
                const newFile = new File([file], `medicine_photo_${Date.now()}.jpg`, {
                    type: file.type,
                    lastModified: file.lastModified
                });
                handleFiles([newFile]);
            } else {
                handleFiles([file]);
            }
        });
        this.value = '';
    }
});

// Handle files
function handleFiles(fileList) {
    const files = Array.from(fileList);
    
    // Check max limit (5 files)
    if (fileContext.files.length + files.length > 5) {
        showPopupStatus('Maximum 5 files allowed. Remove some files first.', 'error');
        return;
    }
    
    showPopupStatus('Processing files...', 'info');
    
    // Process each file
    files.forEach(file => {
        addFileToContext(file);
    });
    
    updateFilesList();
}

function addFileToContext(file) {
    const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const fileObj = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'processing',
        error: null,
        text: '',
        file: file,
        isCameraImage: file.name.includes('medicine_photo_')
    };
    
    fileContext.files.push(fileObj);
    saveFileContext();
    
    // Start processing
    processFile(fileObj);
}

async function processFile(fileObj) {
    const index = fileContext.files.findIndex(f => f.id === fileObj.id);
    if (index === -1) return;
    
    try {
        // Check file size (limit to 10MB)
        if (fileObj.size > 10 * 1024 * 1024) {
            throw new Error('File too large (max 10MB)');
        }
        
        let extractedText = '';
        
        if (fileObj.type.startsWith('image/')) {
            // Image file - use OCR
            showPopupStatus(`Scanning ${fileObj.name}...`, 'info');
            extractedText = await extractTextFromImage(fileObj.file);
            
            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('No text found in image');
            }
            
        } else if (fileObj.type === 'application/pdf') {
            // PDF file
            showPopupStatus(`Reading PDF: ${fileObj.name}...`, 'info');
            extractedText = await extractTextFromPDF(fileObj.file);
            
            if (!extractedText || extractedText.trim().length < 10) {
                throw new Error('PDF appears to be empty or unreadable');
            }
            
        } else if (fileObj.type.includes('text') || 
                   fileObj.type.includes('document') ||
                   fileObj.name.match(/\.(txt|md|html|rtf|csv)$/i)) {
            // Text-based documents
            showPopupStatus(`Reading ${fileObj.name}...`, 'info');
            extractedText = await extractTextFromTextFile(fileObj.file);
            
        } else {
            throw new Error('File type not supported for text extraction');
        }
        
        // Success
        fileContext.files[index].status = 'success';
        fileContext.files[index].text = extractedText.trim();
        fileContext.files[index].error = null;
        
        showPopupStatus(`${fileObj.name}: ${extractedText.length} characters extracted`, 'success');
        
    } catch (error) {
        console.error('Error processing file:', error);
        fileContext.files[index].status = 'error';
        fileContext.files[index].error = error.message;
        fileContext.files[index].text = '';
        
        showPopupStatus(`${fileObj.name}: ${error.message}`, 'error');
    }
    
    saveFileContext();
    updateFilesList();
    updateFileContextDisplay();
}

// OCR Function using Tesseract.js
async function extractTextFromImage(file) {
    try {
        // Create worker if it doesn't exist
        if (!tesseractWorker) {
            tesseractWorker = await Tesseract.createWorker('eng');
        }
        
        // Convert file to image URL
        const imageUrl = URL.createObjectURL(file);
        
        // Recognize text
        const result = await tesseractWorker.recognize(imageUrl);
        
        // Clean up
        URL.revokeObjectURL(imageUrl);
        
        return result.data.text;
        
    } catch (error) {
        throw new Error('OCR processing failed: ' + error.message);
    }
}

// PDF text extraction
async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                // For simple PDFs, extract text from binary
                const content = e.target.result;
                const text = content
                    .replace(/[^\x20-\x7E\n\r]/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                if (text.length > 10) {
                    resolve(text.substring(0, 10000));
                } else {
                    reject(new Error('PDF appears to be empty or scanned'));
                }
            } catch (err) {
                reject(new Error('Error reading PDF'));
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsBinaryString(file);
    });
}

// Text file extraction
async function extractTextFromTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// Update files list
function updateFilesList() {
    const filesList = document.getElementById('files-list');
    const popupActions = document.getElementById('popup-actions');
    
    if (!filesList) return;
    
    filesList.innerHTML = '';
    
    if (fileContext.files.length === 0) {
        filesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file"></i>
                <span>No files attached</span>
            </div>
        `;
        popupActions.style.display = 'none';
        return;
    }
    
    popupActions.style.display = 'flex';
    
    fileContext.files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = `file-item ${file.status === 'error' ? 'error' : ''}`;
        
        const fileIcon = getFileIcon(file);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    ${fileIcon}
                </div>
                <div class="file-details">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-status">
                        ${getFileStatusHTML(file)}
                    </div>
                </div>
            </div>
            <button class="remove-file" onclick="removeFile('${file.id}')" title="Remove file">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        filesList.appendChild(fileItem);
    });
}

function getFileIcon(file) {
    if (file.isCameraImage) return '<i class="fas fa-camera"></i>';
    if (file.type.startsWith('image/')) return '<i class="fas fa-image"></i>';
    if (file.type.includes('pdf')) return '<i class="fas fa-file-pdf"></i>';
    if (file.type.includes('word')) return '<i class="fas fa-file-word"></i>';
    if (file.type.includes('excel')) return '<i class="fas fa-file-excel"></i>';
    if (file.type.includes('text')) return '<i class="fas fa-file-alt"></i>';
    return '<i class="fas fa-file"></i>';
}

function getFileStatusHTML(file) {
    if (file.status === 'processing') {
        return '<span class="status-processing"><span class="spinner"></span> Processing</span>';
    } else if (file.status === 'success') {
        const textLength = file.text ? file.text.length : 0;
        return `<span class="status-success"><i class="fas fa-check-circle"></i> ${textLength} chars</span>`;
    } else if (file.status === 'error') {
        return `<span class="status-error"><i class="fas fa-exclamation-circle"></i> Error</span>`;
    }
    return '<span>Pending</span>';
}

function showPopupStatus(message, type = 'info') {
    const statusEl = document.getElementById('popup-status');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'popup-status';
    if (type === 'error') {
        statusEl.classList.add('error');
    } else if (type === 'success') {
        statusEl.classList.add('success');
    }
    
    if (type !== 'info') {
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'popup-status';
        }, 3000);
    }
}

function removeFile(fileId) {
    fileContext.files = fileContext.files.filter(f => f.id !== fileId);
    saveFileContext();
    updateFilesList();
    updateFileContextDisplay();
    
    if (fileContext.files.length === 0) {
        clearFileContext();
    }
    
    showPopupStatus('File removed', 'success');
}

function clearAllFiles() {
    if (fileContext.files.length === 0) return;
    
    if (confirm('Remove all attached files?')) {
        fileContext.files = [];
        saveFileContext();
        updateFilesList();
        updateFileContextDisplay();
        showPopupStatus('All files removed', 'success');
    }
}

function attachFiles() {
    const successfulFiles = fileContext.files.filter(f => f.status === 'success' && f.text);
    
    if (successfulFiles.length === 0) {
        showPopupStatus('No files with extracted text to attach', 'error');
        return;
    }
    
    // Format text for AI context
    const combinedText = successfulFiles.map(f => 
        `[File: ${f.name}]\n${f.text}\n`
    ).join('\n');
    
    // Update global file context
    fileContext.text = combinedText;
    fileContext.name = `${successfulFiles.length} file(s) attached`;
    
    saveFileContext();
    updateFileContextDisplay();
    
    closeFilePopup();
    showToast('Files attached to chat', 'success');
}

function clearAttachedFile() {
    if (confirm('Remove all files from chat?')) {
        clearFileContext();
        showToast('Files detached from chat', 'info');
    }
}

function clearFileContext() {
    fileContext = {
        files: [],
        text: '',
        name: ''
    };
    window.fileContext = fileContext;
    localStorage.removeItem('ventora_file_context');
    updateFileContextDisplay();
    updateFilesList();
    showPopupStatus('Files cleared', 'success');
}

function updateFileContextDisplay() {
    // Update main input bar clear section
    const clearSection = document.getElementById('file-clear-section');
    if (clearSection) {
        const hasFiles = fileContext.files.length > 0;
        clearSection.style.display = hasFiles ? 'block' : 'none';
    }
}

function saveFileContext() {
    try {
        const serializableFiles = fileContext.files.map(f => ({
            id: f.id,
            name: f.name,
            type: f.type,
            size: f.size,
            status: f.status,
            error: f.error,
            text: f.text,
            isCameraImage: f.isCameraImage
        }));
        
        const toSave = {
            files: serializableFiles,
            text: fileContext.text,
            name: fileContext.name
        };
        
        localStorage.setItem('ventora_file_context', JSON.stringify(toSave));
    } catch (e) {
        console.error('Error saving file context:', e);
        showPopupStatus('Error saving files', 'error');
    }
}

function openGoogleDrive() {
    showPopupStatus('Google Drive integration coming soon', 'info');
}

// Clean up Tesseract worker
window.addEventListener('beforeunload', () => {
    if (tesseractWorker) {
        tesseractWorker.terminate();
    }
});

// Export for use in main chat
window.fileContext = fileContext;
window.clearAttachedFile = clearAttachedFile;
window.openFilePicker = openFilePicker;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initFileContext();
    
    // Clear file context when creating new chat
    const originalCreateNewConversation = window.createNewConversation;
    if (originalCreateNewConversation) {
        window.createNewConversation = function() {
            clearFileContext();
            return originalCreateNewConversation.apply(this, arguments);
        };
    }
});
