/* ======================================================
   Ventora Interaction Visualizer (VIV)
   Protocol-driven (VVRP)
   ====================================================== */

class VentoraVisualizer {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        console.log("Ventora Visualizer initialized");
    }

    /* ============================
       MAIN ENTRY
       ============================ */
    processMessage(messageElement, rawText) {
        this.init();

        const vizBlock = this.extractVizBlock(rawText);
        if (!vizBlock) return false; // Normal conversation

        // Hide normal AI text
        messageElement.innerHTML = "";

        switch (vizBlock.type) {
            case "TABLE":
                this.renderTable(messageElement, vizBlock.content);
                break;
            case "DIET":
                this.renderDiet(messageElement, vizBlock.content);
                break;
            case "STEPS":
                this.renderSteps(messageElement, vizBlock.content);
                break;
            case "CHART":
                this.renderChart(messageElement, vizBlock.content);
                break;
            default:
                console.warn("Unknown VIZ type:", vizBlock.type);
                return false;
        }
        return true;
    }

    /* ============================
       PROTOCOL PARSER
       ============================ */
    extractVizBlock(text) {
        const match = text.match(/\[VIZ:(\w+)\]([\s\S]*?)\[\/VIZ\]/i);
        if (!match) return null;

        return {
            type: match[1].toUpperCase(),
            content: match[2].trim()
        };
    }

    /* ============================
       UI SHELL
       ============================ */
    createShell(title) {
        const wrap = document.createElement("div");
        wrap.className = "vdiv";

        wrap.innerHTML = `
          <div class="vdiv-header">
            <div class="vdiv-title">${title}</div>
            <div class="vdiv-actions">
              <button class="vdiv-btn copy">Copy</button>
              <button class="vdiv-btn export">Export</button>
              <button class="vdiv-btn expand">⤢</button>
            </div>
          </div>
          <div class="vdiv-body"></div>
        `;
        return wrap;
    }

    /* ============================
       TABLE
       ============================ */
    renderTable(container, content) {
        const lines = content.split("\n").filter(Boolean);
        const colLine = lines.find(l => l.startsWith("columns:"));
        const rowLines = lines.filter(l => l.startsWith("-"));

        if (!colLine || rowLines.length === 0) return;

        const columns = colLine
            .replace("columns:", "")
            .split("|")
            .map(c => c.trim());

        const data = rowLines.map(r => {
            const vals = r.replace("-", "").split("|").map(v => v.trim());
            const obj = {};
            columns.forEach((c, i) => (obj[c] = vals[i] || ""));
            return obj;
        });

        const box = this.createShell("TABLE");
        const body = box.querySelector(".vdiv-body");

        const tableDiv = document.createElement("div");
        body.appendChild(tableDiv);

        const table = new Tabulator(tableDiv, {
            data,
            layout: "fitDataStretch",
            columns: columns.map(c => ({ title: c, field: c }))
        });

        this.attachActions(box, () => table.getData(), tableDiv);
        container.appendChild(box);
    }

    /* ============================
       DIET
       ============================ */
    renderDiet(container, content) {
        const box = this.createShell("DIET PLAN");
        const body = box.querySelector(".vdiv-body");

        const meals = [];
        let currentMeal = null;

        content.split("\n").forEach(line => {
            line = line.trim();
            if (!line) return;

            if (line.toLowerCase().startsWith("meal:")) {
                if (currentMeal) meals.push(currentMeal);
                currentMeal = {
                    name: line.replace("meal:", "").trim(),
                    items: []
                };
            } else if (line.startsWith("-") && currentMeal) {
                currentMeal.items.push(line.replace("-", "").trim());
            }
        });
        if (currentMeal) meals.push(currentMeal);

        meals.forEach(meal => {
            const card = document.createElement("div");
            card.className = "vdiv-diet-card";

            card.innerHTML = `
              <div class="vdiv-diet-title">${meal.name}</div>
              ${meal.items.map(i => `<div class="vdiv-diet-item">${i}</div>`).join("")}
            `;
            body.appendChild(card);
        });

        this.attachActions(box, () => meals, body);
        container.appendChild(box);
    }

    /* ============================
       STEPS
       ============================ */
    renderSteps(container, content) {
        const box = this.createShell("STEPS");
        const body = box.querySelector(".vdiv-body");
        body.classList.add("vdiv-steps");

        content.split("\n").forEach(step => {
            if (!step.trim()) return;
            const div = document.createElement("div");
            div.className = "vdiv-step";
            div.textContent = step.trim();
            body.appendChild(div);
        });

        this.attachActions(box, () => content, body);
        container.appendChild(box);
    }

    /* ============================
       CHART
       ============================ */
    renderChart(container, content) {
        const labels = [];
        const values = [];

        content.split("\n").forEach(line => {
            if (line.startsWith("labels:"))
                labels.push(...line.replace("labels:", "").split("|").map(l => l.trim()));
            if (line.startsWith("values:"))
                values.push(...line.replace("values:", "").split("|").map(v => Number(v.trim())));
        });

        const box = this.createShell("CHART");
        const body = box.querySelector(".vdiv-body");

        const canvas = document.createElement("canvas");
        body.appendChild(canvas);

        new Chart(canvas, {
            type: "bar",
            data: {
                labels,
                datasets: [{ data: values }]
            }
        });

        this.attachActions(box, () => ({ labels, values }), body);
        container.appendChild(box);
    }

    /* ============================
       ACTIONS
       ============================ */
    attachActions(box, dataProvider, renderNode) {
        box.querySelector(".copy").onclick = () => {
            const data = dataProvider();
            navigator.clipboard.writeText(
                typeof data === "string" ? data : JSON.stringify(data, null, 2)
            );
        };

        box.querySelector(".export").onclick = () => {
            const choice = prompt("Export: pdf / image / excel");
            if (!choice) return;

            if (choice === "excel") {
                const ws = XLSX.utils.json_to_sheet(
                    Array.isArray(dataProvider()) ? dataProvider() : []
                );
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Ventora");
                XLSX.writeFile(wb, "ventora.xlsx");
            }

            if (choice === "image") {
                html2canvas(renderNode).then(c => {
                    const a = document.createElement("a");
                    a.href = c.toDataURL();
                    a.download = "ventora.png";
                    a.click();
                });
            }

            if (choice === "pdf") {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                pdf.text("Ventora AI", 14, 14);
                pdf.html(renderNode, {
                    callback: doc => doc.save("ventora.pdf")
                });
            }
        };

        box.querySelector(".expand").onclick = () => {
            box.classList.toggle("vdiv-fullscreen");
        };
    }
}

/* ============================
   GLOBAL INSTANCE
   ============================ */
window.VIV = new VentoraVisualizer();
