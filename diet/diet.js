// diet/diet.js

// Diet Context for AI integration
window.dietContext = {
    foods: [],
    
    // Initialize from localStorage
    init: function() {
        const saved = localStorage.getItem('ventora_diet_plan');
        if (saved) {
            try {
                this.foods = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading diet plan:', e);
                this.foods = [];
            }
        }
        return this;
    },
    
    // Save to localStorage
    save: function() {
        localStorage.setItem('ventora_diet_plan', JSON.stringify(this.foods));
        return this;
    },
    
    // Add a new food item
    addFood: function(food) {
        const foodItem = {
            id: Date.now().toString(),
            name: food.name || '',
            quantity: food.quantity || 1,
            unit: food.unit || 'serving',
            mealTime: food.mealTime || 'breakfast',
            category: food.category || 'general',
            tags: food.tags || [],
            calories: food.calories || 0,
            protein: food.protein || 0,
            carbs: food.carbs || 0,
            fat: food.fat || 0,
            notes: food.notes || '',
            addedDate: new Date().toISOString()
        };
        
        this.foods.push(foodItem);
        this.save();
        return foodItem;
    },
    
    // Update food item
    updateFood: function(id, updates) {
        const index = this.foods.findIndex(food => food.id === id);
        if (index !== -1) {
            this.foods[index] = { ...this.foods[index], ...updates };
            this.save();
            return this.foods[index];
        }
        return null;
    },
    
    // Delete food item
    deleteFood: function(id) {
        this.foods = this.foods.filter(food => food.id !== id);
        this.save();
        return this;
    },
    
    // Get all foods
    getAllFoods: function() {
        return this.foods;
    },
    
    // Get foods by meal time
    getFoodsByMeal: function(mealTime) {
        return this.foods.filter(food => food.mealTime === mealTime);
    },
    
    // Get foods by category
    getFoodsByCategory: function(category) {
        return this.foods.filter(food => food.category === category);
    },
    
    // Calculate total nutrition
    calculateNutrition: function() {
        return this.foods.reduce((totals, food) => {
            return {
                calories: totals.calories + (food.calories * food.quantity),
                protein: totals.protein + (food.protein * food.quantity),
                carbs: totals.carbs + (food.carbs * food.quantity),
                fat: totals.fat + (food.fat * food.quantity)
            };
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    },
    
    // Format for AI context
    formatForAI: function() {
        if (this.foods.length === 0) {
            return "No diet items recorded.";
        }
        
        const nutrition = this.calculateNutrition();
        const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
        
        let formatted = `Current Diet Plan Summary:\n`;
        formatted += `Total Items: ${this.foods.length}\n`;
        formatted += `Nutrition Totals: ${Math.round(nutrition.calories)} cal, ${nutrition.protein.toFixed(1)}g protein, ${nutrition.carbs.toFixed(1)}g carbs, ${nutrition.fat.toFixed(1)}g fat\n\n`;
        
        meals.forEach(meal => {
            const mealFoods = this.getFoodsByMeal(meal);
            if (mealFoods.length > 0) {
                formatted += `${meal.charAt(0).toUpperCase() + meal.slice(1)}:\n`;
                mealFoods.forEach(food => {
                    formatted += `  • ${food.name}: ${food.quantity} ${food.unit}`;
                    if (food.calories > 0) {
                        formatted += ` (${Math.round(food.calories * food.quantity)} cal)`;
                    }
                    if (food.tags.length > 0) {
                        formatted += ` [${food.tags.join(', ')}]`;
                    }
                    formatted += `\n`;
                });
                formatted += `\n`;
            }
        });
        
        return formatted;
    },
    
    // Get diet plan for AI (compatible with your prompt template)
    getDietPlan: function() {
        return {
            foods: this.foods,
            calculateNutrition: this.calculateNutrition.bind(this),
            formatForAI: this.formatForAI.bind(this)
        };
    }
};

// Initialize diet context
window.dietContext.init();

// UI Functions
let isAddingFood = false;

function toggleDietModal() {
    const modal = document.getElementById('dietModal');
    modal.classList.toggle('active');
    
    if (modal.classList.contains('active')) {
        renderDietPlan();
        renderNutritionStats();
    } else {
        // Reset form state
        hideFoodForm();
    }
}

function renderDietPlan() {
    const container = document.getElementById('dietContainer');
    const foods = window.dietContext.getAllFoods();
    
    if (foods.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-apple-alt"></i>
                <h4>No Diet Items</h4>
                <p>Add your first food item to get started</p>
            </div>
        `;
        return;
    }
    
    // Group by meal time
    const meals = {
        breakfast: foods.filter(f => f.mealTime === 'breakfast'),
        lunch: foods.filter(f => f.mealTime === 'lunch'),
        dinner: foods.filter(f => f.mealTime === 'dinner'),
        snacks: foods.filter(f => f.mealTime === 'snacks')
    };
    
    let html = '<div class="food-list">';
    
    Object.entries(meals).forEach(([mealTime, mealFoods]) => {
        if (mealFoods.length > 0) {
            html += `<div class="meal-section">
                        <h4 style="color: var(--text-primary); margin: 0 0 12px 0; font-size: 0.95rem; text-transform: capitalize;">
                            ${mealTime} (${mealFoods.length} items)
                        </h4>`;
            
            mealFoods.forEach(food => {
                html += createFoodItemHTML(food);
            });
            
            html += `</div>`;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function createFoodItemHTML(food) {
    const nutrition = [];
    if (food.calories > 0) nutrition.push(`${Math.round(food.calories * food.quantity)} cal`);
    if (food.protein > 0) nutrition.push(`${(food.protein * food.quantity).toFixed(1)}g protein`);
    if (food.carbs > 0) nutrition.push(`${(food.carbs * food.quantity).toFixed(1)}g carbs`);
    if (food.fat > 0) nutrition.push(`${(food.fat * food.quantity).toFixed(1)}g fat`);
    
    return `
        <div class="food-item" data-id="${food.id}">
            <div class="food-header">
                <h4 class="food-name">${food.name}</h4>
                <div class="food-actions">
                    <button class="food-action-btn" onclick="editFood('${food.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="food-action-btn" onclick="deleteFood('${food.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="food-details">
                <div class="food-detail">
                    <i class="fas fa-weight"></i>
                    <span>${food.quantity} ${food.unit}</span>
                </div>
                
                <div class="food-detail">
                    <i class="fas fa-clock"></i>
                    <span style="text-transform: capitalize;">${food.mealTime}</span>
                </div>
                
                <div class="food-detail">
                    <i class="fas fa-tag"></i>
                    <span style="text-transform: capitalize;">${food.category}</span>
                </div>
                
                ${nutrition.length > 0 ? `
                <div class="food-detail">
                    <i class="fas fa-chart-pie"></i>
                    <span>${nutrition.join(', ')}</span>
                </div>
                ` : ''}
            </div>
            
            ${food.tags.length > 0 ? `
            <div class="food-tags">
                ${food.tags.map(tag => `<span class="food-tag">${tag}</span>`).join('')}
            </div>
            ` : ''}
            
            ${food.notes ? `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05);">
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
                    <strong>Notes:</strong> ${food.notes}
                </p>
            </div>
            ` : ''}
        </div>
    `;
}

function renderNutritionStats() {
    const container = document.getElementById('nutritionStats');
    const nutrition = window.dietContext.calculateNutrition();
    
    container.innerHTML = `
        <div class="stats-section">
            <div class="stats-title">
                <i class="fas fa-chart-line"></i>
                <span>Nutrition Summary</span>
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${Math.round(nutrition.calories)}</div>
                    <div class="stat-label">Calories</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-value">${nutrition.protein.toFixed(1)}</div>
                    <div class="stat-label">Protein (g)</div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-value">${nutrition.carbs.toFixed(1)}</div>
                    <div class="stat-label">Carbs (g)</div>
                </div>
            </div>
        </div>
    `;
}

function showFoodForm(foodData = null) {
    const formContainer = document.getElementById('foodForm');
    isAddingFood = true;
    
    // Form options
    const units = ['serving', 'grams (g)', 'milliliters (ml)', 'cups', 'pieces', 'tablespoons', 'teaspoons', 'ounces (oz)', 'kilograms (kg)'];
    const mealTimes = ['breakfast', 'lunch', 'dinner', 'snacks', 'pre-workout', 'post-workout'];
    const categories = ['fruits', 'vegetables', 'protein', 'carbs', 'dairy', 'fats', 'beverages', 'supplements', 'general'];
    const tags = ['organic', 'gluten-free', 'dairy-free', 'vegan', 'vegetarian', 'high-protein', 'low-carb', 'low-fat', 'sugar-free', 'processed'];
    
    formContainer.innerHTML = `
        <div class="food-form">
            <div class="form-group">
                <label class="form-label">Food Name *</label>
                <input type="text" id="foodName" class="form-input" 
                       placeholder="e.g., Chicken Breast, Apple, Oatmeal" 
                       value="${foodData ? foodData.name : ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Quantity</label>
                    <input type="number" id="foodQuantity" class="form-input" 
                           step="0.1" min="0.1" value="${foodData ? foodData.quantity : 1}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Unit</label>
                    <select id="foodUnit" class="form-select">
                        ${units.map(unit => `
                            <option value="${unit}" ${foodData && foodData.unit === unit ? 'selected' : ''}>
                                ${unit}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Meal Time</label>
                    <select id="foodMealTime" class="form-select">
                        ${mealTimes.map(meal => `
                            <option value="${meal}" ${foodData && foodData.mealTime === meal ? 'selected' : ''}>
                                ${meal.charAt(0).toUpperCase() + meal.slice(1)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select id="foodCategory" class="form-select">
                        ${categories.map(cat => `
                            <option value="${cat}" ${foodData && foodData.category === cat ? 'selected' : ''}>
                                ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Tags (Optional)</label>
                <div id="tagsContainer" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                    ${tags.map(tag => `
                        <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                            <input type="checkbox" value="${tag}" 
                                   ${foodData && foodData.tags && foodData.tags.includes(tag) ? 'checked' : ''}>
                            <span style="font-size: 0.85rem;">${tag}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Calories (per unit)</label>
                    <input type="number" id="foodCalories" class="form-input" 
                           min="0" step="1" placeholder="0" 
                           value="${foodData ? foodData.calories : ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Protein (g per unit)</label>
                    <input type="number" id="foodProtein" class="form-input" 
                           min="0" step="0.1" placeholder="0" 
                           value="${foodData ? foodData.protein : ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Carbs (g per unit)</label>
                    <input type="number" id="foodCarbs" class="form-input" 
                           min="0" step="0.1" placeholder="0" 
                           value="${foodData ? foodData.carbs : ''}">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Fat (g per unit)</label>
                    <input type="number" id="foodFat" class="form-input" 
                           min="0" step="0.1" placeholder="0" 
                           value="${foodData ? foodData.fat : ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Notes (Optional)</label>
                <textarea id="foodNotes" class="form-input" rows="3" 
                          placeholder="Any special preparation, brand, or additional info">${foodData ? foodData.notes : ''}</textarea>
            </div>
            
            <div class="form-actions">
                <button class="form-btn" onclick="hideFoodForm()">
                    Cancel
                </button>
                <button class="form-btn primary" onclick="${foodData ? `updateFoodItem('${foodData.id}')` : 'saveFoodItem()'}">
                    ${foodData ? 'Update' : 'Add Food'}
                </button>
            </div>
        </div>
    `;
    
    formContainer.style.display = 'block';
    document.getElementById('addFoodBtn').style.display = 'none';
}

function hideFoodForm() {
    const formContainer = document.getElementById('foodForm');
    formContainer.style.display = 'none';
    document.getElementById('addFoodBtn').style.display = 'block';
    isAddingFood = false;
}

function saveFoodItem() {
    const name = document.getElementById('foodName').value.trim();
    if (!name) {
        showToast('Please enter a food name', 'error');
        return;
    }
    
    const quantity = parseFloat(document.getElementById('foodQuantity').value) || 1;
    const unit = document.getElementById('foodUnit').value;
    const mealTime = document.getElementById('foodMealTime').value;
    const category = document.getElementById('foodCategory').value;
    
    // Get selected tags
    const tagCheckboxes = document.querySelectorAll('#tagsContainer input[type="checkbox"]:checked');
    const tags = Array.from(tagCheckboxes).map(cb => cb.value);
    
    const calories = parseFloat(document.getElementById('foodCalories').value) || 0;
    const protein = parseFloat(document.getElementById('foodProtein').value) || 0;
    const carbs = parseFloat(document.getElementById('foodCarbs').value) || 0;
    const fat = parseFloat(document.getElementById('foodFat').value) || 0;
    const notes = document.getElementById('foodNotes').value.trim();
    
    const foodData = {
        name,
        quantity,
        unit,
        mealTime,
        category,
        tags,
        calories,
        protein,
        carbs,
        fat,
        notes
    };
    
    window.dietContext.addFood(foodData);
    hideFoodForm();
    renderDietPlan();
    renderNutritionStats();
    showToast('Food added successfully!', 'success');
}

function editFood(foodId) {
    const food = window.dietContext.getAllFoods().find(f => f.id === foodId);
    if (food) {
        showFoodForm(food);
    }
}

function updateFoodItem(foodId) {
    const name = document.getElementById('foodName').value.trim();
    if (!name) {
        showToast('Please enter a food name', 'error');
        return;
    }
    
    const quantity = parseFloat(document.getElementById('foodQuantity').value) || 1;
    const unit = document.getElementById('foodUnit').value;
    const mealTime = document.getElementById('foodMealTime').value;
    const category = document.getElementById('foodCategory').value;
    
    const tagCheckboxes = document.querySelectorAll('#tagsContainer input[type="checkbox"]:checked');
    const tags = Array.from(tagCheckboxes).map(cb => cb.value);
    
    const calories = parseFloat(document.getElementById('foodCalories').value) || 0;
    const protein = parseFloat(document.getElementById('foodProtein').value) || 0;
    const carbs = parseFloat(document.getElementById('foodCarbs').value) || 0;
    const fat = parseFloat(document.getElementById('foodFat').value) || 0;
    const notes = document.getElementById('foodNotes').value.trim();
    
    const updates = {
        name,
        quantity,
        unit,
        mealTime,
        category,
        tags,
        calories,
        protein,
        carbs,
        fat,
        notes,
        updatedDate: new Date().toISOString()
    };
    
    window.dietContext.updateFood(foodId, updates);
    hideFoodForm();
    renderDietPlan();
    renderNutritionStats();
    showToast('Food updated successfully!', 'success');
}

function deleteFood(foodId) {
    if (confirm('Are you sure you want to delete this food item?')) {
        window.dietContext.deleteFood(foodId);
        renderDietPlan();
        renderNutritionStats();
        showToast('Food item deleted', 'info');
    }
}

function clearAllFoods() {
    if (confirm('Are you sure you want to clear ALL food items? This cannot be undone.')) {
        window.dietContext.foods = [];
        window.dietContext.save();
        renderDietPlan();
        renderNutritionStats();
        showToast('All food items cleared', 'info');
    }
}

function exportDietPlan() {
    const foods = window.dietContext.getAllFoods();
    const nutrition = window.dietContext.calculateNutrition();
    
    let text = `=== Ventora AI Diet Plan ===\n\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Total Items: ${foods.length}\n`;
    text += `Nutrition Summary: ${Math.round(nutrition.calories)} calories, ${nutrition.protein.toFixed(1)}g protein, ${nutrition.carbs.toFixed(1)}g carbs, ${nutrition.fat.toFixed(1)}g fat\n\n`;
    
    text += `FOOD ITEMS:\n`;
    text += `------------\n\n`;
    
    foods.forEach((food, index) => {
        text += `${index + 1}. ${food.name}\n`;
        text += `   Quantity: ${food.quantity} ${food.unit}\n`;
        text += `   Meal: ${food.mealTime.charAt(0).toUpperCase() + food.mealTime.slice(1)}\n`;
        text += `   Category: ${food.category}\n`;
        
        if (food.calories > 0) {
            text += `   Nutrition per serving: ${Math.round(food.calories)} cal`;
            if (food.protein > 0) text += `, ${food.protein}g protein`;
            if (food.carbs > 0) text += `, ${food.carbs}g carbs`;
            if (food.fat > 0) text += `, ${food.fat}g fat`;
            text += `\n`;
            
            text += `   Total nutrition: ${Math.round(food.calories * food.quantity)} cal`;
            if (food.protein > 0) text += `, ${(food.protein * food.quantity).toFixed(1)}g protein`;
            if (food.carbs > 0) text += `, ${(food.carbs * food.quantity).toFixed(1)}g carbs`;
            if (food.fat > 0) text += `, ${(food.fat * food.quantity).toFixed(1)}g fat`;
            text += `\n`;
        }
        
        if (food.tags.length > 0) {
            text += `   Tags: ${food.tags.join(', ')}\n`;
        }
        
        if (food.notes) {
            text += `   Notes: ${food.notes}\n`;
        }
        
        text += `   Added: ${new Date(food.addedDate).toLocaleDateString()}\n\n`;
    });
    
    text += `\n=== End of Diet Plan ===\n`;
    text += `Exported from Ventora AI\n`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventora-diet-plan-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Diet plan exported!', 'success');
}

// Helper function for toast notifications
function showToast(message, type = "info") {
    const toast = document.getElementById('toast') || (() => {
        const div = document.createElement('div');
        div.id = 'toast';
        div.className = 'toast';
        document.body.appendChild(div);
        return div;
    })();
    
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    
    requestAnimationFrame(() => {
        toast.classList.add('active');
    });
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Add Diet button to menu if not already there
    setTimeout(() => {
        const menuItems = document.querySelector('');
        if (menuItems && !document.querySelector('')) {
            const dietItem = document.createElement('a');
            dietItem.className = '';
            dietItem.innerHTML = `
               
            `;
            dietItem.onclick = toggleDietModal;
            
            // Find where to insert (before settings usually)
            const settingsItem = menuItems.querySelector('.menu-item[onclick*="openMainMenuPopup"]');
            if (settingsItem) {
                menuItems.insertBefore(dietItem, settingsItem);
            } else {
                menuItems.appendChild(dietItem);
            }
        }
        
        // Initialize diet context
        window.dietContext.init();
    }, 100);
});
