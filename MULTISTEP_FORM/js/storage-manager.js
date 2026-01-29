// Storage Manager Module
const StorageManager = (function() {
    const STORAGE_KEY = 'multistep_form_data';
    const COMPLETED_KEY = 'form_completed';
    
    const init = function() {
        // Check for stored data on page load
        const savedData = getFormData();
        if (savedData) {
            console.log('Loaded saved data from storage:', savedData);
        }
        
        // Setup auto-save
        setupAutoSave();
    };
    
    const setupAutoSave = function() {
        // Auto-save on input change with debounce
        let saveTimeout;
        const saveFormDataDebounced = debounce(() => {
            const formData = FormManager.collectFormData();
            saveFormData(formData);
        }, 1000);
        
        document.querySelectorAll('#multistepForm input, #multistepForm select, #multistepForm textarea')
            .forEach(element => {
                element.addEventListener('input', saveFormDataDebounced);
                element.addEventListener('change', saveFormDataDebounced);
            });
    };
    
    const saveFormData = function(formData) {
        try {
            // Get existing data
            const existingData = getFormData() || {};
            
            // Merge with new data
            const mergedData = { ...existingData, ...formData };
            
            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));
            
            // Update last saved timestamp
            localStorage.setItem(`${STORAGE_KEY}_timestamp`, Date.now());
            
            return true;
        } catch (error) {
            console.error('Error saving form data:', error);
            showStorageError();
            return false;
        }
    };
    
    const getFormData = function() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading form data:', error);
            return null;
        }
    };
    
    const getFormProgress = function() {
        const data = getFormData();
        if (!data) return 0;
        
        // Calculate progress based on filled fields
        const totalFields = 20; // Approximate number of fields
        const filledFields = Object.keys(data).filter(key => {
            const value = data[key];
            return value !== '' && value !== null && value !== undefined;
        }).length;
        
        return Math.min(Math.round((filledFields / totalFields) * 100), 100);
    };
    
    const getLastSavedTime = function() {
        const timestamp = localStorage.getItem(`${STORAGE_KEY}_timestamp`);
        if (!timestamp) return null;
        
        const date = new Date(parseInt(timestamp));
        return date.toLocaleTimeString();
    };
    
    const markAsCompleted = function() {
        try {
            localStorage.setItem(COMPLETED_KEY, 'true');
            localStorage.setItem(`${COMPLETED_KEY}_date`, new Date().toISOString());
            return true;
        } catch (error) {
            console.error('Error marking form as completed:', error);
            return false;
        }
    };
    
    const isCompleted = function() {
        return localStorage.getItem(COMPLETED_KEY) === 'true';
    };
    
    const clearData = function() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(`${STORAGE_KEY}_timestamp`);
            localStorage.removeItem(COMPLETED_KEY);
            localStorage.removeItem(`${COMPLETED_KEY}_date`);
            return true;
        } catch (error) {
            console.error('Error clearing form data:', error);
            return false;
        }
    };
    
    const exportData = function(format = 'json') {
        const data = getFormData();
        if (!data) return null;
        
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(data, null, 2);
                
            case 'csv':
                return convertToCSV(data);
                
            case 'text':
                return convertToText(data);
                
            default:
                return JSON.stringify(data, null, 2);
        }
    };
    
    const convertToCSV = function(data) {
        const headers = Object.keys(data).join(',');
        const values = Object.values(data).map(value => {
            if (Array.isArray(value)) {
                return `"${value.join(', ')}"`;
            }
            return `"${value}"`;
        }).join(',');
        
        return `${headers}\n${values}`;
    };
    
    const convertToText = function(data) {
        let text = 'FORM DATA SUMMARY\n';
        text += '=================\n\n';
        
        for (const [key, value] of Object.entries(data)) {
            if (value && value !== '') {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                text += `${label}: ${Array.isArray(value) ? value.join(', ') : value}\n`;
            }
        }
        
        return text;
    };
    
    const showStorageError = function() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <strong>Storage Error</strong>
                <p>Unable to save data locally. Your browser might be in private mode or storage is full.</p>
            </div>
        `;
        
        const container = document.querySelector('.form-container');
        container.insertBefore(errorDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    };
    
    // Utility function for debouncing
    const debounce = function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    return {
        init,
        saveFormData,
        getFormData,
        getFormProgress,
        getLastSavedTime,
        markAsCompleted,
        isCompleted,
        clearData,
        exportData
    };
})();