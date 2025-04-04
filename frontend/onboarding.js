class OnboardingApp {
    constructor() {
        this.state = {
            currentStep: 1,
            totalSteps: 5,
            answers: {}
        };

        this.init = this.init.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.saveAnswers = this.saveAnswers.bind(this);
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init);
            return;
        }

        this.initializeElements();
        this.attachEventListeners();
        this.updateProgressBar();
    }

    initializeElements() {
        this.onboardingCard = document.querySelector('.onboarding-card');
        this.progressBar = document.querySelector('.progress-bar');
        this.nextButton = document.querySelector('.next-button');
        this.backButton = document.querySelector('.back-button');
        this.questionContainers = document.querySelectorAll('.question-container');

        // Add fade-in animation
        setTimeout(() => {
            this.onboardingCard.classList.add('fade-in');
        }, 100);
    }

    attachEventListeners() {
        this.nextButton.addEventListener('click', this.handleNext);
        this.backButton.addEventListener('click', this.handleBack);

        // Add input change listeners
        this.questionContainers.forEach(container => {
            const inputs = container.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    this.saveAnswers();
                    this.nextButton.disabled = false;
                });
            });
        });
    }

    updateProgressBar() {
        const progress = (this.state.currentStep / this.state.totalSteps) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    saveAnswers() {
        const currentContainer = this.questionContainers[this.state.currentStep - 1];
        const selectedInput = currentContainer.querySelector('input[type="radio"]:checked');
        
        if (selectedInput) {
            const questionId = currentContainer.getAttribute('data-question');
            this.state.answers[questionId] = selectedInput.value;
        }
    }

    async handleNext() {
        this.saveAnswers();

        if (this.state.currentStep < this.state.totalSteps) {
            this.state.currentStep++;
            this.updateUI();
        } else {
            await this.finishOnboarding();
        }
    }

    handleBack() {
        if (this.state.currentStep > 1) {
            this.state.currentStep--;
            this.updateUI();
        }
    }

    updateUI() {
        // Update progress
        this.updateProgressBar();

        // Show/hide questions
        this.questionContainers.forEach((container, index) => {
            container.style.display = index === this.state.currentStep - 1 ? 'block' : 'none';
        });

        // Update button states
        this.backButton.style.display = this.state.currentStep === 1 ? 'none' : 'block';
        this.nextButton.textContent = this.state.currentStep === this.state.totalSteps ? 'Finish' : 'Next';

        // Check if there's a selected option for the current step
        const currentContainer = this.questionContainers[this.state.currentStep - 1];
        const hasSelection = currentContainer.querySelector('input[type="radio"]:checked');
        this.nextButton.disabled = !hasSelection;
    }

    async finishOnboarding() {
        // Save user preferences to localStorage
        const userPreferences = {
            userName: 'User', // You can add a name input if needed
            onboardingAnswers: this.state.answers
        };
        localStorage.setItem('userPreferences', JSON.stringify(userPreferences));

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Initialize the app
const app = new OnboardingApp();
app.init();