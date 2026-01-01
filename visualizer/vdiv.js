// Ventora Interaction Visualizer
class VentoraVisualizer {
    constructor() {
        this.currentVisualization = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        // Initialize mermaid
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                securityLevel: 'loose',
                fontFamily: 'inherit'
            });
        }
        
        this.isInitialized = true;
        console.log('Ventora Visualizer initialized');
    }

    // Main function to detect and create visualizations
    async visualizeContent(content) {
        this.init();
        
        // Check for table patterns
        if (this.detectTable(content)) {
            return this.createTableVisualization(content);
        }
        
        // Check for diet/nutrition patterns
        if (this.detectDietPlan(content)) {
            return this.createDietVisualization(content);
        }
        
        // Check for chemical structures
        if (this.detectChemicalStructure(content)) {
            return this.createChemicalVisualization(content);
        }
        
        // Check for data patterns (charts)
        if (this.detectChartData(content)) {
            return this.createChartVisualization(content);
        }
        
        // Check for process flows
        if (this.detectProcessFlow(content)) {
            return this.createFlowChart(content);
        }
        
        return null;
    }

    // Table Detection and Creation
    detectTable(content) {
        const tablePatterns = [
            /\|\s*[^\|]+\s*\|/g, // Markdown tables
            /\n-{3,}\n/, // Separator lines
            /Row\s*\d+:/i,
            /Column\s*[A-Z]/i,
            /(?:^|\n)[A-Za-z]+\s*\|\s*[^\n]+\n[-|\s]+\n/
        ];
        return tablePatterns.some(pattern => pattern.test(content));
    }

    createTableVisualization(content) {
        const rows = content.split('\n').filter(line => line.trim());
        
        // Try to parse markdown table
        if (content.includes('|')) {
            const lines = rows.filter(line => line.includes('|'));
            if (lines.length >= 2) {
                const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
                const dataRows = lines.slice(2).map(line => 
                    line.split('|').map(cell => cell.trim()).filter((_, i) => i > 0 && i < headers.length + 1)
                );
                
                return this.generateTableHTML(headers, dataRows);
            }
        }
        
        // Try to parse structured data
        const structuredData = this.parseStructuredData(content);
        if (structuredData.headers && structuredData.rows) {
            return this.generateTableHTML(structuredData.headers, structuredData.rows);
        }
        
        return null;
    }

    parseStructuredData(content) {
        const lines = content.split('\n').filter(line => line.trim());
        const headers = [];
        const rows = [];
        
        lines.forEach(line => {
            // Pattern: "Key: Value"
            const keyValueMatch = line.match(/^([^:]+):\s*(.+)$/);
            if (keyValueMatch) {
                if (headers.length === 0) {
                    headers.push('Property', 'Value');
                }
                rows.push([keyValueMatch[1].trim(), keyValueMatch[2].trim()]);
            }
            
            // Pattern: "Item - Description"
            const itemMatch = line.match(/^([^-]+)\s*-\s*(.+)$/);
            if (itemMatch) {
                if (headers.length === 0) {
                    headers.push('Item', 'Description');
                }
                rows.push([itemMatch[1].trim(), itemMatch[2].trim()]);
            }
        });
        
        return { headers, rows };
    }

    generateTableHTML(headers, rows) {
        const tableId = 'viz-table-' + Date.now();
        
        let html = `
        <div class="visualizer-container">
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <i class="fas fa-table"></i>
                    Data Table
                </div>
                <div class="visualizer-actions">
                    <button class="viz-btn" onclick="window.ventoraVisualizer.copyTable('${tableId}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="viz-btn primary" onclick="window.ventoraVisualizer.exportTableToPDF('${tableId}')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
            <div class="data-table-container">
                <table class="data-table" id="${tableId}">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${this.escapeHTML(header)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>
                                ${row.map(cell => `<td>${this.escapeHTML(cell)}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
        
        return html;
    }

    // Diet Plan Visualization
    detectDietPlan(content) {
        const dietKeywords = [
            'breakfast', 'lunch', 'dinner', 'snack', 'meal',
            'calories', 'protein', 'carbs', 'fat', 'nutrition',
            'diet plan', 'meal plan', 'macros', 'calorie'
        ];
        
        const lowerContent = content.toLowerCase();
        return dietKeywords.some(keyword => lowerContent.includes(keyword));
    }

    createDietVisualization(content) {
        // Parse meal information
        const meals = this.parseMealData(content);
        const totals = this.calculateNutritionTotals(meals);
        
        const vizId = 'diet-viz-' + Date.now();
        
        let html = `
        <div class="visualizer-container">
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <i class="fas fa-apple-alt"></i>
                    Diet Plan Visualization
                </div>
                <div class="visualizer-actions">
                    <button class="viz-btn" onclick="window.ventoraVisualizer.copyDietPlan('${vizId}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="viz-btn primary" onclick="window.ventoraVisualizer.exportDietToPDF('${vizId}')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
            
            <!-- Nutrition Summary -->
            <div class="nutrition-summary" id="${vizId}">
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
            
            <!-- Meal Cards -->
            <div class="diet-visualization">
        `;
        
        meals.forEach(meal => {
            html += `
                <div class="diet-card">
                    <div class="diet-card-header">
                        <div class="meal-time">${meal.time}</div>
                        <div class="meal-calories">${meal.calories} cal</div>
                    </div>
                    <div class="diet-items">
            `;
            
            meal.items.forEach(item => {
                html += `
                    <div class="diet-item">
                        <div class="item-name">${item.name}</div>
                        <div class="item-macros">${item.protein}P ${item.carbs}C ${item.fat}F</div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            
            <!-- Chart -->
            <div class="chart-container">
                <canvas id="diet-chart-${vizId}"></canvas>
            </div>
        </div>
        `;
        
        // Render chart after HTML is inserted
        setTimeout(() => this.renderDietChart(meals, totals, `diet-chart-${vizId}`), 100);
        
        return html;
    }

    parseMealData(content) {
        const meals = [];
        const lines = content.split('\n');
        let currentMeal = null;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            
            // Detect meal times
            const mealTimeMatch = trimmed.match(/^(Breakfast|Lunch|Dinner|Snack|Meal \d+)/i);
            if (mealTimeMatch) {
                if (currentMeal) meals.push(currentMeal);
                currentMeal = {
                    time: mealTimeMatch[0],
                    items: [],
                    calories: 0
                };
            }
            
            // Parse food items
            if (currentMeal && trimmed.includes('-')) {
                const parts = trimmed.split('-');
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const details = parts[1].trim();
                    
                    // Extract nutrition info
                    const caloriesMatch = details.match(/(\d+)\s*cal/);
                    const proteinMatch = details.match(/(\d+)\s*g?\s*prot?/i);
                    const carbsMatch = details.match(/(\d+)\s*g?\s*carbs?/i);
                    const fatMatch = details.match(/(\d+)\s*g?\s*fat/i);
                    
                    const item = {
                        name: name,
                        calories: caloriesMatch ? parseInt(caloriesMatch[1]) : 0,
                        protein: proteinMatch ? parseInt(proteinMatch[1]) : 0,
                        carbs: carbsMatch ? parseInt(carbsMatch[1]) : 0,
                        fat: fatMatch ? parseInt(fatMatch[1]) : 0
                    };
                    
                    currentMeal.items.push(item);
                    currentMeal.calories += item.calories;
                }
            }
        });
        
        if (currentMeal) meals.push(currentMeal);
        
        // If no structured meals found, create generic ones
        if (meals.length === 0) {
            return this.createSampleMeals();
        }
        
        return meals;
    }

    createSampleMeals() {
        return [
            {
                time: "Breakfast",
                calories: 450,
                items: [
                    { name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fat: 3 },
                    { name: "Banana", calories: 105, protein: 1, carbs: 27, fat: 0 },
                    { name: "Protein Shake", calories: 195, protein: 25, carbs: 10, fat: 2 }
                ]
            },
            {
                time: "Lunch",
                calories: 650,
                items: [
                    { name: "Grilled Chicken", calories: 165, protein: 31, carbs: 0, fat: 4 },
                    { name: "Brown Rice", calories: 215, protein: 5, carbs: 45, fat: 2 },
                    { name: "Mixed Vegetables", calories: 70, protein: 3, carbs: 12, fat: 0 }
                ]
            }
        ];
    }

    calculateNutritionTotals(meals) {
        const totals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        };
        
        meals.forEach(meal => {
            meal.items.forEach(item => {
                totals.calories += item.calories;
                totals.protein += item.protein;
                totals.carbs += item.carbs;
                totals.fat += item.fat;
            });
        });
        
        return totals;
    }

    renderDietChart(meals, totals, canvasId) {
        if (typeof Chart === 'undefined') return;
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        
        const mealNames = meals.map(meal => meal.time);
        const mealCalories = meals.map(meal => meal.calories);
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: mealNames,
                datasets: [{
                    data: mealCalories,
                    backgroundColor: [
                        'rgba(0, 122, 255, 0.8)',
                        'rgba(52, 199, 89, 0.8)',
                        'rgba(255, 149, 0, 0.8)',
                        'rgba(255, 59, 48, 0.8)',
                        'rgba(88, 86, 214, 0.8)'
                    ],
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${value} cal (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Chemical Structure Visualization
    detectChemicalStructure(content) {
        const chemPatterns = [
            /C\d*H\d*[NO]?\d*/i, // Chemical formulas
            /SMILES/i,
            /molecular/i,
            /compound/i,
            /chemical structure/i
        ];
        return chemPatterns.some(pattern => pattern.test(content));
    }

    createChemicalVisualization(content) {
        // Extract chemical formula
        const formulaMatch = content.match(/(C\d*H\d*[NO]?\d*)/i);
        const formula = formulaMatch ? formulaMatch[1] : 'C?H?';
        
        const vizId = 'chem-viz-' + Date.now();
        
        let html = `
        <div class="visualizer-container">
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <i class="fas fa-atom"></i>
                    Chemical Structure
                </div>
                <div class="visualizer-actions">
                    <button class="viz-btn" onclick="window.ventoraVisualizer.copyChemicalStructure('${vizId}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="viz-btn primary" onclick="window.ventoraVisualizer.exportChemicalToPDF('${vizId}')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
            
            <div class="chemical-structure" id="${vizId}">
                <div style="font-size: 1.5rem; margin-bottom: 15px; color: #4dabf7;">
                    ${formula}
                </div>
                <div style="font-family: monospace; white-space: pre; font-size: 0.9rem;">
        `;
        
        // Generate ASCII structure
        html += this.generateChemicalASCII(formula);
        
        html += `
                </div>
                <div style="margin-top: 15px; font-size: 0.9rem; color: var(--text-secondary);">
                    Molecular Visualization
                </div>
            </div>
            
            <!-- Molecular Info -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 20px;">
                <div class="nutrition-item">
                    <div class="nutrition-value">${formula}</div>
                    <div class="nutrition-label">Formula</div>
                </div>
                <div class="nutrition-item">
                    <div class="nutrition-value">${this.calculateMolecularWeight(formula)}</div>
                    <div class="nutrition-label">MW (g/mol)</div>
                </div>
                <div class="nutrition-item">
                    <div class="nutrition-value">${this.countAtoms(formula, 'C')}</div>
                    <div class="nutrition-label">Carbon Atoms</div>
                </div>
                <div class="nutrition-item">
                    <div class="nutrition-value">${this.countAtoms(formula, 'H')}</div>
                    <div class="nutrition-label">Hydrogen Atoms</div>
                </div>
            </div>
        </div>
        `;
        
        return html;
    }

    generateChemicalASCII(formula) {
        // Simple ASCII representation of chemical structures
        const structures = {
            'CH4': `   H
   |
H--C--H
   |
   H`,
            'C2H6': `H   H
 \\ /
  C
 / \\
H   H`,
            'C6H6': `    H
    |
H--C--C--H
|     |
C     C
|     |
H--C--C--H
    |
    H`
        };
        
        return structures[formula] || `H   H
 \\ /
  C
 / \\
H   H`;
    }

    calculateMolecularWeight(formula) {
        // Simplified molecular weight calculation
        const weights = { C: 12, H: 1, O: 16, N: 14 };
        let total = 0;
        
        formula.replace(/([CHON])(\d*)/g, (match, element, count) => {
            const num = count ? parseInt(count) : 1;
            total += (weights[element] || 0) * num;
        });
        
        return total;
    }

    countAtoms(formula, element) {
        const match = formula.match(new RegExp(`${element}(\\d*)`, 'i'));
        if (!match) return 0;
        return match[1] ? parseInt(match[1]) : 1;
    }

    // Chart Data Detection
    detectChartData(content) {
        const chartPatterns = [
            /data points/i,
            /values?:/i,
            /x-axis|y-axis/i,
            /graph|chart/i,
            /percentage|%/
        ];
        return chartPatterns.some(pattern => pattern.test(content));
    }

    createChartVisualization(content) {
        const data = this.extractChartData(content);
        const vizId = 'chart-viz-' + Date.now();
        
        let html = `
        <div class="visualizer-container">
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <i class="fas fa-chart-bar"></i>
                    Data Visualization
                </div>
                <div class="visualizer-actions">
                    <button class="viz-btn" onclick="window.ventoraVisualizer.copyChartData('${vizId}')">
                        <i class="fas fa-copy"></i> Copy Data
                    </button>
                    <button class="viz-btn primary" onclick="window.ventoraVisualizer.exportChartToPDF('${vizId}')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
            
            <div class="chart-container">
                <canvas id="${vizId}"></canvas>
            </div>
        </div>
        `;
        
        // Render chart after HTML is inserted
        setTimeout(() => this.renderDataChart(data, vizId), 100);
        
        return html;
    }

    extractChartData(content) {
        // Try to extract numerical data
        const numbers = content.match(/\d+(\.\d+)?/g) || [];
        const labels = ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5'];
        
        return {
            labels: labels.slice(0, Math.min(5, numbers.length)),
            values: numbers.slice(0, 5).map(Number)
        };
    }

    renderDataChart(data, canvasId) {
        if (typeof Chart === 'undefined') return;
        
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Values',
                    data: data.values,
                    backgroundColor: 'rgba(0, 122, 255, 0.8)',
                    borderColor: 'rgba(0, 122, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'white'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    // Flow Chart Detection
    detectProcessFlow(content) {
        return content.includes('process') || 
               content.includes('flow') || 
               content.includes('steps') ||
               content.match(/\d+\.\s+[A-Z]/i);
    }

    createFlowChart(content) {
        const vizId = 'flow-viz-' + Date.now();
        
        let html = `
        <div class="visualizer-container">
            <div class="visualizer-header">
                <div class="visualizer-title">
                    <i class="fas fa-project-diagram"></i>
                    Process Flow
                </div>
                <div class="visualizer-actions">
                    <button class="viz-btn" onclick="window.ventoraVisualizer.copyFlowChart('${vizId}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="viz-btn primary" onclick="window.ventoraVisualizer.exportFlowToPDF('${vizId}')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
            
            <div class="flow-chart" id="${vizId}">
                <div class="mermaid">
                    graph TD
                    A[Start] --> B[Process 1]
                    B --> C{Decision}
                    C -->|Yes| D[Process 2]
                    C -->|No| E[Process 3]
                    D --> F[End]
                    E --> F
                </div>
            </div>
        </div>
        `;
        
        // Initialize mermaid
        setTimeout(() => {
            if (typeof mermaid !== 'undefined') {
                mermaid.init(undefined, document.querySelector(`#${vizId} .mermaid`));
            }
        }, 200);
        
        return html;
    }

    // Export Functions
    async copyTable(tableId) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const range = document.createRange();
        range.selectNode(table);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        
        try {
            await navigator.clipboard.writeText(table.innerText);
            this.showToast('Table copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        
        window.getSelection().removeAllRanges();
    }

    async exportTableToPDF(tableId) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const table = document.getElementById(tableId);
        
        // Create a simple PDF table
        const headers = [];
        const rows = [];
        
        // Extract table data
        const ths = table.querySelectorAll('th');
        ths.forEach(th => headers.push(th.textContent));
        
        const trs = table.querySelectorAll('tbody tr');
        trs.forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => row.push(td.textContent));
            rows.push(row);
        });
        
        // Generate PDF (simplified version)
        doc.text('Ventora AI - Table Export', 10, 10);
        doc.text(new Date().toLocaleDateString(), 10, 20);
        
        let y = 40;
        doc.text(headers.join(' | '), 10, y);
        y += 10;
        
        rows.forEach(row => {
            doc.text(row.join(' | '), 10, y);
            y += 10;
        });
        
        doc.save(`ventora-table-${Date.now()}.pdf`);
        this.showToast('Table exported as PDF!');
    }

    copyDietPlan(vizId) {
        const container = document.getElementById(vizId);
        if (!container) return;
        
        // Extract text from diet plan
        let text = "Ventora AI - Diet Plan\n\n";
        
        const mealCards = container.parentElement.querySelectorAll('.diet-card');
        mealCards.forEach(card => {
            const time = card.querySelector('.meal-time').textContent;
            const calories = card.querySelector('.meal-calories').textContent;
            text += `${time} (${calories}):\n`;
            
            const items = card.querySelectorAll('.diet-item');
            items.forEach(item => {
                const name = item.querySelector('.item-name').textContent;
                const macros = item.querySelector('.item-macros').textContent;
                text += `  • ${name} [${macros}]\n`;
            });
            text += '\n';
        });
        
        navigator.clipboard.writeText(text)
            .then(() => this.showToast('Diet plan copied!'))
            .catch(err => console.error('Copy failed:', err));
    }

    exportDietToPDF(vizId) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text('Ventora AI - Diet Plan', 10, 10);
        doc.text('Generated: ' + new Date().toLocaleDateString(), 10, 20);
        
        // Add nutrition summary
        const nutritionItems = document.querySelectorAll('.nutrition-item');
        let y = 40;
        
        nutritionItems.forEach(item => {
            const value = item.querySelector('.nutrition-value').textContent;
            const label = item.querySelector('.nutrition-label').textContent;
            doc.text(`${label}: ${value}`, 10, y);
            y += 10;
        });
        
        y += 10;
        
        // Add meal details
        const mealCards = document.querySelectorAll('.diet-card');
        mealCards.forEach(card => {
            const time = card.querySelector('.meal-time').textContent;
            const calories = card.querySelector('.meal-calories').textContent;
            
            doc.setFont('helvetica', 'bold');
            doc.text(`${time} - ${calories}`, 10, y);
            doc.setFont('helvetica', 'normal');
            y += 10;
            
            const items = card.querySelectorAll('.diet-item');
            items.forEach(item => {
                const name = item.querySelector('.item-name').textContent;
                const macros = item.querySelector('.item-macros').textContent;
                doc.text(`  • ${name} (${macros})`, 15, y);
                y += 10;
            });
            
            y += 5;
        });
        
        doc.save(`ventora-diet-${Date.now()}.pdf`);
        this.showToast('Diet plan exported as PDF!');
    }

    // Utility Functions
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message) {
        // Create toast if it doesn't exist
        let toast = document.querySelector('.viz-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'viz-toast';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize global instance
window.ventoraVisualizer = new VentoraVisualizer();
