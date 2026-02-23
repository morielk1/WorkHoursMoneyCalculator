let hourlyRate = 34.32;
let previousRate = 34.32;
let history = [];

// Load data
function loadData() {
    const savedRate = localStorage.getItem('hourlyRate');
    if (savedRate) {
        hourlyRate = parseFloat(savedRate);
        previousRate = hourlyRate;
    }
    document.getElementById('hourlyRate').value = hourlyRate.toFixed(2);

    const savedHistory = localStorage.getItem('history');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    }
    renderHistory();
    updateTotal();
}

// Save data
function saveData() {
    localStorage.setItem('hourlyRate', hourlyRate.toFixed(2));
    localStorage.setItem('history', JSON.stringify(history));
}

// Parse time string to decimal hours
function parseTime(timeStr) {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return -1;
    
    const hour = parseInt(parts[0]);
    const minute = parseInt(parts[1]);
    
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return -1;
    }
    
    return hour + (minute / 60);
}

// Format decimal hours to HH:MM
function formatHoursMinutes(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
}

// Calculate
document.getElementById('calculate').addEventListener('click', () => {
    const startTime = document.getElementById('startTime').value.trim();
    const endTime = document.getElementById('endTime').value.trim();
    
    if (!startTime || !endTime) return;
    
    const startHour = parseTime(startTime);
    const endHour = parseTime(endTime);
    
    if (startHour < 0 || endHour < 0) {
        document.getElementById('result').textContent = 'Invalid time format. Use: 9:00';
        return;
    }
    
    let hours = endHour - startHour;
    if (hours < 0) hours += 24;
    
    const payment = hours * hourlyRate;
    const hoursFormatted = formatHoursMinutes(hours);
    
    document.getElementById('result').textContent = `${hoursFormatted} × ${hourlyRate.toFixed(2)}₪ = ${payment.toFixed(2)}₪`;
    
    history.unshift({ hours, payment });
    saveData();
    renderHistory();
    updateTotal();
    
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
});

// Save rate
document.getElementById('saveRate').addEventListener('click', () => {
    const newRate = parseFloat(document.getElementById('hourlyRate').value);
    
    if (isNaN(newRate) || newRate <= 0) {
        document.getElementById('hourlyRate').value = hourlyRate.toFixed(2);
        return;
    }
    
    if (newRate !== previousRate && history.length > 0) {
        showModal(
            'Change Hourly Rate',
            'Changing the rate will recalculate all history. Continue?',
            () => {
                hourlyRate = newRate;
                previousRate = newRate;
                recalculateHistory();
                saveData();
                updateTotal();
            },
            () => {
                document.getElementById('hourlyRate').value = hourlyRate.toFixed(2);
            }
        );
    } else {
        hourlyRate = newRate;
        previousRate = newRate;
        saveData();
        updateTotal();
    }
});

// Reset
document.getElementById('reset').addEventListener('click', () => {
    showModal(
        'Reset All',
        'Are you sure you want to delete all work history?',
        () => {
            history = [];
            saveData();
            renderHistory();
            updateTotal();
            document.getElementById('result').textContent = 'Hours Worked:';
        }
    );
});

// Recalculate history
function recalculateHistory() {
    history.forEach(item => {
        item.payment = item.hours * hourlyRate;
    });
    renderHistory();
}

// Update total
function updateTotal() {
    const totalHours = history.reduce((sum, item) => sum + item.hours, 0);
    const totalPayment = history.reduce((sum, item) => sum + item.payment, 0);
    const totalFormatted = formatHoursMinutes(totalHours);
    document.getElementById('total').textContent = `Monthly Total: ${totalFormatted} = ${totalPayment.toFixed(2)}₪`;
}

// Render history
function renderHistory() {
    const container = document.getElementById('history');
    container.innerHTML = '';
    
    history.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        const text = document.createElement('span');
        text.className = 'history-text';
        const hoursFormatted = formatHoursMinutes(item.hours);
        text.textContent = `${hoursFormatted} = ${item.payment.toFixed(2)}₪`;
        
        const btn = document.createElement('button');
        btn.className = 'btn-delete';
        btn.textContent = '✕';
        btn.onclick = () => deleteItem(index);
        
        div.appendChild(text);
        div.appendChild(btn);
        container.appendChild(div);
    });
}

// Delete item
function deleteItem(index) {
    showModal(
        'Delete Entry',
        'Are you sure you want to delete this entry?',
        () => {
            history.splice(index, 1);
            saveData();
            renderHistory();
            updateTotal();
        }
    );
}

// Modal
function showModal(title, message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-title">${title}</div>
            <div class="modal-message">${message}</div>
            <div class="modal-buttons">
                <button class="btn-secondary" id="modalCancel">Cancel</button>
                <button class="btn-primary" id="modalConfirm">Yes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('modalConfirm').onclick = () => {
        if (onConfirm) onConfirm();
        document.body.removeChild(modal);
    };
    
    document.getElementById('modalCancel').onclick = () => {
        if (onCancel) onCancel();
        document.body.removeChild(modal);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            if (onCancel) onCancel();
            document.body.removeChild(modal);
        }
    };
}

// Initialize
loadData();
