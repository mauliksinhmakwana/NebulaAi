// goal/goal.js - Diet Plan Edition with AI Integration

// Food database with nutrition information
const FOOD_DATABASE = {
    'chicken breast': { protein: 31, carbs: 0, fat: 3.6, calories: 165, category: 'protein' },
    'brown rice': { protein: 2.6, carbs: 23, fat: 0.9, calories: 111, category: 'carbs' },
    'broccoli': { protein: 2.8, carbs: 7, fat: 0.4, calories: 34, category: 'vegetable' },
    'salmon': { protein: 25, carbs: 0, fat: 13, calories: 206, category: 'protein' },
    'eggs': { protein: 13, carbs: 1.1, fat: 11, calories: 155, category: 'protein' },
    'avocado': { protein: 2, carbs: 9, fat: 15, calories: 160, category: 'fat' },
    'oats': { protein: 13, carbs: 66, fat: 7, calories: 389, category: 'carbs' },
    'banana': { protein: 1.3, carbs: 27, fat: 0.4, calories: 105, category: 'fruit' },
    'almonds': { protein: 21, carbs: 22, fat: 50, calories: 579, category: 'fat' },
    'spinach': { protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23, category: 'vegetable' },
    'sweet potato': { protein: 2, carbs: 20, fat: 0.2, calories: 90, category: 'carbs' },
    'greek yogurt': { protein: 10, carbs: 4, fat: 0.4, calories: 59, category: 'protein' },
    'quinoa': { protein: 4.4, carbs: 21, fat: 1.9, calories: 120, category: 'carbs' },
    'apple': { protein: 0.3, carbs: 14, fat: 0.2, calories: 52, category: 'fruit' },
    'protein powder': { protein: 25, carbs: 3, fat: 1, calories: 120, category: 'protein' },
    'whole wheat bread': { protein: 9, carbs: 49, fat: 3, calories: 265, category: 'carbs' },
    'milk': { protein: 3.5, carbs: 5, fat: 3.5, calories: 61, category: 'dairy' },
    'cheese': { protein: 25, carbs: 1, fat: 33, calories: 404, category: 'dairy' },
    'lentils': { protein: 9, carbs: 20, fat: 0.4, calories: 116, category: 'protein' },
    'tofu': { protein: 8, carbs: 2, fat: 4, calories: 76, category: 'protein' }
};

// Daily nutrition goals (can be customized)
const DAILY_GOALS = {
    protein: 100, // grams
    carbs: 200,   // grams
    fat: 70,      // grams
    calories: 2200 // kcal
};

// Initialize diet context for AI
window.dietContext = {
    getDietPlan: () => {
        const foods = JSON.parse(localStorage.getItem('ventora_foods')) || [];
        const notes = localStorage.getItem('ventora_study_notes') || '';
        
        // Calculate totals
        let totals = { protein: 0, carbs: 0, fat: 0, calories: 0 };
        foods.forEach(food => {
            const nutrition = calculateNutrition(food.name, food.quantity, food.unit);
            totals.protein += nutrition.protein;
            totals.carbs += nutrition.carbs;
            totals.fat += nutrition.fat;
            totals.calories += nutrition.calories;
        });
        
        return {
            foods: foods,
            notes: notes,
            totals: totals,
            goals: DAILY_GOALS,
            lastUpdated: new Date().toISOString()
        };
    },
    
    formatForAI: () => {
        const diet = window.dietContext.getDietPlan();
        let text = `=== DIET PLAN CONTEXT ===\n\n`;
        
        if (diet.foods.length === 0) {
            text += `No foods logged today.\n`;
        } else {
            text += `Today's Diet (${diet.foods.length} items):\n`;
            diet.foods.forEach((food, index) => {
                const nutrition = calculateNutrition(food.name, food.quantity, food.unit);
                text += `${index + 1}. ${food.quantity}${food.unit} ${food.name}: ${nutrition.protein}g protein, ${nutrition.carbs}g carbs, ${nutrition.fat}g fat, ${nutrition.calories} calories\n`;
            });
            
            text += `\nTOTALS: ${Math.round(diet.totals.protein)}g protein, ${Math.round(diet.totals.carbs)}g carbs, ${Math.round(diet.totals.fat)}g fat, ${diet.totals.calories} calories\n`;
            text += `GOALS: ${DAILY_GOALS.protein}g protein, ${DAILY_GOALS.carbs}g carbs, ${DAILY_GOALS.fat}g fat, ${DAILY_GOALS.calories} calories\n`;
            text += `PROGRESS: Protein ${Math.round((diet.totals.protein/DAILY_GOALS.protein)*100)}%, Carbs ${Math.round((diet.totals.carbs/DAILY_GOALS.carbs)*100)}%, Calories ${Math.round((diet.totals.calories/DAILY_GOALS.calories)*100)}%\n`;
        }
        
        if (diet.notes) {
            text += `\nDIET NOTES:\n${diet.notes}\n`;
        }
        
        text += `\n=== END DIET CONTEXT ===`;
        return text;
    }
};

let foods = JSON.parse(localStorage.getItem('ventora_foods')) || [];

function toggleGoalModal() {
    const modal = document.getElementById('goalModal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        renderDietPlan();
        updateSummary();
        showAISuggestion();
    }
}

// Close button functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add close button to modal
    const closeBtn = document.querySelector('.close-goal');
    if (closeBtn) {
        closeBtn.onclick = toggleGoalModal;
    }
    
    // Initialize notes
    initNotes();
    
    // Initialize diet context
    if (!window.dietContext) window.dietContext = {};
    
    // Auto-focus food name input when modal opens
    const modal = document.getElementById('goalModal');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (modal.classList.contains('active')) {
                    setTimeout(() => {
                        const input = document.getElementById('foodName');
                        if (input) input.focus();
                    }, 300);
                }
            }
        });
    });
    observer.observe(modal, { attributes: true });
});

function renderDietPlan() {
    const list = document.getElementById('taskList');
    
    if (foods.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-utensils"></i>
                </div>
                <h4>No foods added yet</h4>
                <p>Start by adding your first food item above</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="food-list">';
    
    foods.forEach((food, index) => {
        const nutrition = calculateNutrition(food.name, food.quantity, food.unit);
        
        html += `
            <div class="food-item" data-id="${index}">
                <div class="food-header">
                    <span class="food-name">${food.name.charAt(0).toUpperCase() + food.name.slice(1)}</span>
                    <span class="food-quantity">${food.quantity} ${food.unit}</span>
                </div>
                <div class="food-details">
                    <div class="food-detail">
                        <div class="detail-value">${nutrition.protein}g</div>
                        <div class="detail-label">Protein</div>
                    </div>
                    <div class="food-detail">
                        <div class="detail-value">${nutrition.carbs}g</div>
                        <div class="detail-label">Carbs</div>
                    </div>
                    <div class="food-detail">
                        <div class="detail-value">${nutrition.fat}g</div>
                        <div class="detail-label">Fat</div>
                    </div>
                    <div class="food-detail">
                        <div class="detail-value">${nutrition.calories}</div>
                        <div class="detail-label">Cal</div>
                    </div>
                </div>
                <div class="food-actions">
                    <button class="action-btn edit" onclick="editFood(${index})">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteFood(${index})">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    list.innerHTML = html;
}

function addFood() {
    const nameInput = document.getElementById('foodName');
    const quantityInput = document.getElementById('foodQuantity');
    const unitSelect = document.getElementById('foodUnit');
    
    const name = nameInput.value.trim().toLowerCase();
    const quantity = parseFloat(quantityInput.value);
    const unit = unitSelect.value;
    
    if (!name || !quantity || quantity <= 0) {
        showToast('Please enter valid food name and quantity', 'error');
        return;
    }
    
    // Check if food exists in database
    if (!FOOD_DATABASE[name]) {
        // Try AI prediction for unknown foods
        const prediction = predictNutrition(name);
        if (!prediction) {
            showToast('Food not recognized. Try a common food name.', 'error');
            return;
        }
        // Add to database for future use
        FOOD_DATABASE[name] = prediction;
    }
    
    // Check for duplicate food entries
    const existingIndex = foods.findIndex(f => 
        f.name === name && f.unit === unit
    );
    
    if (existingIndex > -1) {
        foods[existingIndex].quantity += quantity;
        showToast('Quantity updated for existing food', 'info');
    } else {
        foods.push({
            name: name,
            quantity: quantity,
            unit: unit,
            date: new Date().toISOString(),
            id: Date.now() + Math.random().toString(36).substr(2, 9)
        });
        showToast('Food added successfully!', 'success');
    }
    
    // Clear inputs
    nameInput.value = '';
    quantityInput.value = '100';
    nameInput.focus();
    
    saveAndRender();
    
    // Update AI context
    if (window.dietContext && window.dietContext.updateDietContext) {
        window.dietContext.updateDietContext();
    }
}

function calculateNutrition(foodName, quantity, unit) {
    const food = FOOD_DATABASE[foodName.toLowerCase()];
    if (!food) return { protein: 0, carbs: 0, fat: 0, calories: 0 };
    
    let multiplier = 1;
    
    // Convert units to grams for calculation
    switch(unit) {
        case 'g': multiplier = 1; break;
        case 'kg': multiplier = 1000; break;
        case 'ml': multiplier = 1; break;
        case 'l': multiplier = 1000; break;
        case 'cup': multiplier = 240; break;
        case 'tbsp': multiplier = 15; break;
        case 'tsp': multiplier = 5; break;
        case 'oz': multiplier = 28.35; break;
        case 'lb': multiplier = 453.6; break;
        case 'piece': multiplier = 100; break;
        case 'slice': multiplier = 30; break;
    }
    
    const actualQuantity = quantity * multiplier / 100; // Per 100g
    
    return {
        protein: Math.round((food.protein * actualQuantity) * 10) / 10,
        carbs: Math.round((food.carbs * actualQuantity) * 10) / 10,
        fat: Math.round((food.fat * actualQuantity) * 10) / 10,
        calories: Math.round(food.calories * actualQuantity)
    };
}

function predictNutrition(foodName) {
    const foodLower = foodName.toLowerCase();
    
    // Enhanced prediction with more categories
    if (foodLower.includes('chicken') || foodLower.includes('turkey') || foodLower.includes('poultry')) {
        return { protein: 25, carbs: 0, fat: 5, calories: 150, category: 'protein' };
    } else if (foodLower.includes('fish') || foodLower.includes('seafood') || foodLower.includes('shrimp')) {
        return { protein: 22, carbs: 0, fat: 10, calories: 180, category: 'protein' };
    } else if (foodLower.includes('beef') || foodLower.includes('pork') || foodLower.includes('lamb')) {
        return { protein: 26, carbs: 0, fat: 15, calories: 250, category: 'protein' };
    } else if (foodLower.includes('rice') || foodLower.includes('pasta') || foodLower.includes('noodles')) {
        return { protein: 3, carbs: 28, fat: 0.5, calories: 130, category: 'carbs' };
    } else if (foodLower.includes('bread') || foodLower.includes('toast') || foodLower.includes('bagel')) {
        return { protein: 9, carbs: 49, fat: 3, calories: 265, category: 'carbs' };
    } else if (foodLower.includes('fruit') || foodLower.includes('berry') || foodLower.includes('orange')) {
        return { protein: 1, carbs: 15, fat: 0.5, calories: 60, category: 'fruit' };
    } else if (foodLower.includes('vegetable') || foodLower.includes('salad') || foodLower.includes('carrot')) {
        return { protein: 2, carbs: 5, fat: 0.3, calories: 25, category: 'vegetable' };
    } else if (foodLower.includes('milk') || foodLower.includes('yogurt') || foodLower.includes('cream')) {
        return { protein: 3.5, carbs: 5, fat: 3.5, calories: 61, category: 'dairy' };
    } else if (foodLower.includes('cheese')) {
        return { protein: 25, carbs: 1, fat: 33, calories: 404, category: 'dairy' };
    } else if (foodLower.includes('nut') || foodLower.includes('seed') || foodLower.includes('walnut')) {
        return { protein: 20, carbs: 20, fat: 50, calories: 600, category: 'fat' };
    } else if (foodLower.includes('bean') || foodLower.includes('lentil') || foodLower.includes('chickpea')) {
        return { protein: 9, carbs: 20, fat: 0.4, calories: 116, category: 'protein' };
    } else if (foodLower.includes('potato') || foodLower.includes('corn') || foodLower.includes('pea')) {
        return { protein: 2, carbs: 17, fat: 0.1, calories: 77, category: 'carbs' };
    }
    
    return null;
}

function editFood(index) {
    const food = foods[index];
    const newQuantity = prompt(`Edit quantity for ${food.name}:`, food.quantity);
    
    if (newQuantity && !isNaN(newQuantity) && parseFloat(newQuantity) > 0) {
        foods[index].quantity = parseFloat(newQuantity);
        saveAndRender();
        showToast('Food updated!', 'success');
    }
}

function deleteFood(index) {
    if (confirm('Delete this food from your diet plan?')) {
        foods.splice(index, 1);
        saveAndRender();
        showToast('Food removed', 'info');
    }
}

function updateSummary() {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;
    
    foods.forEach(food => {
        const nutrition = calculateNutrition(food.name, food.quantity, food.unit);
        totalProtein += nutrition.protein;
        totalCarbs += nutrition.carbs;
        totalFat += nutrition.fat;
        totalCalories += nutrition.calories;
    });
    
    const proteinProgress = Math.min(100, Math.round((totalProtein / DAILY_GOALS.protein) * 100));
    const carbsProgress = Math.min(100, Math.round((totalCarbs / DAILY_GOALS.carbs) * 100));
    const caloriesProgress = Math.min(100, Math.round((totalCalories / DAILY_GOALS.calories) * 100));
    
    document.getElementById('totalProtein').textContent = `${Math.round(totalProtein)}g`;
    document.getElementById('totalCarbs').textContent = `${Math.round(totalCarbs)}g`;
    document.getElementById('totalCalories').textContent = Math.round(totalCalories);
    
    document.getElementById('proteinProgress').style.width = `${proteinProgress}%`;
    document.getElementById('carbsProgress').style.width = `${carbsProgress}%`;
    document.getElementById('caloriesProgress').style.width = `${caloriesProgress}%`;
}

function showAISuggestion() {
    const suggestionDiv = document.getElementById('aiSuggestion');
    if (!suggestionDiv) return;
    
    const totalProtein = foods.reduce((sum, food) => {
        const nutrition = calculateNutrition(food.name, food.quantity, food.unit);
        return sum + nutrition.protein;
    }, 0);
    
    const totalCarbs = foods.reduce((sum, food) => {
        const nutrition = calculateNutrition(food.name, food.quantity, food.unit);
        return sum + nutrition.carbs;
    }, 0);
    
    const proteinDiff = DAILY_GOALS.protein - totalProtein;
    const carbsDiff = DAILY_GOALS.carbs - totalCarbs;
    
    let suggestion = '';
    
    if (proteinDiff > 30 && carbsDiff > 50) {
        suggestion = `Need more protein (${Math.round(proteinDiff)}g) and carbs (${Math.round(carbsDiff)}g). Try chicken with brown rice or salmon with sweet potato.`;
    } else if (proteinDiff > 30) {
        suggestion = `Focus on protein: add ${Math.round(proteinDiff)}g more. Good options: chicken breast, Greek yogurt, eggs, or protein powder.`;
    } else if (carbsDiff > 50) {
        suggestion = `Need more energy: add ${Math.round(carbsDiff)}g carbs. Try brown rice, oats, bananas, or whole wheat bread.`;
    } else if (proteinDiff > 10) {
        suggestion = `Almost at protein goal! Just ${Math.round(proteinDiff)}g to go. A protein shake or handful of nuts would help.`;
    } else if (proteinDiff <= 10 && proteinDiff > 0) {
        suggestion = 'Great job! You\'re very close to your protein goal.';
    } else if (proteinDiff <= 0) {
        suggestion = 'Excellent! You\'ve met or exceeded your protein goal. Consider adding some healthy fats like avocado or nuts.';
    }
    
    // Only show suggestion if there are foods
    if (foods.length > 0 && suggestion) {
        suggestionDiv.innerHTML = `
            <div class="ai-header">
                <i class="fas fa-robot"></i>
                <h4>Ventora AI Suggestion</h4>
            </div>
            <div class="ai-message">${suggestion}</div>
        `;
        suggestionDiv.style.display = 'block';
    } else {
        suggestionDiv.style.display = 'none';
    }
}

function clearAllFoods() {
    if (confirm('Clear all foods from your diet plan?')) {
        foods = [];
        saveAndRender();
        showToast('All foods cleared', 'info');
    }
}

function exportDietPlan() {
    if (foods.length === 0) {
        showToast('No foods to export', 'error');
        return;
    }
    
    let content = `=== Ventora AI Diet Plan ===\n\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `Total Foods: ${foods.length}\n\n`;
    
    let totalProtein = 0;
    let totalCalories = 0;
    
    foods.forEach((food, index) => {
        const nutrition = calculateNutrition(food.name, food.quantity, food.unit);
        totalProtein += nutrition.protein;
        totalCalories += nutrition.calories;
        
        content += `${index + 1}. ${food.name} - ${food.quantity} ${food.unit}\n`;
        content += `   Protein: ${nutrition.protein}g | Carbs: ${nutrition.carbs}g | Fat: ${nutrition.fat}g | Calories: ${nutrition.calories}\n\n`;
    });
    
    content += `=== Summary ===\n`;
    content += `Total Protein: ${Math.round(totalProtein)}g\n`;
    content += `Total Calories: ${totalCalories}\n`;
    content += `Protein Goal: ${DAILY_GOALS.protein}g (${Math.round((totalProtein/DAILY_GOALS.protein)*100)}%)\n\n`;
    content += `Exported from Ventora AI Diet Tracker`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventora-diet-plan-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Diet plan exported!', 'success');
}

function saveAndRender() {
    localStorage.setItem('ventora_foods', JSON.stringify(foods));
    renderDietPlan();
    updateSummary();
    showAISuggestion();
    
    // Update the global diet context for AI
    if (window.dietContext) {
        window.dietContext.foods = foods;
        window.dietContext.lastUpdated = new Date().toISOString();
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `goal-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('active'), 10);
    
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Auto-save Notes
function initNotes() {
    const area = document.getElementById('study-notes-area');
    area.value = localStorage.getItem('ventora_study_notes') || '';
    
    let timer;
    area.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            localStorage.setItem('ventora_study_notes', area.value);
            // Update diet context
            if (window.dietContext) {
                window.dietContext.notes = area.value;
            }
        }, 1000);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initNotes();
    
    // Update the modal structure for diet plan
    const goalModal = document.getElementById('goalModal');
    if (goalModal) {
        const goalContent = goalModal.querySelector('.goal-content');
        if (goalContent) {
            goalContent.innerHTML = `
                <div class="goal-header">
                    <h3>YOUR DIET PLAN</h3>
                    <button class="close-goal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="goal-body">
                    <!-- Daily Summary -->
                    <div class="diet-summary">
                        <div class="summary-card">
                            <div class="summary-value" id="totalProtein">0g</div>
                            <div class="summary-label">Protein</div>
                            <div style="margin-top: 8px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;">
                                <div style="height: 100%; background: #007aff; border-radius: 2px; width: 0%;" id="proteinProgress"></div>
                            </div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-value" id="totalCarbs">0g</div>
                            <div class="summary-label">Carbs</div>
                            <div style="margin-top: 8px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;">
                                <div style="height: 100%; background: #2ed573; border-radius: 2px; width: 0%;" id="carbsProgress"></div>
                            </div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-value" id="totalCalories">0</div>
                            <div class="summary-label">Calories</div>
                            <div style="margin-top: 8px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;">
                                <div style="height: 100%; background: #ff6b81; border-radius: 2px; width: 0%;" id="caloriesProgress"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Add Food Section -->
                    <div class="add-food-section">
                        <div class="section-title">
                            <i class="fas fa-plus-circle"></i>
                            Add Food
                        </div>
                        <div class="food-form">
                            <input type="text" id="foodName" class="form-input" placeholder="e.g., chicken breast, brown rice" autocomplete="off">
                            <div class="form-row">
                                <input type="number" id="foodQuantity" class="form-input" placeholder="Quantity" value="100" min="1" step="1">
                                <select id="foodUnit" class="form-select">
                                    <option value="g">grams (g)</option>
                                    <option value="kg">kilograms (kg)</option>
                                    <option value="ml">milliliters (ml)</option>
                                    <option value="cup">cups</option>
                                    <option value="tbsp">tablespoons</option>
                                    <option value="tsp">teaspoons</option>
                                    <option value="oz">ounces (oz)</option>
                                    <option value="lb">pounds (lb)</option>
                                    <option value="piece">piece</option>
                                    <option value="slice">slice</option>
                                </select>
                            </div>
                            <button class="add-food-btn" onclick="addFood()">
                                <i class="fas fa-plus"></i>
                                Add to Diet
                            </button>
                        </div>
                    </div>
                    
                    <!-- AI Suggestion -->
                    <div class="ai-suggestion" id="aiSuggestion" style="display: none;"></div>
                    
                    <!-- Food List -->
                    <div id="taskList"></div>
                    
                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="action-btn" onclick="clearAllFoods()" style="flex: 1;">
                            <i class="fas fa-trash"></i> Clear All
                        </button>
                        <button class="action-btn" onclick="exportDietPlan()" style="flex: 1;">
                            <i class="fas fa-download"></i> Export
                        </button>
                    </div>
                    
                    <!-- Notes Section -->
                    <div class="note-section">
                        <label>
                            <i class="fas fa-sticky-note"></i>
                            Diet Notes (Auto-saves)
                        </label>
                        <textarea id="study-notes-area" placeholder="Add notes about your diet, meal timing, or how you feel..."></textarea>
                    </div>
                </div>
            `;
            
            // Re-attach close button functionality
            const closeBtn = goalContent.querySelector('.close-goal');
            if (closeBtn) {
                closeBtn.onclick = toggleGoalModal;
            }
            
            // Add enter key support for adding food
            const foodNameInput = goalContent.querySelector('#foodName');
            const quantityInput = goalContent.querySelector('#foodQuantity');
            
            if (foodNameInput && quantityInput) {
                foodNameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        quantityInput.focus();
                    }
                });
                
                quantityInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        addFood();
                    }
                });
            }
        }
    }
    
    // Load existing foods
    renderDietPlan();
    updateSummary();
    showAISuggestion();
    
    // Initialize global diet context
    window.dietContext = {
        getDietPlan: () => {
            const foods = JSON.parse(localStorage.getItem('ventora_foods')) || [];
            const notes = localStorage.getItem('ventora_study_notes') || '';
            
            let totals = { protein: 0, carbs: 0, fat: 0, calories: 0 };
            foods.forEach(food => {
                const nutrition = calculateNutrition(food.name, food.quantity, food.unit);
                totals.protein += nutrition.protein;
                totals.carbs += nutrition.carbs;
                totals.fat += nutrition.fat;
                totals.calories += nutrition.calories;
            });
            
            return {
                foods: foods,
                notes: notes,
                totals: totals,
                goals: DAILY_GOALS,
                lastUpdated: new Date().toISOString()
            };
        },
        
        formatForAI: () => {
            const diet = window.dietContext.getDietPlan();
            let text = `=== CURRENT DIET PLAN ===\n\n`;
            
            if (diet.foods.length === 0) {
                text += `No foods logged today.\n`;
            } else {
                text += `Today's Diet Log (${diet.foods.length} items):\n`;
                diet.foods.forEach((food, index) => {
                    const nutrition = calculateNutrition(food.name, food.quantity, food.unit);
                    text += `• ${food.quantity}${food.unit} ${food.name}: ${Math.round(nutrition.protein)}g protein, ${Math.round(nutrition.carbs)}g carbs, ${Math.round(nutrition.fat)}g fat, ${nutrition.calories} cal\n`;
                });
                
                text += `\nDAILY TOTALS:\n`;
                text += `• Protein: ${Math.round(diet.totals.protein)}g / ${DAILY_GOALS.protein}g (${Math.round((diet.totals.protein/DAILY_GOALS.protein)*100)}%)\n`;
                text += `• Carbs: ${Math.round(diet.totals.carbs)}g / ${DAILY_GOALS.carbs}g (${Math.round((diet.totals.carbs/DAILY_GOALS.carbs)*100)}%)\n`;
                text += `• Fat: ${Math.round(diet.totals.fat)}g / ${DAILY_GOALS.fat}g (${Math.round((diet.totals.fat/DAILY_GOALS.fat)*100)}%)\n`;
                text += `• Calories: ${diet.totals.calories} / ${DAILY_GOALS.calories} (${Math.round((diet.totals.calories/DAILY_GOALS.calories)*100)}%)\n`;
                
                // Add analysis
                if (diet.totals.protein < DAILY_GOALS.protein * 0.7) {
                    text += `\nNOTE: Protein intake is low. Consider adding protein-rich foods.`;
                }
                if (diet.totals.calories < DAILY_GOALS.calories * 0.7) {
                    text += `\nNOTE: Calorie intake is below target.`;
                }
            }
            
            if (diet.notes) {
                text += `\n\nUSER DIET NOTES:\n"${diet.notes}"\n`;
            }
            
            text += `\n=== END DIET DATA ===`;
            return text;
        },
        
        updateDietContext: () => {
            // This function is called whenever diet data changes
            console.log('Diet context updated for AI');
        }
    };
});

// Make functions available globally
window.toggleGoalModal = toggleGoalModal;
window.addFood = addFood;
window.editFood = editFood;
window.deleteFood = deleteFood;
window.clearAllFoods = clearAllFoods;
window.exportDietPlan = exportDietPlan;
