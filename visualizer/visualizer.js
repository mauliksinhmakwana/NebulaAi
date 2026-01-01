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
        if (text.includes('[TABLE]') || text.includes('[CHART]') || 
            text.includes('[DIET_PLAN]') || text.includes('[PROCESS_STEPS]')) {
            
            // Try to extract JSON data
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                try {
                    const jsonData = JSON.parse(jsonMatch[1]);
                    return this.createVisualization(jsonData);
                } catch (e) {
                    console.error('Failed to parse visualization JSON:', e);
                    return text; // Return original text if parsing fails
                }
            }
        }
        
        return text; // Return original text if no visualization
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
        
        let tableHTML = '<table class="viz-table">';
        
        // Header row
        if (headers.length > 0) {
            tableHTML += '<thead><tr>';
            headers.forEach(header => {
                tableHTML += `<th>${header}</th>`;
            });
            tableHTML += '</tr></thead>';
        }
        
        // Data rows
        tableHTML += '<tbody>';
        rows.forEach(row => {
            tableHTML += '<tr>';
            row.forEach(cell => {
                tableHTML += `<td>${cell}</td>`;
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
        
        meals.forEach((meal, index) => {
            dietHTML += `
                <div class="diet-card">
                    <div class="diet-card-header">
                        <span class="meal-time">${meal.time || 'Meal'}</span>
                        <span class="meal-calories">${meal.calories || '0'} cal</span>
                    </div>
                    <h4 class="meal-title">${meal.name || 'Meal ' + (index + 1)}</h4>
                    <p class="meal-description">${meal.description || ''}</p>
                    
                    ${meal.nutrients ? `
                        <div class="nutrients-grid">
                            ${Object.entries(meal.nutrients).map(([key, value]) => `
                                <div class="nutrient-item">
                                    <div class="nutrient-value">${value}</div>
                                    <div class="nutrient-label">${key}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
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
                    backgroundColor: 'rgba(0, 122, 255, 0.5)',
                    borderColor: 'rgba(0, 122, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.8)'
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
        
        new Chart(ctx, config);
    }
    
    createProcessSteps(data, id) {
        const steps = data.steps || [];
        const title = data.title || 'Process Steps';
        
        let stepsHTML = '<div class="process-steps">';
        
        steps.forEach((step, index) => {
            stepsHTML += `
                <div class="process-step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-content">
                        <h4 class="step-title">${step.title || 'Step ' + (index + 1)}</h4>
                        <p class="step-description">${step.description || ''}</p>
                    </div>
                </div>
            `;
        });
        
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
        
        return `
            <div class="visualizer-container" id="${id}" data-viz-type="${type}" data-viz-data='${JSON.stringify(data).replace(/'/g, "&#39;")}'>
                <div class="visualizer-header">
                    <div class="visualizer-title">
                        <i class="fas fa-chart-bar"></i>
                        ${title}
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
        });
    }
    
    tableToText(data) {
        const headers = data.headers || [];
        const rows = data.rows || [];
        
        let text = data.title || 'Table\n';
        text += '\n';
        
        // Headers
        text += headers.join('\t') + '\n';
        
        // Rows
        rows.forEach(row => {
            text += row.join('\t') + '\n';
        });
        
        return text;
    }
    
    dietPlanToText(data) {
        const meals = data.meals || [];
        
        let text = data.title || 'Diet Plan\n';
        text += '\n';
        
        meals.forEach((meal, index) => {
            text += `${meal.time || 'Meal'}: ${meal.name}\n`;
            text += `Calories: ${meal.calories || '0'}\n`;
            text += `Description: ${meal.description || ''}\n`;
            
            if (meal.nutrients) {
                Object.entries(meal.nutrients).forEach(([key, value]) => {
                    text += `${key}: ${value}\n`;
                });
            }
            
            text += '\n';
        });
        
        return text;
    }
    
    toggleExportMenu(id, event) {
        event.stopPropagation();
        const menu = document.getElementById(`${id}-export-menu`);
        const allMenus = document.querySelectorAll('.export-menu');
        
        allMenus.forEach(m => {
            if (m !== menu) m.classList.remove('show');
        });
        
        menu.classList.toggle('show');
    }
    
    toggleFullscreen(id) {
        const container = document.getElementById(id);
        container.classList.toggle('fullscreen');
        
        const btn = container.querySelector('.fullscreen i');
        if (container.classList.contains('fullscreen')) {
            btn.className = 'fas fa-compress';
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
        
        html2canvas(container).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Add header
            pdf.setFontSize(20);
            pdf.setTextColor(0, 122, 255);
            pdf.text('VENTORA AI', 105, 15, null, null, 'center');
            
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.text('Visualization Export', 105, 22, null, null, 'center');
            
            // Add title
            pdf.setFontSize(16);
            pdf.setTextColor(0, 0, 0);
            pdf.text(title, 20, 35);
            
            // Add date
            pdf.setFontSize(10);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);
            
            // Add visualization image
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
            
            // Add footer
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text('Generated by Ventora AI - https://ventora.ai', 105, 290, null, null, 'center');
            
            pdf.save(`ventora-${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
            this.showToast('PDF exported successfully!');
        });
    }
    
    exportAsExcel(id) {
        const container = document.getElementById(id);
        const data = JSON.parse(container.dataset.vizData || '{}');
        
        this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', () => {
            let workbook = XLSX.utils.book_new();
            
            if (data.type === 'table') {
                // Convert table data to worksheet
                const headers = data.headers || [];
                const rows = data.rows || [];
                const worksheetData = [headers, ...rows];
                const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
                XLSX.utils.book_append_sheet(workbook, worksheet, data.title || 'Sheet1');
            } else if (data.type === 'diet_plan') {
                // Convert diet plan to worksheet
                const meals = data.meals || [];
                const worksheetData = [
                    ['Time', 'Meal', 'Calories', 'Description', 'Nutrients'],
                    ...meals.map(meal => [
                        meal.time || '',
                        meal.name || '',
                        meal.calories || '0',
                        meal.description || '',
                        meal.nutrients ? JSON.stringify(meal.nutrients) : ''
                    ])
                ];
                const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Diet Plan');
            }
            
            // Generate and download Excel file
            XLSX.writeFile(workbook, `ventora-${data.title || 'export'}.xlsx`);
            this.showToast('Excel file exported!');
        });
    }
    
    exportAsImage(id) {
        const container = document.getElementById(id);
        
        this.loadScript('https://html2canvas.hertzen.com/dist/html2canvas.min.js', () => {
            html2canvas(container).then(canvas => {
                const link = document.createElement('a');
                link.download = `ventora-visualization-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                this.showToast('Image exported!');
            });
        });
    }
    
    loadScript(url, callback) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }
    
    showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.export-toast');
        if (existingToast) existingToast.remove();
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'export-toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
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
        
        console.log('Visualizer hooked into chat system');
    }
}

// Initialize global instance
window.ventoraViz = new VentoraVisualizer();
