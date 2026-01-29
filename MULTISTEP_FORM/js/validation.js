// Validation Module
const Validation = (function() {
    const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\+]?[0-9\s\-\(\)]{10,}$/,
        name: /^[A-Za-z\s\-']{2,50}$/,
        city: /^[A-Za-z\s\-']{2,50}$/,
        salary: /^[0-9]{4,6}$/
    };
    
    const messages = {
        required: 'This field is required',
        invalidEmail: 'Please enter a valid email address',
        invalidPhone: 'Please enter a valid phone number',
        invalidName: 'Please enter a valid name (2-50 characters)',
        invalidCity: 'Please enter a valid city name',
        futureDate: 'Date cannot be in the future',
        underAge: 'You must be at least 18 years old',
        overAge: 'Age must be reasonable',
        minSkills: 'Please select at least one skill',
        terms: 'You must accept the terms and conditions'
    };
    
    const validateField = function(field) {
        const value = field.value.trim();
        const fieldId = field.id || field.name;
        const fieldType = field.type;
        
        // Check required fields
        if (field.hasAttribute('required') && !value) {
            return messages.required;
        }
        
        // Skip further validation if empty and not required
        if (!value && !field.hasAttribute('required')) {
            return null;
        }
        
        // Type-specific validation
        switch (fieldType) {
            case 'email':
                if (!patterns.email.test(value)) {
                    return messages.invalidEmail;
                }
                break;
                
            case 'tel':
                if (!patterns.phone.test(value.replace(/[\s\-\(\)]/g, ''))) {
                    return messages.invalidPhone;
                }
                break;
                
            case 'text':
                if (fieldId.includes('Name') || fieldId === 'firstName' || fieldId === 'lastName') {
                    if (!patterns.name.test(value)) {
                        return messages.invalidName;
                    }
                }
                if (fieldId === 'city') {
                    if (!patterns.city.test(value)) {
                        return messages.invalidCity;
                    }
                }
                break;
                
            case 'date':
                if (fieldId === 'dob') {
                    const dob = new Date(value);
                    const today = new Date();
                    const age = today.getFullYear() - dob.getFullYear();
                    
                    if (dob > today) {
                        return messages.futureDate;
                    }
                    
                    if (age < 18) {
                        return messages.underAge;
                    }
                    
                    if (age > 100) {
                        return messages.overAge;
                    }
                }
                break;
                
            case 'range':
                if (fieldId === 'salary') {
                    const numValue = parseInt(value);
                    if (numValue < 20000 || numValue > 150000) {
                        return 'Salary must be between $20,000 and $150,000';
                    }
                }
                break;
        }
        
        // Select validation
        if (field.tagName === 'SELECT' && value === '') {
            if (field.hasAttribute('required')) {
                return messages.required;
            }
        }
        
        return null; // No error
    };
    
    const validateStep = function(stepNumber) {
        const stepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        const inputs = stepElement.querySelectorAll('input, select, textarea');
        let errors = [];
        
        inputs.forEach(input => {
            const error = validateField(input);
            if (error) {
                errors.push({
                    field: input.id || input.name,
                    message: error
                });
            }
        });
        
        // Special validation for skills in step 4
        if (stepNumber === 4) {
            const skills = document.querySelectorAll('input[name="skills"]:checked');
            if (skills.length === 0) {
                errors.push({
                    field: 'skills',
                    message: messages.minSkills
                });
            }
        }
        
        return errors;
    };
    
    const validateForm = function(formData) {
        let isValid = true;
        const errors = {};
        
        // Validate all fields
        for (const field in formData) {
            const element = document.querySelector(`[name="${field}"]`);
            if (element && element.hasAttribute('required')) {
                const error = validateField(element);
                if (error) {
                    isValid = false;
                    errors[field] = error;
                }
            }
        }
        
        return {
            isValid,
            errors
        };
    };
    
    const formatPhoneNumber = function(phone) {
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');
        
        // Check if the number starts with country code
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 11) {
            return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
        } else if (cleaned.length === 12) {
            return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
        }
        
        return phone; // Return as is if pattern doesn't match
    };
    
    const formatDate = function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    return {
        validateField,
        validateStep,
        validateForm,
        formatPhoneNumber,
        formatDate,
        patterns,
        messages
    };
})();