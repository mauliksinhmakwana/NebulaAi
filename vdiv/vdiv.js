// vdiv.js - Ventora Interaction Visualizer
async function visualizeContent(container, rawText) {
    // Parse for visuals (e.g., detect ```table
    const patterns = [
        { type: 'table', regex: /```table\s*([\s\S]*?)```/g, handler: renderTable },
        { type: 'chart', regex: /```chart\s*([\s\S]*?)```/g, handler: renderChart },
        { type: 'diet', regex: /```diet\s*([\s\S]*?)```/g, handler: renderDiet },
        { type: 'chemical', regex: /```chemical\s*SMILES\s*"([^"]+)"\s*```/g, handler: renderChemical }
    ];

    let processedText = rawText;
    patterns.forEach(({ regex, handler }) => {
        processedText = processedText.replace(regex, (match, data) => {
            const visId = `vis-${Math.random().toString(36).substr(2, 9)}`;
            setTimeout(() => handler(visId, data.trim()), 0); // Async render
            return `<div id="${visId}" class="vdiv-container"></div>`;
        });
    });

    container.innerHTML = processedText; // Update with placeholders filled later
}

function createVisWrapper(id, title) {
    const div = document.getElementById(id);
    div.innerHTML = `
        <div class="vdiv-header">
            <span class="vdiv-title">${title}</span>
            <div class="vdiv-actions">
                <button class="vdiv-btn copy" onclick="copyVis(this)">Copy</button>
                <button class="vdiv-btn export" onclick="exportToPDF(this)">Export PDF</button>
            </div>
        </div>
        <div class="vdiv-body"></div>
    `;
    return div.querySelector('.vdiv-body');
}

function renderTable(id, data) {
    const body = createVisWrapper(id, 'Table Visualization');
    try {
        const json = JSON.parse(data); // Assume JSON array of objects
        let html = '<table class="vdiv-table"><thead><tr>';
        Object.keys(json[0]).forEach(key => html += `<th>${key}</th>`);
        html += '</tr></thead><tbody>';
        json.forEach(row => {
            html += '<tr>';
            Object.values(row).forEach(val => html += `<td>${val}</td>`);
            html += '</tr>';
        });
        html += '</tbody></table>';
        body.innerHTML = html;
        $(body.querySelector('table')).DataTable({ paging: false, searching: false }); // DataTables for sorting
    } catch (e) { body.innerHTML = '<p>Error rendering table.</p>'; }
}

function renderChart(id, data) {
    const body = createVisWrapper(id, 'Chart Visualization');
    const canvas = document.createElement('canvas');
    body.appendChild(canvas);
    try {
        const config = JSON.parse(data); // e.g., { type: 'pie', data: {...} }
        new Chart(canvas, config);
    } catch (e) { body.innerHTML = '<p>Error rendering chart.</p>'; }
}

function renderDiet(id, data) {
    const body = createVisWrapper(id, 'Diet Plan Visualization');
    try {
        const diet = JSON.parse(data); // e.g., { calories: 2000, protein: 150, ... }
        // Render as pie chart
        const canvas = document.createElement('canvas');
        body.appendChild(canvas);
        new Chart(canvas, {
            type: 'pie',
            data: { labels: Object.keys(diet), datasets: [{ data: Object.values(diet), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }] },
            options: { responsive: true }
        });
        // Add list view
        let list = '<ul class="vdiv-diet">';
        Object.entries(diet).forEach(([key, val]) => list += `<li><strong>${key}:</strong> ${val}</li>`);
        list += '</ul>';
        body.innerHTML += list;
    } catch (e) { body.innerHTML = '<p>Error rendering diet plan.</p>'; }
}

function renderChemical(id, smiles) {
    const body = createVisWrapper(id, 'Chemical Structure');
    const canvas = document.createElement('canvas');
    canvas.width = 300; canvas.height = 200;
    body.appendChild(canvas);
    try {
        const drawer = new SmilesDrawer.Drawer({ width: 300, height: 200 });
        SmilesDrawer.parse(smiles, tree => drawer.draw(tree, canvas));
    } catch (e) { body.innerHTML = '<p>Error rendering structure.</p>'; }
}

async function copyVis(btn) {
    const vis = btn.closest('.vdiv-container');
    const text = vis.querySelector('.vdiv-body').innerText; // Or JSON.stringify for data
    await navigator.clipboard.writeText(text);
    btn.classList.add('success'); btn.textContent = 'Copied!';
    setTimeout(() => { btn.classList.remove('success'); btn.textContent = 'Copy'; }, 2000);
}

async function exportToPDF(btn) {
    const vis = btn.closest('.vdiv-container');
    const pdf = new jsPDF();
    const canvas = await html2canvas(vis);
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, 180, 0);
    pdf.save('ventora-visual.pdf');
    btn.classList.add('success'); btn.textContent = 'Exported!';
    setTimeout(() => { btn.classList.remove('success'); btn.textContent = 'Export PDF'; }, 2000);
}

// Global export for chat
function exportChatToPDF() {
    const pdf = new jsPDF();
    // Logic to capture entire chatContainer and add to PDF (similar to above, using html2canvas)
    html2canvas(document.getElementById('chat-container')).then(canvas => {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 180, 0);
        pdf.save('ventora-chat.pdf');
    });
}
