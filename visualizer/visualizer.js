// Ventora Visualizer - Main Engine
class VentoraVisualizer {
    constructor() {
        this.visualizers = [];
        this.init();
    }
    
    init() {
        // Listen for new messages
        this.setupMessageObserver();
        
        // Load Chart.js and other dependencies
        this.loadDependencies();
        
        console.log('Ventora Visualizer initialized');
    }
    
    loadDependencies() {
        // Chart.js is loaded via CDN in HTML
        // Other dependencies will be loaded on-demand
    }
    
    setupMessageObserver() {
        // We'll process messages after they're added to the DOM
        // This will be called from main chat function
    }
    
    // Process AI response and check for visualizations
    processAIResponse(text) {
        // Check if response contains visualization markers
        const hasVizMarker = text.includes('[TABLE]') || text.includes('[CHART]') || 
            text.includes('[DIET_PLAN]') || text.includes('[PROCESS_STEPS]');
        
        if (!hasVizMarker) {
            return text;
        }
        
        console.log('Visualization detected in response:', text.substring(0, 200));
        
        // Try multiple JSON extraction patterns
        let jsonData = null;
        
        // Pattern 1: Standard ```json ... ```
        let match = text.match(/```json\s*\n([\s\S]*?)\n```/);
        if (match) {
            try {
                jsonData = JSON.parse(match[1].trim());
                console.log('✅ Extracted JSON via pattern 1');
            } catch (e) {
                console.log('❌ Pattern 1 failed:', e.message);
            }
        }
        
        // Pattern 2: `json ... ` (single backtick)
        if (!jsonData) {
            match = text.match(/`json\s*\n([\s\S]*?)\n`/);
            if (match) {
                try {
                    jsonData = JSON.parse(match[1].trim());
                    console.log('✅ Extracted JSON via pattern 2');
                } catch (e) {
                    console.log('❌ Pattern 2 failed:', e.message);
                }
            }
        }
        
        // Pattern 3: Look for JSON object directly after marker
        if (!jsonData) {
            const lines = text.split('\n');
            let jsonContent = '';
            let collecting = false;
            
            for (let line of lines) {
                const trimmed = line.trim();
                
                // Start collecting after marker
                if (trimmed.startsWith('[TABLE]') || trimmed.startsWith('[DIET_PLAN]') || 
                    trimmed.startsWith('[CHART]') || trimmed.startsWith('[PROCESS_STEPS]')) {
                    collecting = true;
                    continue;
                }
                
                // Stop if we hit another marker or empty code block
                if (collecting && (trimmed.startsWith('```') || trimmed.startsWith('[TABLE]') || 
                    trimmed.startsWith('[DIET_PLAN]') || trimmed === '')) {
                    break;
                }
                
                if (collecting) {
                    jsonContent += line + '\n';
                }
            }
            
            if (jsonContent.trim()) {
                // Clean the content
                let cleanJson = jsonContent
                    .replace(/`json/g, '')
                    .replace(/```/g, '')
                    .replace(/`/g, '')
                    .replace(/json/g, '')
                    .trim();
                
                // Remove any trailing backticks
                cleanJson = cleanJson.replace(/`+$/g, '').trim();
                
                try {
                    jsonData = JSON.parse(cleanJson);
                    console.log('✅ Extracted JSON via pattern 3');
                } catch (e) {
                    console.log('❌ Pattern 3 failed:', e.message);
                    console.log('Clean JSON attempted:', cleanJson);
                }
            }
        }
        
        // Pattern 4: Extract JSON between first { and last }
        if (!jsonData) {
            jsonData = this.emergencyJsonExtract(text);
            if (jsonData) {
                console.log('✅ Extracted JSON via emergency pattern');
            }
        }
        
        if (jsonData) {
            console.log('✅ Successfully parsed JSON:', jsonData.type, jsonData.title);
            return this.createVisualization(jsonData);
        } else {
            console.log('❌ Could not extract JSON, returning original text');
            // Still try to show something useful
            return this.createFallbackVisualization(text);
        }
    }
    
    // Emergency JSON extraction - very forgiving
    emergencyJsonExtract(text) {
        try {
            // Find the first { and last }
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            
            if (start === -1 || end === -1 || end <= start) {
                return null;
            }
            
            let jsonStr = text.substring(start, end + 1);
            
            // Clean common issues
            jsonStr = jsonStr
                .replace(/\n/g, ' ')           // Replace newlines with spaces
                .replace(/\s+/g, ' ')          // Normalize whitespace
                .replace(/`json/g, '')
                .replace(/```/g, '')
                .replace(/`/g, '')
                .replace(/json/g, '')
                .replace(/'/g, '"')           // Replace single quotes with double
                .trim();
            
            // Fix common JSON issues
            jsonStr = jsonStr
                .replace(/(\w+):/g, '"$1":')  // Add quotes to keys
                .replace(/,\s*}/g, '}')       // Remove trailing commas
                .replace(/,\s*]/g, ']');      // Remove trailing commas in arrays
            
            // Try to parse
            return JSON.parse(jsonStr);
        } catch (e) {
            console.log('❌ Emergency extraction failed:', e.message);
            return null;
        }
    }
    
    // Create fallback visualization if JSON parsing fails
    createFallbackVisualization(text) {
        // Extract title from text
        let title = 'Visualization';
        if (text.includes('[TABLE]')) title = 'Data Table';
        if (text.includes('[DIET_PLAN]')) title = 'Diet Plan';
        if (text.includes('[CHART]')) title = 'Chart';
        if (text.includes('[PROCESS_STEPS]')) title = 'Process Steps';
        
        // Create a simple error display
        const id = 'viz-fallback-' + Date.now();
        
        return `
            <div class="visualizer-container" id="${id}">
                <div class="visualizer-header">
                    <div class="visualizer-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        ${title}
                        <span class="visualizer-type" style="background: rgba(255, 71, 87, 0.15); color: #ff4757;">Error</span>
                    </div>
                </div>
                <div class="visualizer-content">
                    <div style="color: #ff4757; padding: 20px; text-align: center;">
                        <p>Unable to parse visualization data.</p>
                        <p style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.6); margin-top: 10px;">
                            The AI response format was incorrect. Please try rephrasing your request.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    createVisualization(data) {
        const type = data.type || 'table';
        const id = 'viz-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        let html = '';
        
        switch(type) {
            case 'table':
                html = this.createTable(data, id);
                break;
            case 'diet_plan':
                html = this.createDietPlan(data, id);
                break;
            case 'chart':
                html = this.createChart(data, id);
                break;
            case 'process_steps':
                html = this.createProcessSteps(data, id);
                break;
            default:
                return `<div class="visualizer-error">Unsupported visualization type: ${type}</div>`;
        }
        
        // Store visualization data
        this.visualizers.push({
            id: id,
            type: type,
            data: data,
            element: null
        });
        
        return html;
    }
    
    createTable(data, id) {
        const headers = data.headers || [];
        const rows = data.rows || [];
        const title = data.title || 'Data Table';
        
        // Validate data
        if (headers.length === 0 && rows.length > 0) {
            // Generate headers if missing
            for (let i = 0; i < rows[0].length; i++) {
                headers.push(`Column ${i + 1}`);
            }
        }
        
        let tableHTML = '<table class="viz-table">';
        
        // Header row
        if (headers.length > 0) {
            tableHTML += '<thead><tr>';
            headers.forEach(header => {
                tableHTML += `<th>${this.escapeHtml(header)}</th>`;
            });
            tableHTML += '</tr></thead>';
        }
        
        // Data rows
        tableHTML += '<tbody>';
        rows.forEach(row => {
            tableHTML += '<tr>';
            row.forEach(cell => {
                tableHTML += `<td>${this.escapeHtml(cell)}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        
        return this.wrapVisualization(id, 'table', title, tableHTML, data);
    }
    
    createDietPlan(data, id) {
        const meals = data.meals || [];
        const title = data.title || 'Diet Plan';
        
        let dietHTML = '<div class="diet-plan-container">';
        
        if (meals.length === 0) {
            dietHTML += '<div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.5);">No meal data available</div>';
        } else {
            meals.forEach((meal, index) => {
                dietHTML += `
                    <div class="diet-card">
                        <div class="diet-card-header">
                            <span class="meal-time">${this.escapeHtml(meal.time || `Meal ${index + 1}`)}</span>
                            <span class="meal-calories">${this.escapeHtml(meal.calories || '0')} cal</span>
                        </div>
                        <h4 class="meal-title">${this.escapeHtml(meal.name || `Meal ${index + 1}`)}</h4>
                        <p class="meal-description">${this.escapeHtml(meal.description || '')}</p>
                        
                        ${meal.nutrients ? `
                            <div class="nutrients-grid">
                                ${Object.entries(meal.nutrients).map(([key, value]) => `
                                    <div class="nutrient-item">
                                        <div class="nutrient-value">${this.escapeHtml(value)}</div>
                                        <div class="nutrient-label">${this.escapeHtml(key)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        }
        
        dietHTML += '</div>';
        
        return this.wrapVisualization(id, 'diet_plan', title, dietHTML, data);
    }
    
    createChart(data, id) {
        const title = data.title || 'Chart';
        const chartData = data.chartData || {};
        
        // Create canvas for Chart.js
        const chartHTML = `<div class="chart-container"><canvas id="${id}-chart"></canvas></div>`;
        
        // Return wrapper with canvas
        const wrapper = this.wrapVisualization(id, 'chart', title, chartHTML, data);
        
        // Initialize chart after DOM is ready
        setTimeout(() => this.initChart(id, chartData), 100);
        
        return wrapper;
    }
    
    initChart(id, chartData) {
        const canvas = document.getElementById(`${id}-chart`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Default chart config
        const config = {
            type: chartData.type || 'bar',
            data: {
                labels: chartData.labels || [],
                datasets: chartData.datasets || [{
                    label: 'Data',
                    data: chartData.data || [],
                    backgroundColor: [
                        'rgba(0, 122, 255, 0.5)',
                        'rgba(52, 199, 89, 0.5)',
                        'rgba(255, 149, 0, 0.5)',
                        'rgba(255, 45, 85, 0.5)',
                        'rgba(88, 86, 214, 0.5)'
                    ],
                    borderColor: [
                        'rgba(0, 122, 255, 1)',
                        'rgba(52, 199, 89, 1)',
                        'rgba(255, 149, 0, 1)',
                        'rgba(255, 45, 85, 1)',
                        'rgba(88, 86, 214, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        }
                    }
                }
            }
        };
        
        // Merge custom config if provided
        if (chartData.config) {
            Object.assign(config, chartData.config);
        }
        
        try {
            new Chart(ctx, config);
        } catch (e) {
            console.error('Chart creation failed:', e);
        }
    }
    
    createProcessSteps(data, id) {
        const steps = data.steps || [];
        const title = data.title || 'Process Steps';
        
        let stepsHTML = '<div class="process-steps">';
        
        if (steps.length === 0) {
            stepsHTML += '<div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.5);">No steps available</div>';
        } else {
            steps.forEach((step, index) => {
                stepsHTML += `
                    <div class="process-step">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <h4 class="step-title">${this.escapeHtml(step.title || `Step ${index + 1}`)}</h4>
                            <p class="step-description">${this.escapeHtml(step.description || '')}</p>
                        </div>
                    </div>
                `;
            });
        }
        
        stepsHTML += '</div>';
        
        return this.wrapVisualization(id, 'process_steps', title, stepsHTML, data);
    }
    
    wrapVisualization(id, type, title, content, data) {
        const typeLabels = {
            'table': 'Table',
            'diet_plan': 'Diet Plan',
            'chart': 'Chart',
            'process_steps': 'Process'
        };
        
        // Escape data for HTML attribute
        const escapedData = JSON.stringify(data).replace(/"/g, '&quot;');
        
        return `
            <div class="visualizer-container" id="${id}" data-viz-type="${type}" data-viz-data="${escapedData}">
                <div class="visualizer-header">
                    <div class="visualizer-title">
                        <i class="fas ${this.getIconForType(type)}"></i>
                        ${this.escapeHtml(title)}
                        <span class="visualizer-type">${typeLabels[type] || type}</span>
                    </div>
                    <div class="visualizer-toolbar">
                        <button class="viz-toolbar-btn copy" title="Copy" onclick="window.ventoraViz.copyVisualization('${id}')">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="viz-toolbar-btn export" title="Export" onclick="window.ventoraViz.toggleExportMenu('${id}', event)">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="viz-toolbar-btn fullscreen" title="Fullscreen" onclick="window.ventoraViz.toggleFullscreen('${id}')">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
                <div class="visualizer-content">
                    ${content}
                </div>
                <div class="export-menu" id="${id}-export-menu">
                    <div class="export-option pdf" onclick="window.ventoraViz.exportAsPDF('${id}')">
                        <i class="fas fa-file-pdf"></i>
                        Export as PDF
                    </div>
                    <div class="export-option excel" onclick="window.ventoraViz.exportAsExcel('${id}')">
                        <i class="fas fa-file-excel"></i>
                        Export as Excel
                    </div>
                    <div class="export-option image" onclick="window.ventoraViz.exportAsImage('${id}')">
                        <i class="fas fa-image"></i>
                        Export as Image
                    </div>
                </div>
            </div>
        `;
    }
    
    getIconForType(type) {
        const icons = {
            'table': 'fa-table',
            'diet_plan': 'fa-utensils',
            'chart': 'fa-chart-bar',
            'process_steps': 'fa-list-ol'
        };
        return icons[type] || 'fa-chart-bar';
    }
    
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Export functionality
    copyVisualization(id) {
        const container = document.getElementById(id);
        if (!container) return;
        
        const data = JSON.parse(container.dataset.vizData || '{}');
        
        // Create text representation
        let text = '';
        if (data.type === 'table') {
            text = this.tableToText(data);
        } else if (data.type === 'diet_plan') {
            text = this.dietPlanToText(data);
        } else {
            text = JSON.stringify(data, null, 2);
        }
        
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied to clipboard!');
        }).catch(err => {
            console.error('Copy failed:', err);
            this.showToast('Copy failed. Please try again.');
        });
    }
    
    tableToText(data) {
        const headers = data.headers || [];
        const rows = data.rows || [];
        
        let text = data.title || 'Table\n';
        text += '\n';
        
        // Headers
        text += headers.join('\t') + '\n';
        
        // Separator
        text += headers.map(h => '-'.repeat(h.length)).join('\t') + '\n';
        
        // Rows
        rows.forEach(row => {
            text += row.join('\t') + '\n';
        });
        
        return text;
    }
    
    dietPlanToText(data) {
        const meals = data.meals || [];
        
        let text = data.title || 'Diet Plan\n';
        text += '='.repeat(50) + '\n\n';
        
        meals.forEach((meal, index) => {
            text += `🍽️  ${meal.time || 'Meal'}: ${meal.name}\n`;
            text += `   Calories: ${meal.calories || '0'}\n`;
            if (meal.description) {
                text += `   Description: ${meal.description}\n`;
            }
            
            if (meal.nutrients) {
                text += '   Nutrients:\n';
                Object.entries(meal.nutrients).forEach(([key, value]) => {
                    text += `     • ${key}: ${value}\n`;
                });
            }
            
            text += '\n';
        });
        
        return text;
    }
    
    toggleExportMenu(id, event) {
        if (event) event.stopPropagation();
        const menu = document.getElementById(`${id}-export-menu`);
        const allMenus = document.querySelectorAll('.export-menu');
        
        allMenus.forEach(m => {
            if (m !== menu) m.classList.remove('show');
        });
        
        menu.classList.toggle('show');
        
        // Close menu when clicking elsewhere
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!menu.contains(e.target) && !event?.target?.closest('.export')) {
                    menu.classList.remove('show');
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 10);
    }
    
    toggleFullscreen(id) {
        const container = document.getElementById(id);
        if (!container) return;
        
        container.classList.toggle('fullscreen');
        
        const btn = container.querySelector('.fullscreen i');
        if (container.classList.contains('fullscreen')) {
            btn.className = 'fas fa-compress';
            // Add escape key handler
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    container.classList.remove('fullscreen');
                    btn.className = 'fas fa-expand';
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        } else {
            btn.className = 'fas fa-expand';
        }
    }
    
    exportAsPDF(id) {
        this.showToast('Preparing PDF export...');
        
        // Load jsPDF and html2canvas dynamically
        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', () => {
            this.loadScript('https://html2canvas.hertzen.com/dist/html2canvas.min.js', () => {
                this.generatePDF(id);
            });
        });
    }
    
    generatePDF(id) {
        const container = document.getElementById(id);
        const data = JSON.parse(container.dataset.vizData || '{}');
        const title = data.title || 'Ventora Visualization';
        
        // Show loading
        this.showToast('Generating PDF...');
        
        html2canvas(container, {
            backgroundColor: '#0a0a0a',
            scale: 2,
            useCORS: true,
            logging: false
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Add header
            pdf.setFontSize(20);
            pdf.setTextColor(0, 122, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.text('VENTORA AI', pageWidth / 2, 15, { align: 'center' });
            
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Visualization Export', pageWidth / 2, 22, { align: 'center' });
            
            // Add title
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
            pdf.text(title, 20, 35);
            
            // Add date
            pdf.setFontSize(10);
            pdf.setTextColor(150, 150, 150);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 20, 42);
            
            // Add visualization image
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
            
            // Add footer
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text('Generated by Ventora AI', pageWidth / 2, 290, { align: 'center' });
            
            pdf.save(`ventora-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.pdf`);
            this.showToast('PDF exported successfully!');
        }).catch(err => {
            console.error('PDF generation failed:', err);
            this.showToast('PDF export failed. Please try again.', 'error');
        });
    }
    
    exportAsExcel(id) {
        const container = document.getElementById(id);
        const data = JSON.parse(container.dataset.vizData || '{}');
        
        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', () => {
            try {
                let workbook = XLSX.utils.book_new();
                let worksheet;
                
                if (data.type === 'table') {
                    // Convert table data to worksheet
                    const headers = data.headers || [];
                    const rows = data.rows || [];
                    const worksheetData = [headers, ...rows];
                    worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
                    XLSX.utils.book_append_sheet(workbook, worksheet, data.title?.substring(0, 31) || 'Sheet1');
                } else if (data.type === 'diet_plan') {
                    // Convert diet plan to worksheet
                    const meals = data.meals || [];
                    const worksheetData = [
                        ['Time', 'Meal', 'Calories', 'Description', 'Protein', 'Carbs', 'Fat', 'Fiber'],
                        ...meals.map(meal => [
                            meal.time || '',
                            meal.name || '',
                            meal.calories || '0',
                            meal.description || '',
                            meal.nutrients?.protein || '',
                            meal.nutrients?.carbs || '',
                            meal.nutrients?.fat || '',
                            meal.nutrients?.fiber || ''
                        ])
                    ];
                    worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Diet Plan');
                } else {
                    // Generic JSON export
                    worksheet = XLSX.utils.json_to_sheet([data]);
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
                }
                
                // Generate and download Excel file
                XLSX.writeFile(workbook, `ventora-${data.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'export'}-${Date.now()}.xlsx`);
                this.showToast('Excel file exported!');
            } catch (err) {
                console.error('Excel export failed:', err);
                this.showToast('Excel export failed. Please try again.', 'error');
            }
        });
    }
    
    exportAsImage(id) {
        const container = document.getElementById(id);
        
        this.loadScript('https://html2canvas.hertzen.com/dist/html2canvas.min.js', () => {
            this.showToast('Capturing image...');
            
            html2canvas(container, {
                backgroundColor: '#0a0a0a',
                scale: 2,
                useCORS: true,
                logging: false
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `ventora-visualization-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                this.showToast('Image exported!');
            }).catch(err => {
                console.error('Image export failed:', err);
                this.showToast('Image export failed. Please try again.', 'error');
            });
        });
    }
    
    loadScript(url, callback) {
        // Check if already loaded
        if (url.includes('jspdf') && window.jspdf) {
            callback();
            return;
        }
        if (url.includes('xlsx') && window.XLSX) {
            callback();
            return;
        }
        if (url.includes('html2canvas') && window.html2canvas) {
            callback();
            return;
        }
        
        const script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        script.onerror = () => {
            console.error('Failed to load script:', url);
            this.showToast('Failed to load export library. Please check connection.', 'error');
        };
        document.head.appendChild(script);
    }
    
    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.export-toast');
        if (existingToast) existingToast.remove();
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'export-toast';
        if (type === 'error') {
            toast.style.borderColor = 'rgba(255, 71, 87, 0.3)';
        }
        toast.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${message}`;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Hook into chat system
    hookIntoChatSystem() {
        // Override the formatAIResponse function to detect visualizations
        const originalFormatAIResponse = window.formatAIResponse;
        
        window.formatAIResponse = function(text) {
            // First check for visualizations
            const processed = window.ventoraViz.processAIResponse(text);
            if (processed !== text) {
                console.log('✅ Visualization created from AI response');
                return processed; // Return visualization instead of text
            }
            
            // Otherwise use original formatting
            if (originalFormatAIResponse) {
                return originalFormatAIResponse(text);
            }
            
            // Fallback
            return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`(.*?)`/g, '<code>$1</code>');
        };
        
        console.log('✅ Visualizer hooked into chat system');
    }
    
    // Test function
    testVisualization() {
        const testData = {
            type: 'table',
            title: 'Test Vitamin Comparison',
            headers: ['Vitamin', 'Function', 'Food Sources', 'Daily Need'],
            rows: [
                ['Vitamin A', 'Vision support', 'Carrots, Spinach', '900 mcg'],
                ['Vitamin B12', 'Energy production', 'Meat, Eggs', '2.4 mcg'],
                ['Vitamin C', 'Immune support', 'Oranges, Strawberries', '90 mg'],
                ['Vitamin D', 'Bone health', 'Sunlight, Fish', '600 IU']
            ]
        };
        
        const html = this.createVisualization(testData);
        
        // Add to chat for testing
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            const wrapper = document.createElement('div');
            wrapper.className = 'msg-wrapper ai-wrapper';
            const msgDiv = document.createElement('div');
            msgDiv.className = 'msg ai';
            msgDiv.innerHTML = html;
            wrapper.appendChild(msgDiv);
            chatContainer.appendChild(wrapper);
            
            // Show toast
            this.showToast('Test visualization added!');
            
            // Scroll to bottom
            if (typeof scrollToBottom === 'function') {
                scrollToBottom();
            }
        }
    }
}

// Initialize global instance
window.ventoraViz = new VentoraVisualizer();

// Test function - call window.testViz() in console to test
window.testViz = () => window.ventoraViz.testVisualization();
