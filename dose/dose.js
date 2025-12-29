// dose/dose.js

let prescriptions = JSON.parse(localStorage.getItem('ventora_prescriptions')) || [];
let isAddingNew = false;

// Initialize dose modal
function initDoseModal() {

   


    
    // Insert before the last divider
    const dividers = menuItems.querySelectorAll('.menu-divider');
    if (dividers.length > 0) {
        menuItems.insertBefore(doseMenuItem, dividers[dividers.length - 1]);
    }
    
    // Load prescriptions
    loadPrescriptions();
    renderPrescriptions();
}

// Toggle dose modal
function toggleDoseModal() {
    const modal = document.getElementById('doseModal');
    modal.classList.toggle('active');
    closeMenu();
    
    if (modal.classList.contains('active')) {
        renderPrescriptions();
    }
}

// Load prescriptions from localStorage
function loadPrescriptions() {
    const saved = localStorage.getItem('ventora_prescriptions');
    if (saved) {
        try {
            prescriptions = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading prescriptions:', e);
            prescriptions = [];
        }
    }
}

// Save prescriptions to localStorage
function savePrescriptions() {
    localStorage.setItem('ventora_prescriptions', JSON.stringify(prescriptions));
}

// Render prescriptions list
function renderPrescriptions() {
    const container = document.getElementById('prescriptionsContainer');
    
    if (prescriptions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-pills"></i>
                <h4>No Prescriptions Yet</h4>
                <p>Add your first prescription to track medications and dosages.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = prescriptions.map((prescription, index) => `
        <div class="prescription-item">
            <div class="prescription-info">
                <div class="prescription-info-row">
                    <div class="prescription-label">Medication</div>
                    <div class="prescription-value">${escapeHtml(prescription.medication)}</div>
                </div>
                <div class="prescription-info-row">
                    <div class="prescription-label">Dosage</div>
                    <div class="prescription-value">${escapeHtml(prescription.dosage)}</div>
                </div>
                <div class="prescription-info-row">
                    <div class="prescription-label">Frequency</div>
                    <div class="prescription-value">${escapeHtml(prescription.frequency)}</div>
                </div>
                <div class="prescription-info-row">
                    <div class="prescription-label">Duration</div>
                    <div class="prescription-value">${escapeHtml(prescription.duration)}</div>
                </div>
                <div class="prescription-info-row">
                    <div class="prescription-label">Status</div>
                    <div class="prescription-value status-${prescription.status}">${getStatusText(prescription.status)}</div>
                </div>
                ${prescription.notes ? `
                <div class="prescription-info-row">
                    <div class="prescription-label">Notes</div>
                    <div class="prescription-value" style="font-size: 0.85rem; opacity: 0.8;">${escapeHtml(prescription.notes)}</div>
                </div>
                ` : ''}
                <div class="prescription-info-row">
                    <div class="prescription-label">Prescribed</div>
                    <div class="prescription-value" style="font-size: 0.8rem; opacity: 0.7;">${formatDate(prescription.prescribedDate)}</div>
                </div>
            </div>
            <div class="prescription-actions">
                <button class="action-btn" onclick="editPrescription(${index})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete" onclick="deletePrescription(${index})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Show add prescription form
function showAddForm() {
    isAddingNew = true;
    const form = document.getElementById('doseForm');
    form.classList.add('active');
    form.innerHTML = `
        <div class="form-group">
            <label>Medication Name *</label>
            <input type="text" id="medicationInput" class="form-input" placeholder="e.g., Amoxicillin 500mg" required>
        </div>
        <div class="form-group">
            <label>Dosage *</label>
            <input type="text" id="dosageInput" class="form-input" placeholder="e.g., 1 tablet, 5ml, 2 puffs" required>
        </div>
        <div class="form-group">
            <label>Frequency *</label>
            <select id="frequencySelect" class="form-select">
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Four times daily">Four times daily</option>
                <option value="Every 6 hours">Every 6 hours</option>
                <option value="Every 8 hours">Every 8 hours</option>
                <option value="Every 12 hours">Every 12 hours</option>
                <option value="Once weekly">Once weekly</option>
                <option value="As needed">As needed</option>
                <option value="Other">Other (specify in notes)</option>
            </select>
        </div>
        <div class="form-group">
            <label>Duration *</label>
            <input type="text" id="durationInput" class="form-input" placeholder="e.g., 7 days, 1 month, Ongoing" required>
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="statusSelect" class="form-select">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="discontinued">Discontinued</option>
            </select>
        </div>
        <div class="form-group">
            <label>Doctor's Notes / Instructions</label>
            <textarea id="notesInput" class="form-textarea" placeholder="Any special instructions, side effects to watch for, etc."></textarea>
        </div>
        <div class="form-group">
            <label>Prescribed Date</label>
            <input type="date" id="dateInput" class="form-input" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-actions">
            <button class="form-btn primary" onclick="savePrescription()">Save Prescription</button>
            <button class="form-btn secondary" onclick="cancelForm()">Cancel</button>
        </div>
    `;
    
    // Focus on first input
    setTimeout(() => {
        const firstInput = document.getElementById('medicationInput');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Save prescription
function savePrescription() {
    const medication = document.getElementById('medicationInput')?.value.trim();
    const dosage = document.getElementById('dosageInput')?.value.trim();
    const frequency = document.getElementById('frequencySelect')?.value;
    const duration = document.getElementById('durationInput')?.value.trim();
    
    if (!medication || !dosage || !frequency || !duration) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }
    
    const prescription = {
        id: Date.now(),
        medication,
        dosage,
        frequency,
        duration,
        status: document.getElementById('statusSelect')?.value || 'active',
        notes: document.getElementById('notesInput')?.value.trim() || '',
        prescribedDate: document.getElementById('dateInput')?.value || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    prescriptions.unshift(prescription);
    savePrescriptions();
    renderPrescriptions();
    cancelForm();
    
    // Show success message
    showToast('Prescription saved successfully!');
}

// Edit prescription
function editPrescription(index) {
    const prescription = prescriptions[index];
    isAddingNew = false;
    
    const form = document.getElementById('doseForm');
    form.classList.add('active');
    form.innerHTML = `
        <div class="form-group">
            <label>Medication Name *</label>
            <input type="text" id="medicationInput" class="form-input" value="${escapeHtml(prescription.medication)}" required>
        </div>
        <div class="form-group">
            <label>Dosage *</label>
            <input type="text" id="dosageInput" class="form-input" value="${escapeHtml(prescription.dosage)}" required>
        </div>
        <div class="form-group">
            <label>Frequency *</label>
            <select id="frequencySelect" class="form-select">
                <option value="Once daily" ${prescription.frequency === 'Once daily' ? 'selected' : ''}>Once daily</option>
                <option value="Twice daily" ${prescription.frequency === 'Twice daily' ? 'selected' : ''}>Twice daily</option>
                <option value="Three times daily" ${prescription.frequency === 'Three times daily' ? 'selected' : ''}>Three times daily</option>
                <option value="Four times daily" ${prescription.frequency === 'Four times daily' ? 'selected' : ''}>Four times daily</option>
                <option value="Every 6 hours" ${prescription.frequency === 'Every 6 hours' ? 'selected' : ''}>Every 6 hours</option>
                <option value="Every 8 hours" ${prescription.frequency === 'Every 8 hours' ? 'selected' : ''}>Every 8 hours</option>
                <option value="Every 12 hours" ${prescription.frequency === 'Every 12 hours' ? 'selected' : ''}>Every 12 hours</option>
                <option value="Once weekly" ${prescription.frequency === 'Once weekly' ? 'selected' : ''}>Once weekly</option>
                <option value="As needed" ${prescription.frequency === 'As needed' ? 'selected' : ''}>As needed</option>
                <option value="Other" ${prescription.frequency === 'Other' ? 'selected' : ''}>Other (specify in notes)</option>
            </select>
        </div>
        <div class="form-group">
            <label>Duration *</label>
            <input type="text" id="durationInput" class="form-input" value="${escapeHtml(prescription.duration)}" required>
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="statusSelect" class="form-select">
                <option value="active" ${prescription.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="completed" ${prescription.status === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="discontinued" ${prescription.status === 'discontinued' ? 'selected' : ''}>Discontinued</option>
            </select>
        </div>
        <div class="form-group">
            <label>Doctor's Notes / Instructions</label>
            <textarea id="notesInput" class="form-textarea" placeholder="Any special instructions, side effects to watch for, etc.">${escapeHtml(prescription.notes || '')}</textarea>
        </div>
        <div class="form-group">
            <label>Prescribed Date</label>
            <input type="date" id="dateInput" class="form-input" value="${prescription.prescribedDate}">
        </div>
        <div class="form-actions">
            <button class="form-btn primary" onclick="updatePrescription(${index})">Update Prescription</button>
            <button class="form-btn secondary" onclick="cancelForm()">Cancel</button>
        </div>
    `;
}

// Update prescription
function updatePrescription(index) {
    const medication = document.getElementById('medicationInput')?.value.trim();
    const dosage = document.getElementById('dosageInput')?.value.trim();
    const frequency = document.getElementById('frequencySelect')?.value;
    const duration = document.getElementById('durationInput')?.value.trim();
    
    if (!medication || !dosage || !frequency || !duration) {
        alert('Please fill in all required fields');
        return;
    }
    
    prescriptions[index] = {
        ...prescriptions[index],
        medication,
        dosage,
        frequency,
        duration,
        status: document.getElementById('statusSelect')?.value || prescriptions[index].status,
        notes: document.getElementById('notesInput')?.value.trim() || prescriptions[index].notes,
        prescribedDate: document.getElementById('dateInput')?.value || prescriptions[index].prescribedDate,
        updatedAt: new Date().toISOString()
    };
    
    savePrescriptions();
    renderPrescriptions();
    cancelForm();
    
    showToast('Prescription updated!');
}

// Delete prescription
function deletePrescription(index) {
    if (confirm('Delete this prescription? This cannot be undone.')) {
        prescriptions.splice(index, 1);
        savePrescriptions();
        renderPrescriptions();
        showToast('Prescription deleted');
    }
}

// Cancel form
function cancelForm() {
    const form = document.getElementById('doseForm');
    form.classList.remove('active');
    isAddingNew = false;
}

// Export prescriptions (for printing/sharing)
function exportPrescriptions() {
    if (prescriptions.length === 0) {
        showToast('No prescriptions to export');
        return;
    }
    
    let text = `=== VENTORA AI - MEDICATION LIST ===\n\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Total Medications: ${prescriptions.length}\n\n`;
    
    prescriptions.forEach((pres, index) => {
        text += `[${index + 1}] ${pres.medication}\n`;
        text += `  Dosage: ${pres.dosage}\n`;
        text += `  Frequency: ${pres.frequency}\n`;
        text += `  Duration: ${pres.duration}\n`;
        text += `  Status: ${getStatusText(pres.status)}\n`;
        if (pres.notes) text += `  Notes: ${pres.notes}\n`;
        text += `  Prescribed: ${formatDate(pres.prescribedDate)}\n\n`;
    });
    
    text += '\n=== IMPORTANT ===\n';
    text += '• Always consult your doctor before making changes to medication\n';
    text += '• This list is for reference only\n';
    text += '• Keep your medications in original packaging\n';
    text += '• Store medications as directed\n';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventora-medications-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Medication list exported!');
}

// Clear all prescriptions
function clearAllPrescriptions() {
    if (prescriptions.length === 0) {
        showToast('No prescriptions to clear');
        return;
    }
    
    if (confirm('Delete ALL prescriptions? This cannot be undone.')) {
        prescriptions = [];
        savePrescriptions();
        renderPrescriptions();
        showToast('All prescriptions cleared');
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusText(status) {
    const statusMap = {
        'active': 'Active',
        'completed': 'Completed',
        'discontinued': 'Discontinued'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

function showToast(message) {
    // Use existing toast function or create new one
    if (window.showToast) {
        window.showToast(message);
    } else {
        alert(message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDoseModal);
