// Ventora Visualizer - With Local Storage Persistence
class VentoraVisualizer {
    constructor() {
        this.isInitialized = false;
        this.storageKey = 'ventora_visualizations';
    }

    init() {
        if (this.isInitialized) return;
        
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                securityLevel: 'loose'
            });
        }
        
        this.isInitialized = true;
    }

    // Generate unique ID for each conversation message
    generateVizId(conversationId, messageIndex) {
        return `viz-${conversationId}-${messageIndex}`;
    }

    // Save visualization to localStorage
    saveVisualization(vizId, content, html) {
        try {
            const visualizations = this.getStoredVisualizations();
            visualizations[vizId] = {
                content: content,
                html: html,
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(visualizations));
        } catch (e) {
            console.error('Failed to save visualization:', e);
        }
    }

    // Get stored visualizations
    getStoredVisualizations() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error('Failed to load visualizations:', e);
            return {};
        }
    }

    // Get visualization for a specific message
    getVisualization(vizId) {
        const visualizations = this.getStoredVisualizations();
        return visualizations[vizId];
    }

    // Remove old visualizations (keep only last 50)
    cleanupOldVisualizations() {
        try {
            const visualizations = this.getStoredVisualizations();
            const entries = Object.entries(visualizations);
            
            if (entries.length > 50) {
                // Sort by timestamp and keep only 50 most recent
                const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
                const toKeep = sorted.slice(0, 50);
                
                const newVisualizations = {};
                toKeep.forEach(([key, value]) => {
                    newVisualizations[key] = value;
                });
                
                localStorage.setItem(this.storageKey, JSON.stringify(newVisualizations));
            }
        } catch (e) {
            console.error('Failed to cleanup visualizations:', e);
        }
    }

    // Main function - called from index.html
    async visualizeContent(content, conversationId, messageIndex) {
        this.init();
        
        const vizId = this.generateVizId(conversationId, messageIndex);
        
        // Check if we already have a visualization for this message
        const existing = this.getVisualization(vizId);
        if (existing && existing.html) {
            return existing.html;
        }

        // Check for table patterns
        if (this.detectTable(content)) {
            const tableHTML = this.createTableVisualization(content, vizId);
            if (tableHTML) {
                this.saveVisualization(vizId, content, tableHTML);
                return tableHTML;
            }
        }
        
        // Check for diet/nutrition patterns
        if (this.detectDietPlan(content)) {
            const dietHTML = this.createDietVisualization(content, vizId);
            if (dietHTML) {
                this.saveVisualization(vizId, content, dietHTML);
                return dietHTML;
            }
        }
        
        // Check for data patterns (charts)
        if (this.detectChartData(content)) {
            const chartHTML = this.createChartVisualization(content, vizId);
            if (chartHTML) {
                this.saveVisualization(vizId, content, chartHTML);
                return chartHTML;
            }
        }
        
        // Check for process flows
        if (this.detectProcessFlow(content)) {
            const flowHTML = this.createFlowChart(content, vizId);
            if (flowHTML) {
                this.saveVisualization(vizId, content, flowHTML);
                return flowHTML;
            }
        }
        
        return null;
    }

    // ========== TABLE FUNCTIONS ==========
    
    detectTable(content) {
        const lines = content.split('\n');
        let pipeCount = 0;
        let dashLineCount = 0;
        
        for (let line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes('|') && trimmed.length > 2) {
                pipeCount++;
            }
            if (/^[\|\-\s:]+$/.test(trimmed) && trimmed.includes('-') && trimmed.length > 2) {
                dashLineCount++;
            }
        }
        
        return pipeCount >= 2 && dashLineCount >= 1;
    }

    createTableVisualization(content, vizId) {
        const tableData = this.extractTableData(content);
        if (!tableData.headers || tableData.headers.length === 0) return '';
        
        const cleanedHeaders = tableData.headers.filter(h => h.trim() && !/^[-:]+$/.test(h));
        const cleanedRows = tableData.rows.map(row => 
            row.filter(cell => cell.trim())
               .slice(0, cleanedHeaders.length)
        ).filter(row => row.length > 0);
        
        if (cleanedHeaders.length === 0 || cleanedRows.length === 0) return '';
        
        return `
        <div class="visualizer-container" data-viz-id="${vizId}">
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <i class="fas fa-table"></i>
                    Data Table
                </div>
                <div class="visualizer-actions">
                    <button class="viz-btn" onclick="window.ventoraVisualizer.copyTable('${vizId}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="viz-btn primary" onclick="window.ventoraVisualizer.exportToPDF('${vizId}')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
            <div class="data-table-container">
                <table class="data-table" id="table-${vizId}">
                    <thead>
                        <tr>
                            ${cleanedHeaders.map(header => `<th>${this.escapeHTML(header)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${cleanedRows.map(row => `
                            <tr>
                                ${row.map(cell => `<td>${this.escapeHTML(cell)}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    }

    extractTableData(content) {
        const lines = content.split('\n').filter(l => l.trim());
        const headers = [];
        const rows = [];
        
        let tableStart = -1;
        let tableEnd = -1;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('|') && !/^[\|\-\s:]+$/.test(lines[i])) {
                if (tableStart === -1) tableStart = i;
                tableEnd = i;
            }
        }
        
        if (tableStart !== -1) {
            const tableLines = lines.slice(tableStart, tableEnd + 1);
            
            const headerLine = tableLines[0];
            const headerParts = headerLine.split('|').map(p => p.trim()).filter(p => p);
            headers.push(...headerParts);
            
            for (let i = 1; i < tableLines.length; i++) {
                if (!/^[\|\-\s:]+$/.test(tableLines[i])) {
                    const rowParts = tableLines[i].split('|').map(p => p.trim()).filter(p => p);
                    if (rowParts.length > 0) {
                        rows.push(rowParts);
                    }
                }
            }
        }
        
        return { headers, rows };
    }

    // ========== DIET PLAN FUNCTIONS ==========
    
    detectDietPlan(content) {
        const dietKeywords = ['breakfast', 'lunch', 'dinner', 'snack', 'meal', 'calories', 'protein', 'carbs', 'fat'];
        const lower = content.toLowerCase();
        
        const matches = dietKeywords.filter(keyword => lower.includes(keyword));
        return matches.length >= 3;
    }

    createDietVisualization(content, vizId) {
        const meals = this.parseDietData(content);
        if (meals.length === 0) return '';
        
        const totals = this.calculateTotals(meals);
        
        return `
        <div class="visualizer-container" data-viz-id="${vizId}">
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <i class="fas fa-apple-alt"></i>
                    Diet Plan
                </div>
                <div class="visualizer-actions">
                    <button class="viz-btn" onclick="window.ventoraVisualizer.copyText('${vizId}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="viz-btn primary" onclick="window.ventoraVisualizer.exportToPDF('${vizId}')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
            
            <div id="content-${vizId}">
                <div class="nutrition-summary">
                    <div class="nutrition-item">
                        <div class="nutrition-value">${totals.calories}</div>
                        <div class="nutrition-label">Calories</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${totals.protein}g</div>
                        <div class="nutrition-label">Protein</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${totals.carbs}g</div>
                        <div class="nutrition-label">Carbs</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value">${totals.fat}g</div>
                        <div class="nutrition-label">Fat</div>
                    </div>
                </div>
                
                <div class="diet-visualization">
                    ${meals.map(meal => `
                        <div class="diet-card">
                            <div class="diet-card-header">
                                <div class="meal-time">${meal.time}</div>
                                <div class="meal-calories">${meal.calories} cal</div>
                            </div>
                            <div class="diet-items">
                                ${meal.items.map(item => `
                                    <div class="diet-item">
                                        <div class="item-name">${item.name}</div>
                                        <div class="item-macros">P${item.protein} C${item.carbs} F${item.fat}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="chart-container">
                <canvas id="chart-${vizId}"></canvas>
            </div>
        </div>`;
    }

    parseDietData(content) {
        const meals = [];
        const lines = content.split('\n');
        let currentMeal = null;
        
        for (let line of lines) {
            const trimmed = line.trim().toLowerCase();
            if (!trimmed) continue;
            
            if (trimmed.includes('breakfast') || trimmed.includes('lunch') || 
                trimmed.includes('dinner') || trimmed.includes('snack')) {
                
                if (currentMeal && currentMeal.items.length > 0) {
                    meals.push(currentMeal);
                }
                
                currentMeal = {
                    time: this.capitalize(trimmed.split(':')[0] || trimmed),
                    items: [],
                    calories: 0
                };
            }
            
            if (currentMeal && (trimmed.includes('-') || trimmed.includes(':'))) {
                const item = this.parseFoodItem(trimmed);
                if (item.name && item.calories > 0) {
                    currentMeal.items.push(item);
                    currentMeal.calories += item.calories;
                }
            }
        }
        
        if (currentMeal && currentMeal.items.length > 0) {
            meals.push(currentMeal);
        }
        
        return meals;
    }

    parseFoodItem(text) {
        const item = {
            name: '',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        };
        
        const nameMatch = text.match(/^([^:-]+)/);
        if (nameMatch) item.name = nameMatch[1].trim();
        
        const calMatch = text.match(/(\d+)\s*cal/);
        if (calMatch) item.calories = parseInt(calMatch[1]);
        
        const protMatch = text.match(/(\d+)\s*g?\s*prot/);
        if (protMatch) item.protein = parseInt(protMatch[1]);
        
        const carbMatch = text.match(/(\d+)\s*g?\s*carb/);
        if (carbMatch) item.carbs = parseInt(carbMatch[1]);
        
        const fatMatch = text.match(/(\d+)\s*g?\s*fat/);
        if (fatMatch) item.fat = parseInt(fatMatch[1]);
        
        return item;
    }

    calculateTotals(meals) {
        const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        for (let meal of meals) {
            for (let item of meal.items) {
                totals.calories += item.calories;
                totals.protein += item.protein;
                totals.carbs += item.carbs;
                totals.fat += item.fat;
            }
        }
        
        return totals;
    }

    // ========== CHART FUNCTIONS ==========
    
    detectChartData(content) {
        return content.includes('chart') || 
               content.match(/\d+%\s/g) ||
               content.includes('graph') ||
               content.match(/data\s*:/i);
    }

    createChartVisualization(content, vizId) {
        const data = this.extractChartData(content);
        
        return `
        <div class="visualizer-container" data-viz-id="${vizId}">
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <i class="fas fa-chart-bar"></i>
                    Data Visualization
                </div>
                <div class="visualizer-actions">
                    <button class="viz-btn" onclick="window.ventoraVisualizer.copyText('${vizId}')">
                        <i class="fas fa-copy"></i> Copy Data
                    </button>
                    <button class="viz-btn primary" onclick="window.ventoraVisualizer.exportToPDF('${vizId}')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
            <div id="content-${vizId}">
                <div class="chart-container">
                    <canvas id="chart-${vizId}"></canvas>
                </div>
            </div>
        </div>`;
    }

    extractChartData(content) {
        const numbers = content.match(/\d+(\.\d+)?/g) || ['25', '50', '75', '100', '125'];
        const limitedNumbers = numbers.slice(0, 5).map(n => parseFloat(n));
        
        return {
            labels: ['A', 'B', 'C', 'D', 'E'].slice(0, limitedNumbers.length),
            values: limitedNumbers
        };
    }

    // ========== FLOW CHART FUNCTIONS ==========
    
    detectProcessFlow(content) {
        return (content.includes('step') && content.includes('process')) ||
               content.includes('flowchart') ||
               content.match(/step\s+\d+/i);
    }

    createFlowChart(content, vizId) {
        return `
        <div class="visualizer-container" data-viz-id="${vizId}">
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <i class="fas fa-project-diagram"></i>
                    Process Flow
                </div>
                <div class="visualizer-actions">
                    <button class="viz-btn" onclick="window.ventoraVisualizer.copyText('${vizId}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="viz-btn primary" onclick="window.ventoraVisualizer.exportToPDF('${vizId}')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
            <div id="content-${vizId}">
                <div class="flow-chart">
                    <div class="mermaid">
                        graph TD
                        A[Start] --> B[Step 1]
                        B --> C[Decision Point]
                        C -->|Yes| D[Step 2]
                        C -->|No| E[Alternative Path]
                        D --> F[Complete]
                        E --> F
                    </div>
                </div>
            </div>
        </div>`;
    }

    // ========== ACTION FUNCTIONS ==========
    
    async copyTable(vizId) {
        try {
            const table = document.getElementById(`table-${vizId}`);
            if (!table) {
                this.showToast('Table not found');
                return;
            }
            
            let text = '';
            const rows = table.querySelectorAll('tr');
            
            for (let row of rows) {
                const cells = row.querySelectorAll('th, td');
                const rowText = Array.from(cells).map(cell => cell.textContent.trim()).join('\t');
                text += rowText + '\n';
            }
            
            await navigator.clipboard.writeText(text);
            this.showToast('Table copied to clipboard');
        } catch (err) {
            console.error('Copy failed:', err);
            this.showToast('Failed to copy');
        }
    }

    async copyText(vizId) {
        try {
            const container = document.querySelector(`[data-viz-id="${vizId}"]`);
            if (!container) {
                this.showToast('Visualization not found');
                return;
            }
            
            let text = '';
            
            if (container.querySelector('table')) {
                const table = container.querySelector('table');
                const rows = table.querySelectorAll('tr');
                for (let row of rows) {
                    const cells = row.querySelectorAll('th, td');
                    text += Array.from(cells).map(cell => cell.textContent.trim()).join('\t') + '\n';
                }
            } else if (container.querySelector('.diet-card')) {
                const cards = container.querySelectorAll('.diet-card');
                for (let card of cards) {
                    const time = card.querySelector('.meal-time').textContent;
                    const calories = card.querySelector('.meal-calories').textContent;
                    text += `${time} (${calories}):\n`;
                    
                    const items = card.querySelectorAll('.diet-item');
                    for (let item of items) {
                        const name = item.querySelector('.item-name').textContent;
                        const macros = item.querySelector('.item-macros').textContent;
                        text += `  • ${name} ${macros}\n`;
                    }
                    text += '\n';
                }
            } else {
                text = container.textContent || container.innerText;
            }
            
            await navigator.clipboard.writeText(text.trim());
            this.showToast('Copied to clipboard');
        } catch (err) {
            console.error('Copy failed:', err);
            this.showToast('Failed to copy');
        }
    }

    async exportToPDF(vizId) {
        try {
            const { jsPDF } = window.jspdf;
            
            if (!jsPDF || typeof html2canvas === 'undefined') {
                this.showToast('PDF export not available');
                return;
            }
            
            const container = document.querySelector(`[data-viz-id="${vizId}"]`);
            if (!container) {
                this.showToast('Visualization not found');
                return;
            }
            
            const buttons = container.querySelectorAll('.viz-btn');
            buttons.forEach(btn => btn.style.visibility = 'hidden');
            
            const canvas = await html2canvas(container, {
                scale: 2,
                backgroundColor: '#000000',
                useCORS: true,
                logging: false
            });
            
            buttons.forEach(btn => btn.style.visibility = 'visible');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 180;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 15, 20, imgWidth, imgHeight);
            
            const title = container.querySelector('.visualizer-title').textContent;
            pdf.setFontSize(14);
            pdf.setTextColor(255, 255, 255);
            pdf.text(title, 105, 15, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });
            
            pdf.save(`ventora-visualization-${Date.now()}.pdf`);
            this.showToast('PDF exported successfully');
            
        } catch (err) {
            console.error('PDF export failed:', err);
            this.showToast('Failed to export PDF');
        }
    }

    // ========== UTILITY FUNCTIONS ==========
    
    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showToast(message) {
        const existing = document.querySelector('.viz-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'viz-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Clear all visualizations (optional)
    clearAllVisualizations() {
        localStorage.removeItem(this.storageKey);
    }
}

// Initialize global instance
window.ventoraVisualizer = new VentoraVisualizer();

// Auto-cleanup old visualizations
setInterval(() => window.ventoraVisualizer.cleanupOldVisualizations(), 5 * 60 * 1000);
