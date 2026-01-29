// UI Controls Module
const UIControls = (function() {
    const init = function() {
        // Initialize tooltips
        initTooltips();
        
        // Initialize animations
        initAnimations();
    };
    
    const initTooltips = function() {
        // Add tooltips to form labels with info icons
        const tooltipLabels = document.querySelectorAll('label');
        tooltipLabels.forEach(label => {
            const fieldId = label.getAttribute('for');
            if (fieldId) {
                const tooltipText = getTooltipText(fieldId);
                if (tooltipText) {
                    const tooltipIcon = document.createElement('i');
                    tooltipIcon.className = 'fas fa-info-circle tooltip';
                    tooltipIcon.style.marginLeft = '5px';
                    tooltipIcon.style.color = '#6a11cb';
                    tooltipIcon.style.cursor = 'help';
                    
                    const tooltipSpan = document.createElement('span');
                    tooltipSpan.className = 'tooltiptext';
                    tooltipSpan.textContent = tooltipText;
                    
                    tooltipIcon.appendChild(tooltipSpan);
                    label.appendChild(tooltipIcon);
                }
            }
        });
    };
    
    const getTooltipText = function(fieldId) {
        const tooltips = {
            firstName: 'Enter your legal first name as per official documents',
            lastName: 'Enter your legal last name/surname',
            dob: 'Must be at least 18 years old',
            email: 'We\'ll send confirmation to this email',
            phone: 'Include country code (e.g., +92 for Pakistan)',
            salary: 'Your annual salary expectation in USD',
            skills: 'Select all relevant skills you have experience with',
            bio: 'Brief introduction about yourself (max 500 characters)'
        };
        
        return tooltips[fieldId] || null;
    };
    
    const initAnimations = function() {
        // Add animation classes to form elements
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            group.style.animationDelay = `${index * 0.1}s`;
            group.classList.add('animate-on-load');
        });
    };
    
    const showError = function(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'flex';
            
            // Add error class to input
            const input = document.querySelector(`[name="${elementId.replace('Error', '')}"]`);
            if (input) {
                input.classList.add('error');
            }
        }
    };
    
    const clearErrors = function() {
        // Clear all error messages
        document.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
        
        // Remove error classes from inputs
        document.querySelectorAll('.error').forEach(input => {
            input.classList.remove('error');
        });
    };
    
    const showNotification = function(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-remove after 5 seconds
        const autoRemove = setTimeout(() => {
            hideNotification(notification);
        }, 5000);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            hideNotification(notification);
        });
    };
    
    const getNotificationIcon = function(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    };
    
    const hideNotification = function(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    };
    
    const showLoading = function() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <div class="spinner"></div>
                Processing...
            `;
            submitBtn.disabled = true;
            
            // Store original content for restoration
            submitBtn.dataset.originalHtml = originalHTML;
        }
    };
    
    const hideLoading = function() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn && submitBtn.dataset.originalHtml) {
            submitBtn.innerHTML = submitBtn.dataset.originalHtml;
            submitBtn.disabled = false;
        }
    };
    
    const shakeForm = function() {
        const form = document.querySelector('.form-step.active');
        if (form) {
            form.classList.add('shake');
            setTimeout(() => {
                form.classList.remove('shake');
            }, 500);
        }
    };
    
    const showAutoSaveNotification = function() {
        const progress = StorageManager.getFormProgress();
        const lastSaved = StorageManager.getLastSavedTime();
        
        if (progress > 0) {
            // Update storage info display
            const storageInfo = document.querySelector('.storage-info');
            if (storageInfo) {
                storageInfo.innerHTML = `
                    <i class="fas fa-save" style="color: #4CAF50;"></i>
                    <span>Progress: ${progress}% saved ${lastSaved ? 'at ' + lastSaved : ''}</span>
                `;
            }
            
            // Show brief save indicator
            const saveIndicator = document.createElement('div');
            saveIndicator.className = 'save-indicator';
            saveIndicator.textContent = 'Saved';
            saveIndicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 14px;
                z-index: 1000;
                animation: fadeInOut 2s ease;
            `;
            
            document.body.appendChild(saveIndicator);
            
            setTimeout(() => {
                saveIndicator.remove();
            }, 2000);
        }
    };
    
    const updateProgressIndicator = function() {
        const progress = StorageManager.getFormProgress();
        const progressBar = document.getElementById('progressFill');
        
        if (progressBar) {
            // Animate to new width
            progressBar.style.transition = 'width 0.5s ease';
            progressBar.style.width = `${progress}%`;
            
            // Update color based on progress
            if (progress < 30) {
                progressBar.style.background = '#ff4757';
            } else if (progress < 70) {
                progressBar.style.background = '#ffa502';
            } else {
                progressBar.style.background = 'linear-gradient(90deg, #6a11cb, #2575fc)';
            }
        }
    };
    
    const createConfetti = function() {
        const confettiCount = 100;
        const colors = ['#6a11cb', '#2575fc', '#4CAF50', '#FFC107', '#FF5722'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                z-index: 9999;
                pointer-events: none;
            `;
            
            document.body.appendChild(confetti);
            
            // Animation
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 3000 + 2000,
                easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
            });
            
            animation.onfinish = () => confetti.remove();
        }
    };
    
    // Add CSS for animations
    const addAnimationStyles = function() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translateY(10px); }
                10%, 90% { opacity: 1; transform: translateY(0); }
            }
            
            .shake {
                animation: shake 0.5s ease;
            }
            
            .animate-on-load {
                animation: fadeIn 0.5s ease forwards;
                opacity: 0;
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 350px;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                margin-left: auto;
            }
            
            .save-indicator {
                animation: fadeInOut 2s ease;
            }
            
            .error {
                border-color: #e74c3c !important;
                background: #ffeaea !important;
            }
        `;
        document.head.appendChild(style);
    };
    
    // Initialize animation styles
    addAnimationStyles();
    
    return {
        init,
        showError,
        clearErrors,
        showNotification,
        hideNotification,
        showLoading,
        hideLoading,
        shakeForm,
        showAutoSaveNotification,
        updateProgressIndicator,
        createConfetti
    };
})();