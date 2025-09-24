document.addEventListener('DOMContentLoaded', () => {
    const itemForm = document.getElementById('item-form');
    const itemNameInput = document.getElementById('item-name');
    const itemPriceInput = document.getElementById('item-price');
    const itemImageInput = document.getElementById('item-image');
    const fileNameDisplay = document.getElementById('file-name');
    const itemList = document.getElementById('item-list');
    const statusMessage = document.getElementById('status-message');
    const showDeletedBtn = document.getElementById('show-deleted-btn');
    
    const currentDisplay = document.getElementById('calc-current-display');
    const historyDisplay = document.getElementById('calc-history-display');
    const calcButtons = document.querySelectorAll('.btn-calc-royal-static');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    let currentInput = '';
    let expression = [];
    let showingDeleted = false;
    
    let items = JSON.parse(localStorage.getItem('items')) || [];
    let history = JSON.parse(localStorage.getItem('calcHistory')) || [];

    renderItems();
    renderHistory();

    function saveItems() {
        localStorage.setItem('items', JSON.stringify(items));
    }

    function saveHistory() {
        localStorage.setItem('calcHistory', JSON.stringify(history));
    }

    function showStatusMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message-royal-static ${type}`;
        statusMessage.style.display = 'block';
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }

    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = itemNameInput.value.trim();
        const price = itemPriceInput.value.trim();
        const imageFile = itemImageInput.files[0];

        const newItem = {
            id: Date.now(),
            name: name || "بێ ناو",
            price: price || "بێ نرخ",
            image: imageFile ? URL.createObjectURL(imageFile) : null,
            deleted: false,
        };
        
        items.push(newItem);
        saveItems();
        renderItems();
        itemNameInput.value = '';
        itemPriceInput.value = '';
        itemImageInput.value = '';
        fileNameDisplay.textContent = 'وێنەی کاڵا باربکە';
        showStatusMessage('کاڵا بە سەرکەوتوویی زیاد کرا.', 'success');
    });

    itemImageInput.addEventListener('change', () => {
        if (itemImageInput.files.length > 0) {
            fileNameDisplay.textContent = itemImageInput.files[0].name;
        } else {
            fileNameDisplay.textContent = 'وێنەی کاڵا باربکە';
        }
    });

    function renderItems() {
        itemList.innerHTML = '';
        const itemsToRender = showingDeleted ? items.filter(item => item.deleted) : items.filter(item => !item.deleted);
        
        itemsToRender.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = `item-royal-static ${item.deleted ? 'deleted' : ''}`;
            itemDiv.setAttribute('data-id', item.id);

            const imageSrc = item.image || 'https://via.placeholder.com/350/0c0a1b/ffd700?text=No+Image';
            
            let actionButtons = '';
            if (item.deleted) {
                actionButtons = `
                    <button class="restore-btn" title="هێنانەوە"><i class="fas fa-undo"></i></button>
                    <button class="permanent-delete-btn" title="سڕینەوەی یەکجاری"><i class="fas fa-trash-alt"></i></button>
                `;
            } else {
                actionButtons = `
                    <button class="edit-btn" title="گۆڕانکاری"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="سڕینەوە"><i class="fas fa-trash-alt"></i></button>
                `;
            }

            const content = `
                ${item.image ? `<img src="${imageSrc}" alt="${item.name}">` : ''}
                <div class="item-info-royal-static">
                    <span class="item-name-royal-static">${item.name}</span>
                    <span class="item-price-royal-static">${item.price}</span>
                </div>
                <div class="item-actions-royal-static">
                    ${actionButtons}
                </div>
            `;
            
            itemDiv.innerHTML = content;
            itemList.appendChild(itemDiv);
        });
    }

    showDeletedBtn.addEventListener('click', () => {
        showingDeleted = !showingDeleted;
        showDeletedBtn.innerHTML = showingDeleted ? 'پیشاندانی هەموو <i class="fas fa-undo"></i>' : 'پیشاندانی سڕاوەکان <i class="fas fa-eye"></i>';
        renderItems();
    });

    function renderHistory() {
        historyList.innerHTML = '';
        history.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.textContent = `${entry.expression} = ${entry.result}`;
            listItem.setAttribute('data-expression', entry.expression); 
            historyList.appendChild(listItem);
        });
    }

    itemList.addEventListener('click', (e) => {
        const target = e.target;
        const itemDiv = target.closest('.item-royal-static');
        if (!itemDiv) return;

        const itemId = parseInt(itemDiv.getAttribute('data-id'));
        const item = items.find(i => i.id === itemId);

        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
            if (item) {
                item.deleted = true;
                saveItems();
                renderItems();
                showStatusMessage('کاڵا خرایە سڕینەوە.', 'success');
            }
        } else if (target.classList.contains('restore-btn') || target.closest('.restore-btn')) {
            if (item) {
                item.deleted = false;
                saveItems();
                renderItems();
                showStatusMessage('کاڵا بە سەرکەوتوویی گەڕێنرایەوە.', 'success');
            }
        } else if (target.classList.contains('permanent-delete-btn') || target.closest('.permanent-delete-btn')) {
            if (confirm("دڵنیای لە سڕینەوەی یەکجاری ئەم کاڵایە؟")) {
                items = items.filter(i => i.id !== itemId);
                saveItems();
                renderItems();
                showStatusMessage('کاڵا بە یەکجاری سڕایەوە.', 'error');
            }
        } else if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
            if (item) {
                const nameSpan = itemDiv.querySelector('.item-name-royal-static');
                const priceSpan = itemDiv.querySelector('.item-price-royal-static');
                
                nameSpan.innerHTML = `<input type="text" class="edit-input-royal-static" value="${item.name}">`;
                priceSpan.innerHTML = `<input type="text" class="edit-price-input-royal-static" value="${item.price}">`;
                
                const saveButton = itemDiv.querySelector('.edit-btn i');
                if (saveButton) {
                    saveButton.className = 'fas fa-save';
                }
                const originalButton = itemDiv.querySelector('.edit-btn');
                if (originalButton) {
                    originalButton.classList.remove('edit-btn');
                    originalButton.classList.add('save-btn');
                    originalButton.style.color = 'var(--accent-color-1)';
                }
            }
        } else if (target.classList.contains('save-btn') || target.closest('.save-btn')) {
            if (item) {
                const nameInput = itemDiv.querySelector('.edit-input-royal-static');
                const priceInput = itemDiv.querySelector('.edit-price-input-royal-static');
                
                item.name = nameInput.value;
                item.price = priceInput.value;
                
                saveItems();
                renderItems();
                showStatusMessage('کاڵا بە سەرکەوتوویی گۆڕانکاری تێدا کرا.', 'success');
            }
        }
    });

    function updateDisplay() {
        currentDisplay.value = currentInput || '0';
        historyDisplay.textContent = expression.join(' ');
    }

    function handleNumber(number) {
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else {
            currentInput += number;
        }
        updateDisplay();
    }

    function handleOperator(operator) {
        if (currentInput) {
            expression.push(currentInput);
            currentInput = '';
        }
        expression.push(operator);
        updateDisplay();
    }

    function calculate(expr) {
        try {
            return eval(expr.join(''));
        } catch (e) {
            return 'Error';
        }
    }
    
    function handleEquals() {
        if (currentInput) {
            expression.push(currentInput);
        }
        
        const fullExpression = expression.join('');
        let result;
        try {
            result = calculate(expression);
            history.unshift({ expression: fullExpression, result: result });
            if (history.length > 10) history.pop();
            saveHistory();
            renderHistory();
            currentInput = String(result);
            expression = [];
            historyDisplay.textContent = fullExpression + " =";
        } catch (e) {
            currentInput = 'Error';
            expression = [];
        }
        updateDisplay();
    }

    function handleClear() {
        currentInput = '';
        expression = [];
        updateDisplay();
    }

    function handleBackspace() {
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            if (currentInput === '') {
                currentInput = '0';
            }
        } else if (expression.length > 0) {
            expression.pop();
            currentInput = '0';
        }
        updateDisplay();
    }

    function clearHistory() {
        history = [];
        saveHistory();
        renderHistory();
        showStatusMessage('مێژووی ژماردن پاک کرایەوە.', 'success');
    }

    calcButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;
            if (!isNaN(parseFloat(value)) || value === '.') {
                handleNumber(value);
            } else if (['+', '-', '*', '/'].includes(value)) {
                handleOperator(value);
            } else if (value === '=') {
                handleEquals();
            } else if (value === 'AC') {
                handleClear();
            } else if (value === 'DEL') {
                handleBackspace();
            }
        });
    });

    clearHistoryBtn.addEventListener('click', clearHistory);

    historyList.addEventListener('click', (e) => {
        const clickedItem = e.target.closest('li');
        if (clickedItem) {
            const expressionToReuse = clickedItem.getAttribute('data-expression');
            currentInput = expressionToReuse;
            expression = [];
            updateDisplay();
            showStatusMessage('ژماردن گەڕێنرایەوە سەر شاشەکە.', 'success');
        }
    });

    updateDisplay();
});