// File Upload and OCR Management with OCR.space API
let fileContext = {
    files: [],
    text: '',
    name: ''
};

// OCR.space API Configuration
const OCR_CONFIG = {
    apiUrl: 'https://api.ocr.space/parse/image',
    apiKey: 'OCR_KEY_VENTORA', // Will be replaced by Vercel environment variable
    maxFileSize: 1024 * 1024, // 1MB for free plan
    maxPdfPages: 3,
    language: 'eng',
    isOverlayRequired: false,
    scale: true,
    isTable: false,
    detectOrientation: true
};

// Initialize file context
function initFileContext() {
    const saved = localStorage.getItem('ventora_file_context');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            fileContext = parsed;
            updateFilesList();
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

// Take photo
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
        const files = Array.from(this.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const newFile = new File([file], `scan_${Date.now()}.jpg`, {
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
        showPopupStatus('Max 5 files allowed', 'error');
        return;
    }
    
    showPopupStatus('Processing...', 'info');
    
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
        isCameraImage: file.name.includes('scan_')
    };
    
    fileContext.files.push(fileObj);
    saveFileContext();
    
    // Process file
    processFileWithOCR(fileObj);
}

async function processFileWithOCR(fileObj) {
    const index = fileContext.files.findIndex(f => f.id === fileObj.id);
    if (index === -1) return;
    
    try {
        // Check file size (1MB limit for free plan)
        if (fileObj.size > OCR_CONFIG.maxFileSize) {
            throw new Error('File too large (max 1MB)');
        }
        
        // Check if file type is supported
        const isSupported = isFileTypeSupported(fileObj);
        if (!isSupported) {
            throw new Error('File type not supported');
        }
        
        // Extract text using OCR.space API
        const extractedText = await extractTextWithOCRSpace(fileObj.file, fileObj.type);
        
        if (!extractedText || extractedText.trim().length < 10) {
            throw new Error('No text could be extracted');
        }
        
        // Success
        fileContext.files[index].status = 'success';
        fileContext.files[index].text = extractedText.trim();
        fileContext.files[index].error = null;
        
        showPopupStatus(`${fileObj.name}: Text extracted`, 'success');
        
    } catch (error) {
        fileContext.files[index].status = 'error';
        fileContext.files[index].error = error.message;
        fileContext.files[index].text = '';
        
        showPopupStatus(`${fileObj.name}: ${error.message}`, 'error');
    }
    
    saveFileContext();
    updateFilesList();
}

function isFileTypeSupported(fileObj) {
    const supportedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/html',
        'text/csv',
        'text/markdown',
        'application/rtf'
    ];
    
    return supportedTypes.includes(fileObj.type) || 
           fileObj.name.match(/\.(jpg|jpeg|png|gif|bmp|tiff|tif|pdf|txt|doc|docx|html|csv|md|rtf)$/i);
}

async function extractTextWithOCRSpace(file, fileType) {
    return new Promise((resolve, reject) => {
        // For text files, read directly
        if (fileType.includes('text') || 
            fileType.includes('html') || 
            fileType.includes('csv') ||
            fileType.includes('markdown') ||
            fileType.includes('rtf') ||
            file.name.match(/\.(txt|md|html|csv|rtf)$/i)) {
            
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.onerror = () => reject(new Error('Failed to read text file'));
            reader.readAsText(file);
            return;
        }
        
        // For PDF and images, use OCR.space API
        const formData = new FormData();
        formData.append('file', file);
        
        // Add API parameters
        formData.append('apikey', OCR_CONFIG.apiKey);
        formData.append('language', OCR_CONFIG.language);
        formData.append('isOverlayRequired', OCR_CONFIG.isOverlayRequired.toString());
        formData.append('scale', OCR_CONFIG.scale.toString());
        formData.append('isTable', OCR_CONFIG.isTable.toString());
        formData.append('detectOrientation', OCR_CONFIG.detectOrientation.toString());
        
        // For PDFs, add page limit
        if (fileType === 'application/pdf') {
            formData.append('pages', '1-' + OCR_CONFIG.maxPdfPages);
        }
        
        // Show processing status
        showPopupStatus(`Extracting text from ${file.name}...`, 'info');
        
        // Make API request
        fetch(OCR_CONFIG.apiUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.IsErroredOnProcessing) {
                throw new Error(data.ErrorMessage || 'OCR processing failed');
            }
            
            // Extract text from all parsed results
            let extractedText = '';
            if (data.ParsedResults && data.ParsedResults.length > 0) {
                extractedText = data.ParsedResults
                    .map(result => result.ParsedText || '')
                    .filter(text => text.trim())
                    .join('\n\n');
            }
            
            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('No text found in document');
            }
            
            resolve(extractedText);
        })
        .catch(error => {
            console.error('OCR.space API error:', error);
            
            // Handle specific errors
            if (error.message.includes('API key')) {
                reject(new Error('OCR service unavailable. Please try again.'));
            } else if (error.message.includes('size limit')) {
                reject(new Error('File too large for OCR processing'));
            } else if (error.message.includes('rate limit')) {
                reject(new Error('OCR service busy. Please try again later.'));
            } else {
                reject(new Error('OCR processing failed: ' + error.message));
            }
        });
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
            <div class="mini-empty-state">
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
        fileItem.className = `mini-file-item ${file.status === 'error' ? 'error' : ''}`;
        
        const fileIcon = getFileIcon(file);
        
        fileItem.innerHTML = `
            <div class="mini-file-info">
                <div class="mini-file-icon">
                    ${fileIcon}
                </div>
                <div class="mini-file-details">
                    <div class="mini-file-name" title="${file.name}">${file.name}</div>
                    <div class="mini-file-status">
                        ${getFileStatusHTML(file)}
                    </div>
                </div>
            </div>
            <button class="mini-remove-file" onclick="removeFile('${file.id}')" title="Remove">
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
    if (file.type.includes('text')) return '<i class="fas fa-file-alt"></i>';
    return '<i class="fas fa-file"></i>';
}

function getFileStatusHTML(file) {
    if (file.status === 'processing') {
        return '<span class="mini-status-processing"><span class="mini-spinner"></span> Processing</span>';
    } else if (file.status === 'success') {
        const textLength = file.text ? file.text.length : 0;
        return `<span class="mini-status-success"><i class="fas fa-check-circle"></i> ${textLength} chars</span>`;
    } else if (file.status === 'error') {
        return `<span class="mini-status-error"><i class="fas fa-exclamation-circle"></i> ${file.error || 'Error'}</span>`;
    }
    return '<span>Pending</span>';
}

function showPopupStatus(message, type = 'info') {
    const statusEl = document.getElementById('popup-status');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'mini-popup-status';
    if (type === 'error') statusEl.classList.add('error');
    if (type === 'success') statusEl.classList.add('success');
    
    if (type !== 'info') {
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'mini-popup-status';
        }, 2000);
    }
}

function removeFile(fileId) {
    fileContext.files = fileContext.files.filter(f => f.id !== fileId);
    saveFileContext();
    updateFilesList();
    showPopupStatus('Removed', 'success');
}

function clearAllFiles() {
    if (fileContext.files.length === 0) return;
    
    if (confirm('Remove all files?')) {
        fileContext.files = [];
        saveFileContext();
        updateFilesList();
        showPopupStatus('Cleared', 'success');
    }
}

function attachFiles() {
    const successfulFiles = fileContext.files.filter(f => f.status === 'success' && f.text);
    
    if (successfulFiles.length === 0) {
        showPopupStatus('No text to attach', 'error');
        return;
    }
    
    // Format text for AI exactly as requested
    const combinedText = successfulFiles.map(f => 
        `[File: ${f.name}]\n${f.text}\n`
    ).join('\n');
    
    fileContext.text = combinedText;
    fileContext.name = `${successfulFiles.length} file(s)`;
    
    saveFileContext();
    closeFilePopup();
    showToast('Files attached to chat', 'success');
}

function clearAttachedFile() {
    if (confirm('Remove all files from chat?')) {
        fileContext.text = '';
        fileContext.name = '';
        saveFileContext();
        showToast('Files detached from chat', 'info');
        
        // Update UI
        const clearSection = document.getElementById('file-clear-section');
        if (clearSection) {
            clearSection.style.display = 'none';
        }
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
        
        localStorage.setItem('ventora_file_context', JSON.stringify({
            files: serializableFiles,
            text: fileContext.text,
            name: fileContext.name
        }));
    } catch (e) {
        console.error('Error saving:', e);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', initFileContext);

// Clear file context when creating new chat
const originalCreateNewConversation = window.createNewConversation;
if (originalCreateNewConversation) {
    window.createNewConversation = function() {
        // Clear file context
        fileContext.text = '';
        fileContext.name = '';
        saveFileContext();
        
        // Update UI
        const clearSection = document.getElementById('file-clear-section');
        if (clearSection) {
            clearSection.style.display = 'none';
        }
        
        return originalCreateNewConversation.apply(this, arguments);
    };
}

// Export for use in main chat
window.fileContext = fileContext;
window.clearAttachedFile = clearAttachedFile;
window.openFilePicker = openFilePicker;
window.toggleFilePopup = toggleFilePopup;
