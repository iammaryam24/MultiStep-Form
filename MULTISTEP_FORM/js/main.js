// Main initialization file
document.addEventListener('DOMContentLoaded', function() {
    console.log('Multistep Form Application Initialized');
    
    // Initialize all modules
    FormManager.init();
    UIControls.init();
    StorageManager.init();
    
    // Set up event listeners for dynamic elements
    setupDynamicListeners();
    
    // Load saved data if exists
    loadSavedData();
    
    // Initialize form with sample data for demo (remove in production)
    initDemoData();
});

function setupDynamicListeners() {
    // Salary range display
    const salaryInput = document.getElementById('salary');
    const salaryValue = document.getElementById('salaryValue');
    
    if (salaryInput && salaryValue) {
        salaryInput.addEventListener('input', function() {
            const value = parseInt(this.value).toLocaleString();
            salaryValue.textContent = `$${value}`;
        });
    }
    
    // Skills selection counter
    const skillCheckboxes = document.querySelectorAll('input[name="skills"]');
    skillCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSkillsCounter);
    });
    
    // Auto-save on input change
    const formInputs = document.querySelectorAll('#multistepForm input, #multistepForm select, #multistepForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', () => {
            StorageManager.saveFormData(FormManager.collectFormData());
            UIControls.showAutoSaveNotification();
        });
        
        // Real-time validation for specific fields
        if (input.type === 'email' || input.type === 'tel') {
            input.addEventListener('blur', () => {
                Validation.validateField(input);
            });
        }
    });
}

function loadSavedData() {
    const savedData = StorageManager.getFormData();
    if (savedData && Object.keys(savedData).length > 0) {
        FormManager.populateForm(savedData);
        UIControls.showNotification('Loaded saved data', 'info');
    }
}

function updateSkillsCounter() {
    const selectedSkills = document.querySelectorAll('input[name="skills"]:checked');
    const counter = document.getElementById('skillsCounter') || createSkillsCounter();
    counter.textContent = `${selectedSkills.length} skills selected`;
}

function createSkillsCounter() {
    const skillsContainer = document.querySelector('.skills-container');
    const counter = document.createElement('div');
    counter.id = 'skillsCounter';
    counter.className = 'skills-counter';
    skillsContainer.parentNode.insertBefore(counter, skillsContainer.nextSibling);
    return counter;
}

function initDemoData() {
    // Only for demonstration - remove in production
    const isDemo = localStorage.getItem('formDemo') !== 'completed';
    
    if (isDemo && confirm('Load demo data for testing?')) {
        const demoData = {
            firstName: 'Maryam',
            lastName: 'Azmat',
            dob: '2002-05-15',
            gender: 'female',
            bio: 'Frontend developer passionate about creating amazing user experiences.',
            email: 'maryamazmat444@gmail.com',
            phone: '+92 335 050 4936',
            address: 'House No CB-85, Westridge Valley, Rawalpindi',
            city: 'Rawalpindi',
            country: 'pakistan',
            education: 'bachelors',
            institution: 'Fatima Jinnah Women University',
            field: 'Computer Science',
            experience: '1-3',
            jobRole: 'Frontend Developer',
            salary: '55000',
            workPref: 'remote',
            terms: true
        };
        
        FormManager.populateForm(demoData);
        
        // Check some skills
        document.getElementById('html').checked = true;
        document.getElementById('javascript').checked = true;
        document.getElementById('react').checked = true;
        document.getElementById('uiux').checked = true;
        
        StorageManager.saveFormData(FormManager.collectFormData());
        localStorage.setItem('formDemo', 'completed');
        
        UIControls.showNotification('Demo data loaded successfully!', 'success');
    }
}

// Export to global scope for module access
window.FormManager = FormManager;
window.UIControls = UIControls;
window.StorageManager = StorageManager;
window.Validation = Validation;