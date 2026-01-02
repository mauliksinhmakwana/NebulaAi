/* ===== VENTORA VISUALIZER ENGINE ===== */

// Configuration
const VISUALIZER_CONFIG = {
    autoDetect: true,
    storageKey: 'ventora_visualizations',
    triggers: {
        table: ['table', 'data', 'comparison', 'list of', 'breakdown'],
        diet: ['diet plan', 'meal plan', 'nutrition', 'breakfast', 'lunch', 'dinner'],
        flowchart: ['flowchart', 'process', 'steps', 'workflow', 'diagram']
    }
};

// Initialize visualizer
window.VentoraVisualizer = {
    storage: {},
    
    // Initialize on page load
    init() {
        this.loadFromStorage();
        console.log('Ventora Visualizer initialized');
    },
    
    // Load saved visualizations
    loadFromStorage() {
        const saved = localStorage.getItem(VISUALIZER_CONFIG.storageKey);
        if (saved) {
            try {
                this.storage = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading visualizations:', e);
                this.storage = {};
            }
        }
    },
    
    // Save visualization to storage
    saveToStorage(conversationId, vizData) {
        if (!this.storage[conversationId]) {
            this.storage[conversationId] = [];
        }
        this.storage[conversationId].push({
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            data: vizData
        });
        localStorage.setItem(VISUALIZER_CONFIG.storageKey, JSON.stringify(this.storage));
    },
    
    // Detect if content needs visualization
    detectVisualization(text) {
        const lowerText = text.toLowerCase();
        
        // Check for table patterns
        if (this.shouldCreateTable(lowerText, text)) {
            return { type: 'table', confidence: 'high' };
        }
        
        // Check for diet plan
        if (this.shouldCreateDiet(lowerText)) {
            return { type: 'diet', confidence: 'high' };
        }
        
        // Check for flowchart
        if (this.shouldCreateFlowchart(lowerText)) {
            return { type: 'flowchart', confidence: 'medium' };
        }
        
        return null;
    },
    
    // Check if content should be a table
    shouldCreateTable(lowerText, fullText) {
        // Check for trigger words
        const hasTrigger = VISUALIZER_CONFIG.triggers.table.some(t => lowerText.includes(t));
        
        // Check for table-like structure (|, multiple lines with colons, etc.)
        const hasTableChars = fullText.includes('|') || 
                             (fullText.split('\n').length > 3 && fullText.includes(':'));
        
        // Check for numbered/bulleted lists with multiple items
        const listPattern = /(?:^\d+\.|^-|^•).+$/gm;
        const listMatches = fullText.match(listPattern);
        const hasMultipleItems = listMatches && listMatches.length >= 3;
        
        return hasTrigger || hasTableChars || hasMultipleItems;
    },
    
    // Check if content is a diet plan
    shouldCreateDiet(lowerText) {
        return VISUALIZER_CONFIG.triggers.diet.some(t => lowerText.includes(t));
    },
    
    // Check if content is a flowchart
    shouldCreateFlowchart(lowerText) {
        return VISUALIZER_CONFIG.triggers.flowchart.some(t => lowerText.includes(t));
    },
    
    // Parse and create table
    parseTable(text) {
        const lines = text.split('\n').filter(l => l.trim());
        
        // Try to parse markdown table
        if (text.includes('|')) {
            return this.parseMarkdownTable(text);
        }
        
        // Try to parse list format
        return this.parseListToTable(lines);
    },
    
    // Parse markdown table
    parseMarkdownTable(text) {
        const lines = text.split('\n').filter(l => l.includes('|'));
        if (lines.length < 2) return null;
        
        const headers = lines[0].split('|')
            .map(h => h.trim())
            .filter(h => h);
        
        const rows = lines.slice(2).map(line => 
            line.split('|')
                .map(c => c.trim())
                .filter(c => c)
        );
        
        return { headers, rows };
    },
    
    // Parse list to table
    parseListToTable(lines) {
        const data = [];
        let headers = ['Item', 'Description'];
        
        lines.forEach(line => {
            // Remove list markers
            const cleaned = line.replace(/^[\d+\-•\*]\s*/, '').trim();
            
            if (cleaned.includes(':')) {
                const [item, desc] = cleaned.split(':').map(s => s.trim());
                data.push([item, desc]);
            } else if (cleaned.includes('-')) {
                const parts = cleaned.split('-').map(s => s.trim());
                if (parts.length >= 2) {
                    data.push(parts);
                }
            } else if (cleaned) {
                data.push([cleaned, '']);
            }
        });
        
        return data.length > 0 ? { headers, rows: data } : null;
    },
    
    // Parse diet plan
    parseDiet(text) {
        const meals = [];
        const lines = text.split('\n');
        let currentMeal = null;
        
        const mealKeywords = {
            'breakfast': '🌅',
            'lunch': '☀️',
            'dinner': '🌙',
            'snack': '🍎'
        };
        
        lines.forEach(line => {
            const lowerLine = line.toLowerCase().trim();
            
            // Check if line is a meal header
            for (const [meal, icon] of Object.entries(mealKeywords)) {
                if (lowerLine.includes(meal)) {
                    if (currentMeal) meals.push(currentMeal);
                    currentMeal = {
                        name: meal.charAt(0).toUpperCase() + meal.slice(1),
                        icon,
                        time: this.extractTime(line),
                        items: []
                    };
                    break;
                }
            }
            
            // Add items to current meal
            if (currentMeal && line.trim() && !Object.keys(mealKeywords).some(k => lowerLine.includes(k))) {
                const cleaned = line.replace(/^[\d+\-•\*]\s*/, '').trim();
                if (cleaned) {
                    currentMeal.items.push(this.parseDietItem(cleaned));
                }
            }
        });
        
        if (currentMeal) meals.push(currentMeal);
        
        return meals.length > 0 ? meals : null;
    },
    
    // Extract time from text
    extractTime(text) {
        const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/);
        return timeMatch ? timeMatch[1] : '';
    },
    
    // Parse diet item
    parseDietItem(text) {
        const item = { name: text, calories: null, protein: null, carbs: null };
        
        // Try to extract nutrition info
        const caloriesMatch = text.match(/(\d+)\s*cal/i);
        const proteinMatch = text.match(/(\d+)g?\s*protein/i);
        const carbsMatch = text.match(/(\d+)g?\s*carb/i);
        
        if (caloriesMatch) item.calories = caloriesMatch[1];
        if (proteinMatch) item.protein = proteinMatch[1] + 'g';
        if (carbsMatch) item.carbs = carbsMatch[1] + 'g';
        
        // Clean name
        item.name = text
            .replace(/\d+\s*cal/gi, '')
            .replace(/\d+g?\s*protein/gi, '')
            .replace(/\d+g?\s*carb/gi, '')
            .replace(/[(),]/g, '')
            .trim();
        
        return item;
    },
    
    // Create visualization HTML
    createVisualization(type, data, conversationId) {
        const vizId = `viz-${Date.now()}`;
        let bodyContent = '';
        
        switch (type) {
            case 'table':
                bodyContent = this.renderTable(data);
                break;
            case 'diet':
                bodyContent = this.renderDiet(data);
                break;
            case 'flowchart':
                bodyContent = this.renderFlowchart(data);
                break;
        }
        
        const wrapper = `
            <div class="visualizer-wrapper" id="${vizId}" data-type="${type}">
                <div class="visualizer-header">
                    <div class="visualizer-title">
                        <i class="fas fa-chart-bar"></i>
                        <span>${this.getTypeLabel(type)}</span>
                    </div>
                    <div class="visualizer-actions">
                        <button class="visualizer-btn" onclick="VentoraVisualizer.copyVisualization('${vizId}')">
                            <i class="fas fa-copy"></i>
                            Copy
                        </button>
                        <button class="visualizer-btn" onclick="VentoraVisualizer.exportAs('${vizId}', 'pdf')">
                            <i class="fas fa-file-pdf"></i>
                            PDF
                        </button>
                        <button class="visualizer-btn" onclick="VentoraVisualizer.exportAs('${vizId}', 'excel')">
                            <i class="fas fa-file-excel"></i>
                            Excel
                        </button>
                        <button class="visualizer-btn" onclick="VentoraVisualizer.exportAs('${vizId}', 'image')">
                            <i class="fas fa-image"></i>
                            Image
                        </button>
                    </div>
                </div>
                <div class="visualizer-body">
                    ${bodyContent}
                </div>
            </div>
        `;
        
        // Save to storage
        this.saveToStorage(conversationId, { type, data, html: wrapper });
        
        return wrapper;
    },
    
    // Get type label
    getTypeLabel(type) {
        const labels = {
            table: 'Data Table',
            diet: 'Diet Plan',
            flowchart: 'Flowchart'
        };
        return labels[type] || 'Visualization';
    },
    
    // Render table
    renderTable(tableData) {
        if (!tableData || !tableData.headers || !tableData.rows) {
            return '<p>Unable to parse table data</p>';
        }
        
        let html = '<div class="viz-table-container"><table class="viz-table"><thead><tr>';
        
        tableData.headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        tableData.rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${cell || ''}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        
        return html;
    },
    
    // Render diet plan
    renderDiet(meals) {
        if (!meals || meals.length === 0) {
            return '<p>Unable to parse diet plan</p>';
        }
        
        let html = '<div class="diet-planner">';
        
        meals.forEach(meal => {
            html += `
                <div class="diet-meal">
                    <div class="diet-meal-header">
                        <div class="diet-meal-title">
                            <span>${meal.icon}</span>
                            <span>${meal.name}</span>
                        </div>
                        ${meal.time ? `<div class="diet-meal-time">${meal.time}</div>` : ''}
                    </div>
                    <div class="diet-meal-items">
            `;
            
            let totalCals = 0;
            let totalProtein = 0;
            let totalCarbs = 0;
            
            meal.items.forEach(item => {
                html += `
                    <div class="diet-item">
                        <div class="diet-item-name">${item.name}</div>
                        <div class="diet-item-details">
                            ${item.calories ? `<span>${item.calories} cal</span>` : ''}
                            ${item.protein ? `<span>${item.protein}</span>` : ''}
                            ${item.carbs ? `<span>${item.carbs}</span>` : ''}
                        </div>
                    </div>
                `;
                
                if (item.calories) totalCals += parseInt(item.calories);
                if (item.protein) totalProtein += parseInt(item.protein);
                if (item.carbs) totalCarbs += parseInt(item.carbs);
            });
            
            if (totalCals > 0 || totalProtein > 0 || totalCarbs > 0) {
                html += `
                    <div class="diet-nutrition">
                        ${totalCals > 0 ? `
                            <div class="diet-nutrition-item">
                                <div class="nutrition-value">${totalCals}</div>
                                <div class="nutrition-label">Calories</div>
                            </div>
                        ` : ''}
                        ${totalProtein > 0 ? `
                            <div class="diet-nutrition-item">
                                <div class="nutrition-value">${totalProtein}g</div>
                                <div class="nutrition-label">Protein</div>
                            </div>
                        ` : ''}
                        ${totalCarbs > 0 ? `
                            <div class="diet-nutrition-item">
                                <div class="nutrition-value">${totalCarbs}g</div>
                                <div class="nutrition-label">Carbs</div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        return html;
    },
    
    // Render flowchart (simple text-based)
    renderFlowchart(text) {
        const steps = text.split('\n')
            .filter(l => l.trim())
            .filter(l => !l.toLowerCase().includes('flowchart'));
        
        let html = '<div class="flowchart-container">';
        
        steps.forEach((step, index) => {
            const cleaned = step.replace(/^[\d+\-•\*]\s*/, '').trim();
            let nodeClass = 'flowchart-node';
            
            if (index === 0) nodeClass += ' start';
            if (index === steps.length - 1) nodeClass += ' end';
            if (cleaned.includes('?') || cleaned.toLowerCase().includes('if')) {
                nodeClass += ' decision';
            }
            
            html += `<div class="${nodeClass}"><span>${cleaned}</span></div>`;
            
            if (index < steps.length - 1) {
                html += '<div class="flowchart-arrow">↓</div>';
            }
        });
        
        html += '</div>';
        
        return html;
    },
    
    // Copy visualization
    copyVisualization(vizId) {
        const viz = document.getElementById(vizId);
        if (!viz) return;
        
        const body = viz.querySelector('.visualizer-body');
        const text = body.innerText;
        
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Copy failed:', err);
            showToast('Copy failed', 'error');
        });
    },
    
    // Export visualization
    async exportAs(vizId, format) {
        const viz = document.getElementById(vizId);
        if (!viz) return;
        
        const body = viz.querySelector('.visualizer-body');
        const type = viz.dataset.type;
        
        switch (format) {
            case 'pdf':
                await this.exportToPDF(vizId, body, type);
                break;
            case 'excel':
                await this.exportToExcel(vizId, body, type);
                break;
            case 'image':
                await this.exportToImage(vizId, body);
                break;
        }
    },
    
    // Export to PDF
    async exportToPDF(vizId, element, type) {
        try {
            // Use html2canvas for better rendering
            const canvas = await html2canvas(element, {
                backgroundColor: '#000000',
                scale: 2
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = pdf.internal.pageSize.getWidth() - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`ventora-${type}-${Date.now()}.pdf`);
            
            showToast('PDF exported successfully!', 'success');
        } catch (err) {
            console.error('PDF export failed:', err);
            showToast('PDF export failed', 'error');
        }
    },
    
    // Export to Excel (CSV format)
    async exportToExcel(vizId, element, type) {
        try {
            let csvContent = '';
            
            if (type === 'table') {
                const table = element.querySelector('.viz-table');
                if (table) {
                    // Headers
                    const headers = Array.from(table.querySelectorAll('th'))
                        .map(th => `"${th.textContent}"`);
                    csvContent += headers.join(',') + '\n';
                    
                    // Rows
                    const rows = table.querySelectorAll('tbody tr');
                    rows.forEach(row => {
                        const cells = Array.from(row.querySelectorAll('td'))
                            .map(td => `"${td.textContent}"`);
                        csvContent += cells.join(',') + '\n';
                    });
                }
            } else {
                // Convert other types to text
                csvContent = element.innerText;
            }
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `ventora-${type}-${Date.now()}.csv`;
            link.click();
            
            showToast('Excel file exported!', 'success');
        } catch (err) {
            console.error('Excel export failed:', err);
            showToast('Excel export failed', 'error');
        }
    },
    
    // Export to Image
    async exportToImage(vizId, element) {
        try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#000000',
                scale: 2
            });
            
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `ventora-visualization-${Date.now()}.png`;
                link.click();
                URL.revokeObjectURL(url);
                
                showToast('Image exported successfully!', 'success');
            });
        } catch (err) {
            console.error('Image export failed:', err);
            showToast('Image export failed', 'error');
        }
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        VentoraVisualizer.init();
    });
} else {
    VentoraVisualizer.init();
}

// Export for global use
window.VentoraVisualizer = VentoraVisualizer;
