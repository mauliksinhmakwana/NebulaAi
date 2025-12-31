// vdiv/vdiv.js - Best Drug Interaction Visualizer using Cytoscape.js

function renderDrugInteraction(data) {
  const lastAIMsg = document.querySelector('.msg.ai:last-child');
  if (!lastAIMsg) return;

  // Create container
  const container = document.createElement('div');
  container.style.margin = '32px 0';
  container.style.padding = '24px';
  container.style.background = 'rgba(255, 255, 255, 0.04)';
  container.style.border = '1px solid rgba(255, 255, 255, 0.12)';
  container.style.borderRadius = '20px';
  container.style.backdropFilter = 'blur(15px)';

  // Title
  const title = document.createElement('h3');
  title.textContent = 'Drug & Food Interaction Map';
  title.style.fontSize = '1.5rem';
  title.style.fontWeight = '800';
  title.style.color = '#c4b5fd';
  title.style.textAlign = 'center';
  title.style.marginBottom = '24px';
  container.appendChild(title);

  // Cytoscape container
  const cyDiv = document.createElement('div');
  cyDiv.id = 'cytoscape-' + Date.now();
  cyDiv.style.width = '100%';
  cyDiv.style.height = '520px';
  cyDiv.style.background = 'rgba(0, 0, 0, 0.4)';
  cyDiv.style.borderRadius = '16px';
  cyDiv.style.border = '1px solid rgba(255, 255, 255, 0.08)';
  container.appendChild(cyDiv);

  // Legend
  const legend = document.createElement('div');
  legend.style.display = 'flex';
  legend.style.justifyContent = 'center';
  legend.style.flexWrap = 'wrap';
  legend.style.gap = '20px';
  legend.style.marginTop = '24px';
  legend.style.fontSize = '0.95rem';
  legend.style.color = '#bbb';
  legend.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px"><div style="width:24px;height:6px;background:#86efac;border-radius:4px"></div>Minor</div>
    <div style="display:flex;align-items:center;gap:10px"><div style="width:24px;height:6px;background:#fdba74;border-radius:4px"></div>Moderate</div>
    <div style="display:flex;align-items:center;gap:10px"><div style="width:24px;height:6px;background:#f87171;border-radius:4px"></div>Major (Caution)</div>
    <div style="display:flex;align-items:center;gap:10px"><div style="width:24px;height:6px;background:#4b5563;opacity:0.4;border-radius:4px"></div>No known</div>
  `;
  container.appendChild(legend);

  lastAIMsg.appendChild(container);

  // Prepare elements
  const elements = [];

  data.nodes.forEach((node, i) => {
    elements.push({
      data: { id: 'n' + i, label: node.name },
      classes: node.type || 'drug'
    });
  });

  data.edges.forEach(edge => {
    elements.push({
      data: {
        source: 'n' + edge.from,
        target: 'n' + edge.to,
        severity: edge.severity || 'none'
      }
    });
  });

  // Launch Cytoscape
  cytoscape({
    container: document.getElementById(cyDiv.id),
    elements: elements,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#8b5cf6',
          'label': 'data(label)',
          'color': '#fff',
          'text-outline-color': '#000',
          'text-outline-width': 4,
          'font-size': 16,
          'font-weight': 'bold',
          'width': 120,
          'height': 120,
          'text-valign': 'center',
          'text-halign': 'center',
          'border-width': 4,
          'border-color': '#a78bfa',
          'box-shadow': '0 0 40px #a78bfa'
        }
      },
      {
        selector: 'node.food',
        style: {
          'background-color': '#10b981',
          'border-color': '#34d399',
          'box-shadow': '0 0 40px #34d399'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 6,
          'line-color': '#666',
          'target-arrow-color': '#666',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier'
        }
      },
      {
        selector: 'edge[severity = "minor"]',
        style: { 'line-color': '#86efac', 'target-arrow-color': '#86efac' }
      },
      {
        selector: 'edge[severity = "moderate"]',
        style: { 'line-color': '#fdba74', 'target-arrow-color': '#fdba74' }
      },
      {
        selector: 'edge[severity = "major"]',
        style: { 'line-color': '#f87171', 'target-arrow-color': '#f87171', 'width': 10 }
      },
      {
        selector: 'edge[severity = "none"]',
        style: { 'line-color': '#4b5563', 'opacity': 0.3 }
      }
    ],
    layout: { name: 'circle', fit: true, padding: 60 },
    zoomingEnabled: true,
    userZoomingEnabled: true,
    panningEnabled: true,
    userPanningEnabled: true,
    wheelSensitivity: 0.1
  });

  scrollToBottom();
}
