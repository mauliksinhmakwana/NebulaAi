// fileupload/fileupload.js

// GLOBAL FILE CONTEXT
window.fileContext = {
    text: "",
    name: "",
    size: ""
};

// Initialize file upload
function initFileUpload() {
    const fileBtn = document.getElementById("file-btn");
    const filePopup = document.getElementById("file-popup");
    const fileInput = document.getElementById("file-input");
    const fileStatus = document.getElementById("file-status");
    const fileClearSection = document.getElementById("file-clear-section");
    
    // Toggle popup on button click
    fileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        filePopup.classList.toggle("active");
    });
    
    // Close popup when clicking outside
    document.addEventListener("click", (e) => {
        if (!filePopup.contains(e.target) && !fileBtn.contains(e.target)) {
            filePopup.classList.remove("active");
        }
    });
    
    // Handle file selection
    fileInput.addEventListener("change", async () => {
        const file = fileInput.files[0];
        if (!file) return;
        
        fileStatus.textContent = "Reading file...";
        fileStatus.className = "file-status";
        fileClearSection.style.display = "none";
        
        const ext = file.name.split(".").pop().toLowerCase();
        
        try {
            let text = "";
            
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                throw "File too large (max 10MB)";
            }
            
            // Extract text based on file type
            if (["txt", "md", "html", "htm", "csv", "rtf"].includes(ext)) {
                text = await file.text();
            } 
            else if (ext === "pdf") {
                text = await extractPdfText(file);
            } 
            else if (ext === "docx" || ext === "doc") {
                text = await extractDocxText(file);
            }
            else {
                throw "Unsupported file format";
            }
            
            // Validate extracted text
            if (!text || text.trim().length < 10) {
                throw "No readable text found";
            }
            
            // Clean and limit text
            const cleanedText = text
                .replace(/\s+/g, ' ')
                .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
                .trim();
            
            if (cleanedText.length < 20) {
                throw "No readable text found";
            }
            
            // Save file context
            window.fileContext = {
                text: cleanedText.slice(0, 15000), // limit to 15k chars
                name: file.name,
                size: formatFileSize(file.size)
            };
            
            // Update UI
            fileStatus.textContent = "File uploaded successfully ✓";
            fileStatus.className = "file-status success";
            fileClearSection.style.display = "block";
            
            // Show attached indicator
            showFileAttachedIndicator();
            
            // Auto-close popup after 2 seconds
            setTimeout(() => {
                filePopup.classList.remove("active");
            }, 2000);
            
        } catch (err) {
            console.error("File error:", err);
            
            // Reset file context
            window.fileContext = { text: "", name: "", size: "" };
            
            // Show error message
            fileStatus.textContent = typeof err === "string" ? err : "Failed to read file";
            fileStatus.className = "file-status error";
            fileClearSection.style.display = "none";
            
            // Hide attached indicator
            hideFileAttachedIndicator();
            
            // Clear file input
            fileInput.value = "";
        }
    });
    
    // Close popup with Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && filePopup.classList.contains("active")) {
            filePopup.classList.remove("active");
        }
    });
}

// Trigger file picker
function pickFile() {
    document.getElementById("file-input").click();
}

// Extract text from PDF (basic method)
async function extractPdfText(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(arrayBuffer);
        
        // Look for text streams in PDF (simplified extraction)
        const textMatches = text.match(/\((.*?)\)/g);
        if (textMatches) {
            const extracted = textMatches.map(match => 
                match.slice(1, -1).replace(/\\(.)/g, '$1')
            ).join(' ');
            if (extracted.trim().length > 50) return extracted;
        }
        
        // Alternative: look for text between parentheses
        const altMatches = text.match(/<</g);
        if (altMatches) {
            // This is a complex PDF, return placeholder
            return "[PDF content extracted - some formatting may be lost]";
        }
        
        // Last resort: extract any readable ASCII text
        const asciiText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        const cleanAscii = asciiText.replace(/\s+/g, ' ').trim();
        
        if (cleanAscii.length > 100) {
            return cleanAscii.substring(0, 5000);
        }
        
        throw "Could not extract text from PDF";
        
    } catch (error) {
        console.error("PDF extraction error:", error);
        throw "PDF text extraction failed. Ensure PDF has selectable text.";
    }
}

// Extract text from DOCX
async function extractDocxText(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(arrayBuffer);
        
        // Basic DOCX text extraction
        const lines = text.split('\n').filter(line => 
            line.trim().length > 0 && 
            !line.includes('<?xml') && 
            !line.includes('<w:') &&
            !line.includes('PK') &&
            line.length > 10
        );
        
        if (lines.length > 0) {
            return lines.slice(0, 100).join(' ');
        }
        
        // Fallback: extract readable ASCII text
        const asciiText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        const cleanAscii = asciiText.replace(/\s+/g, ' ').trim();
        
        if (cleanAscii.length > 100) {
            return cleanAscii.substring(0, 5000);
        }
        
        throw "Could not read DOCX file";
        
    } catch (error) {
        console.error("DOCX extraction error:", error);
        throw "Could not read DOCX file";
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

// Show file attached indicator
function showFileAttachedIndicator() {
    const fileBtn = document.getElementById("file-btn");
    
    // Remove existing indicator
    const existingIndicator = fileBtn.querySelector(".file-attached-indicator");
    if (existingIndicator) existingIndicator.remove();
    
    // Add new indicator
    const indicator = document.createElement("div");
    indicator.className = "file-attached-indicator";
    indicator.title = "File attached";
    fileBtn.appendChild(indicator);
    
    // Update button appearance
    fileBtn.classList.add("active");
}

// Hide file attached indicator
function hideFileAttachedIndicator() {
    const fileBtn = document.getElementById("file-btn");
    const indicator = fileBtn.querySelector(".file-attached-indicator");
    if (indicator) indicator.remove();
    
    // Reset button appearance
    fileBtn.classList.remove("active");
}

// Clear attached file
function clearAttachedFile() {
    window.fileContext = { text: "", name: "", size: "" };
    hideFileAttachedIndicator();
    
    // Clear file input
    document.getElementById("file-input").value = "";
    
    // Hide clear section
    document.getElementById("file-clear-section").style.display = "none";
    
    // Clear status
    document.getElementById("file-status").textContent = "";
    document.getElementById("file-status").className = "file-status";
    
    // Show toast
    if (typeof showToast === "function") {
        showToast("File removed", "info");
    }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initFileUpload);

// Export for use in main script
window.initFileUpload = initFileUpload;
window.pickFile = pickFile;
window.clearAttachedFile = clearAttachedFile;
