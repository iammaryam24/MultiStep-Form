// Form Manager Module
const FormManager = (function() {
    let currentStep = 1;
    const totalSteps = 5;
    
    const init = function() {
        updateStepDisplay();
        setupEventListeners();
    };
    
    const setupEventListeners = function() {
        // Next button
        document.getElementById('nextBtn').addEventListener('click', nextStep);
        
        // Previous button
        document.getElementById('prevBtn').addEventListener('click', prevStep);
        
        // Form submission
        document.getElementById('multistepForm').addEventListener('submit', handleSubmit);
        
        // Download data button
        document.getElementById('downloadBtn')?.addEventListener('click', downloadData);
        
        // New form button
        document.getElementById('newFormBtn')?.addEventListener('click', resetForm);
    };
    
    const nextStep = function() {
        if (!validateCurrentStep()) {
            return;
        }
        
        // Save current step data
        StorageManager.saveFormData(collectFormData());
        
        // Move to next step
        if (currentStep < totalSteps) {
            hideStep(currentStep);
            currentStep++;
            showStep(currentStep);
            updateStepDisplay();
            updateButtons();
            updateProgressBar();
        }
    };
    
    const prevStep = function() {
        if (currentStep > 1) {
            hideStep(currentStep);
            currentStep--;
            showStep(currentStep);
            updateStepDisplay();
            updateButtons();
            updateProgressBar();
        }
    };
    
    const validateCurrentStep = function() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        // Clear previous errors
        UIControls.clearErrors();
        
        // Validate each required field in current step
        inputs.forEach(input => {
            if (input.hasAttribute('required')) {
                const error = Validation.validateField(input);
                if (error) {
                    isValid = false;
                    UIControls.showError(input.id + 'Error', error);
                }
            }
        });
        
        // Special validation for step 4 skills
        if (currentStep === 4) {
            const skills = document.querySelectorAll('input[name="skills"]:checked');
            if (skills.length === 0) {
                isValid = false;
                UIControls.showError('skillsError', 'Please select at least one skill');
            }
        }
        
        // Special validation for step 5 terms
        if (currentStep === 5) {
            const terms = document.getElementById('terms');
            if (!terms.checked) {
                isValid = false;
                UIControls.showError('termsError', 'You must accept the terms and conditions');
            }
        }
        
        if (!isValid) {
            UIControls.shakeForm();
        }
        
        return isValid;
    };
    
    const showStep = function(step) {
        const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        const stepIndicator = document.querySelector(`.step[data-step="${step}"]`);
        
        if (stepElement) {
            stepElement.classList.add('active');
            stepIndicator?.classList.add('active');
        }
        
        // Update review section if on step 5
        if (step === 5) {
            updateReviewSection();
        }
    };
    
    const hideStep = function(step) {
        const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.remove('active');
        }
    };
    
    const updateStepDisplay = function() {
        document.getElementById('currentStep').textContent = currentStep;
        
        // Update step indicators
        document.querySelectorAll('.step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (stepNum < currentStep) {
                step.classList.add('completed');
            } else if (stepNum === currentStep) {
                step.classList.add('active');
            }
        });
    };
    
    const updateButtons = function() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        prevBtn.disabled = currentStep === 1;
        
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'flex';
        } else {
            nextBtn.style.display = 'flex';
            submitBtn.style.display = 'none';
        }
    };
    
    const updateProgressBar = function() {
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    };
    
    const updateReviewSection = function() {
        const formData = collectFormData();
        
        // Personal Details
        document.getElementById('reviewName').textContent = 
            `${formData.firstName || '-'} ${formData.lastName || '-'}`;
        document.getElementById('reviewDOB').textContent = 
            formData.dob ? new Date(formData.dob).toLocaleDateString() : '-';
        document.getElementById('reviewGender').textContent = 
            formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : '-';
        
        // Contact Information
        document.getElementById('reviewEmail').textContent = formData.email || '-';
        document.getElementById('reviewPhone').textContent = formData.phone || '-';
        document.getElementById('reviewAddress').textContent = formData.address || '-';
        
        // Education & Experience
        document.getElementById('reviewEducation').textContent = 
            formData.education ? formData.education.replace('-', ' ').toUpperCase() : '-';
        document.getElementById('reviewInstitution').textContent = formData.institution || '-';
        document.getElementById('reviewExperience').textContent = formData.experience || '-';
        
        // Skills & Preferences
        const skills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
            .map(skill => skill.value)
            .join(', ');
        document.getElementById('reviewSkills').textContent = skills || '-';
        document.getElementById('reviewJobRole').textContent = formData.jobRole || '-';
        document.getElementById('reviewSalary').textContent = 
            formData.salary ? `$${parseInt(formData.salary).toLocaleString()}` : '-';
        document.getElementById('reviewWorkPref').textContent = 
            formData.workPref ? formData.workPref.charAt(0).toUpperCase() + formData.workPref.slice(1) : '-';
    };
    
    const collectFormData = function() {
        const formData = {};
        const form = document.getElementById('multistepForm');
        const formElements = form.elements;
        
        // Collect regular form data
        for (let element of formElements) {
            if (element.name && !element.disabled) {
                if (element.type === 'checkbox' && element.name === 'skills') {
                    // Handle skills separately
                    continue;
                } else if (element.type === 'checkbox' || element.type === 'radio') {
                    if (element.checked) {
                        formData[element.name] = element.value;
                    }
                } else if (element.type !== 'button' && element.type !== 'submit') {
                    formData[element.name] = element.value;
                }
            }
        }
        
        // Collect skills
        const skills = Array.from(document.querySelectorAll('input[name="skills"]:checked'))
            .map(skill => skill.value);
        formData.skills = skills;
        
        return formData;
    };
    
    const populateForm = function(data) {
        for (const key in data) {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox' && key === 'skills') {
                    // Handle skills checkboxes
                    const skills = Array.isArray(data[key]) ? data[key] : [data[key]];
                    document.querySelectorAll('input[name="skills"]').forEach(checkbox => {
                        checkbox.checked = skills.includes(checkbox.value);
                    });
                } else if (element.type === 'checkbox' || element.type === 'radio') {
                    element.checked = element.value === data[key];
                } else {
                    element.value = data[key];
                    
                    // Trigger change event for dependent updates
                    if (element.type === 'range') {
                        element.dispatchEvent(new Event('input'));
                    }
                }
            }
        }
        
        // Trigger skills counter update
        updateSkillsCounter();
    };
    
    const handleSubmit = function(e) {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }
        
        // Show loading state
        UIControls.showLoading();
        
        // Simulate API call
        setTimeout(() => {
            const formData = collectFormData();
            
            // Save final data
            StorageManager.saveFormData(formData);
            StorageManager.markAsCompleted();
            
            // Hide form and show success message
            document.getElementById('multistepForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            
            // Reset loading state
            UIControls.hideLoading();
            
            // Log submission (in production, send to server)
            console.log('Form submitted:', formData);
            UIControls.showNotification('Form submitted successfully!', 'success');
        }, 1500);
    };
    
    const downloadData = function() {
        const formData = StorageManager.getFormData();
        const dataStr = JSON.stringify(formData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `form-data-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        UIControls.showNotification('Data downloaded successfully!', 'success');
    };
    
    const resetForm = function() {
        if (confirm('Are you sure you want to start a new form? All current data will be cleared.')) {
            document.getElementById('multistepForm').reset();
            document.getElementById('multistepForm').style.display = 'block';
            document.getElementById('successMessage').style.display = 'none';
            
            // Reset to step 1
            hideStep(currentStep);
            currentStep = 1;
            showStep(currentStep);
            updateStepDisplay();
            updateButtons();
            updateProgressBar();
            
            // Clear storage
            StorageManager.clearData();
            
            // Clear errors
            UIControls.clearErrors();
            
            UIControls.showNotification('Form reset successfully', 'info');
        }
    };
    
    return {
        init,
        nextStep,
        prevStep,
        collectFormData,
        populateForm,
        currentStep: () => currentStep,
        totalSteps: () => totalSteps
    };
})();