// Ventora Visualizer - Export Utilities
class VentoraExport {
    constructor() {
        this.exportQueue = [];
    }
    
    // Create Excel file from table data
    createExcelFromTable(data) {
        const { headers, rows } = data;
        
        // Create worksheet
        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        
        return wb;
    }
    
    // Create Excel file from diet plan
    createExcelFromDietPlan(data) {
        const { meals } = data;
        
        // Prepare worksheet data
        const wsData = [
            ['Time', 'Meal Name', 'Calories', 'Description', 'Protein', 'Carbs', 'Fat', 'Fiber']
        ];
        
        meals.forEach(meal => {
            wsData.push([
                meal.time || '',
                meal.name || '',
                meal.calories || '0',
                meal.description || '',
                meal.nutrients?.protein || '',
                meal.nutrients?.carbs || '',
                meal.nutrients?.fat || '',
                meal.nutrients?.fiber || ''
            ]);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Diet Plan");
        
        return wb;
    }
    
    // Generate CSV from table data
    tableToCSV(data) {
        const { headers, rows } = data;
        
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
        });
        
        return csv;
    }
    
    // Generate CSV from diet plan
    dietPlanToCSV(data) {
        const { meals } = data;
        
        let csv = 'Time,Meal,Calories,Description,Protein,Carbs,Fat,Fiber\n';
        meals.forEach(meal => {
            csv += [
                meal.time || '',
                meal.name || '',
                meal.calories || '0',
                meal.description || '',
                meal.nutrients?.protein || '',
                meal.nutrients?.carbs || '',
                meal.nutrients?.fat || '',
                meal.nutrients?.fiber || ''
            ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
        });
        
        return csv;
    }
    
    // Download file
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Export instance
window.ventoraExport = new VentoraExport();
