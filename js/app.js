// flashcard class
class Flashcard {
    constructor() {
        this.question = '[EMPTY]';
        this.answer = '[EMPTY]';
        this.modifiedTime = Date.now();
        this.retentionScore = 0;
    }
}

// local storage manager
class FlashcardStorage {
    constructor() {
        this.storageKey = 'vanilla-flashcards';
    }

    // retrieve flashcards from localStorage
    getFlashcards() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error retrieving flashcards: ', error);
            return [];
        }
    }

    // save flashcards to localStoage
    saveFlashcards(flashcards) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(flashcards));
            return true;
        } catch (error) {
            console.error('Error saving flashcards', error);
            return false;
        }
    }
}

// app controller
class FlashcardApp {
    
    constructor() {
        this.storage = new FlashcardStorage();
        this.flashcards = [];
        this.mainElement = document.querySelector('main');
        
        this.init();
    }

    init() {
        this.loadFlashcards();
        // this.addTestData();
        this.render();

        this.mainElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-create')) {
                console.log('Add button clicked');
                const newCard = new Flashcard();
                newCard.id = Date.now(); // simple ID
                this.flashcards.push(newCard);
                this.storage.saveFlashcards(this.flashcards); // save to localStorage
                this.render();
            }

            if (event.target.classList.contains('btn-delete')) {
                const cardId = event.target.getAttribute('data-id'); // get id
                this.flashcards = this.flashcards.filter(card => card.id != cardId); // filter the array
                this.storage.saveFlashcards(this.flashcards); // save to localStorage
                this.render();
            }            
            
            if (event.target.classList.contains('btn-edit')) {
                const cardId = event.target.getAttribute('data-id');
                this.showEditModal(cardId);
            }

            if (event.target.classList.contains('btn-practice')) {
                this.startPracticeMode();
            }
        });
    }

    loadFlashcards() {
        this.flashcards = this.storage.getFlashcards();
        console.log('Loaded', this.flashcards.length, 'flashcards.')
    }

    addTestData() {
        if (this.flashcards.length === 0) {
            console.log('No flashcards found, adding test data...');
            
            const testData = [
                { id: 1, question: "What is JavaScript?", answer: "A programming language for web development" },
                { id: 2, question: "What is HTML?", answer: "HyperText Markup Language" },
                { id: 3, question: "What is CSS?", answer: "Cascading Style Sheets" }
            ];
            
            this.flashcards = testData;
            this.storage.saveFlashcards(this.flashcards);
            console.log('Test data added and saved to localStorage');
        }
    }

    render() {
        // Sort flashcards by modified time (newest first) before rendering
        this.sortNewest();
        
        // clear main element content
        this.mainElement.innerHTML = '';

        // Always show the "Add New Flashcard" button
        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = `
            <div class="flashcards-header">
                <h2>Your Flashcards (${this.flashcards.length})</h2>
                <div class="header-buttons">
                    ${this.flashcards.length > 0 ? '<button class="btn-practice">🎯 Practice</button>' : ''}
                    <button class="btn-create">+ Create New Flashcard</button>
                </div>
            </div>
        `;
        this.mainElement.appendChild(headerDiv);

        if (this.flashcards.length === 0) {
            // Show empty state message
            const emptyDiv = document.createElement('div');
            emptyDiv.innerHTML = `
                <div class="empty-state">
                    <h2>No flashcards yet!</h2>
                    <p>Create your first flashcard to get started with learning.</p>
                </div>
            `;
            this.mainElement.appendChild(emptyDiv);
        } else {
            // Create cards grid
            const cardsGrid = document.createElement('div');
            cardsGrid.className = 'cards-grid';

            this.flashcards.forEach(flashcard => {
                const cardDiv = document.createElement('div');
                cardDiv.className = 'flashcard-item';
                cardDiv.innerHTML = `
                    <div class="card-question">
                        <strong>Q:</strong> ${flashcard.question}
                    </div>
                    <div class="card-answer">
                        <strong>A:</strong> ${flashcard.answer}
                    </div>
                    <div class="card-actions">
                        <button class="btn-edit" data-id="${flashcard.id}">Edit</button>
                        <button class="btn-delete" data-id="${flashcard.id}">Delete</button>
                    </div>
                `;
                cardsGrid.appendChild(cardDiv);
            });

            this.mainElement.appendChild(cardsGrid);
        }
    }

    showEditModal(cardId) {
        // Find the flashcard to edit
        const flashcard = this.flashcards.find(card => card.id == cardId);
        if (!flashcard) return;

        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Edit Flashcard</h2>
                <form class="edit-form">
                    <div class="form-group">
                        <label for="edit-question">Question:</label>
                        <textarea id="edit-question" name="question" rows="3" required>${flashcard.question}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-answer">Answer:</label>
                        <textarea id="edit-answer" name="answer" rows="3" required>${flashcard.answer}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-save">Save Changes</button>
                        <button type="button" class="btn-cancel">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        // Add event listeners
        modal.querySelector('.btn-cancel').addEventListener('click', () => this.hideEditModal());
        modal.querySelector('.btn-save').addEventListener('click', (e) => {
            e.preventDefault();
            this.saveEditedCard(cardId);
        });

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideEditModal();
        });

        // Add to page
        document.body.appendChild(modal);
    }

    hideEditModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    saveEditedCard(cardId) {
        const questionInput = document.getElementById('edit-question');
        const answerInput = document.getElementById('edit-answer');

        // Find and update the flashcard
        const flashcard = this.flashcards.find(card => card.id == cardId);
        if (flashcard) {
            flashcard.question = questionInput.value.trim();
            flashcard.answer = answerInput.value.trim();
            flashcard.modifiedTime = Date.now();

            // Save and refresh
            this.storage.saveFlashcards(this.flashcards);
            this.render();
            this.hideEditModal();
        }
    }

    sortNewest() {
        this.flashcards.sort((a, b) => b.modifiedTime - a.modifiedTime);
    }

    startPracticeMode() {
        if (this.flashcards.length === 0) {
            alert('No flashcards to practice!');
            return;
        }

        // Sort flashcards by retention score ascending
        this.practiceQueue = [...this.flashcards].sort((a, b) => a.retentionScore - b.retentionScore); // spread syntax
        this.currentPracticeIndex = 0;
        this.showFront = true;
        
        this.showPracticeModal();
    }

    showPracticeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay practice-modal';
        modal.innerHTML = `
            <div class="modal-content practice-content">
                <div class="practice-header">
                    <h2>Practice Mode</h2>
                    <button class="btn-close" title="Close Practice">×</button>
                </div>
                <div class="practice-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.currentPracticeIndex / this.practiceQueue.length) * 100}%"></div>
                    </div>
                    <span class="progress-text">${this.currentPracticeIndex + 1} / ${this.practiceQueue.length}</span>
                </div>
                <div class="practice-card">
                    ${this.renderPracticeCard()}
                </div>
                <div class="practice-actions">
                    ${this.renderPracticeActions()}
                </div>
            </div>
        `;

        // Add event listeners
        modal.querySelector('.btn-close').addEventListener('click', () => this.hidePracticeModal());
        
        // Add keyboard listeners
        this.addKeyboardListeners();
        
        // Add card flip listener
        modal.querySelector('.practice-card').addEventListener('click', () => this.flipCard());
        
        // Add grading listeners
        this.addGradingListeners(modal);

        document.body.appendChild(modal);
    }

    addKeyboardListeners() {
        this.keyboardHandler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                this.hidePracticeModal();
            } else if (this.showFront) {
                // any key except ESC flips the card
                e.preventDefault();
                e.stopPropagation();
                this.flipCard();
            } else {
                // grading hotkeys
                const gradeKeys = {
                    'h' : '0',
                    'j' : '1',
                    'k' : '2',
                    'l' : '3',
                    ';' : '4'
                };

                if (gradeKeys[e.key.toLowerCase()]) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.gradeCard(gradeKeys[e.key.toLowerCase()]);
                }
            }
        };
        document.addEventListener('keydown', this.keyboardHandler);
    }

    removeKeyboardListeners() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
    }

    renderPracticeCard() {
        const currentCard = this.practiceQueue[this.currentPracticeIndex];
        
        if (this.showFront) {
            return `
                <div class="card-front">
                    <div class="card-label">Question:</div>
                    <div class="card-content">${currentCard.question}</div>
                    <div class="flip-hint">Click to reveal answer</div>
                </div>
            `;
        } else {
            return `
                <div class="card-back">
                    <div class="card-label">Answer:</div>
                    <div class="card-content">${currentCard.answer}</div>
                </div>
            `;
        }
    }

    renderPracticeActions() {
        if (this.showFront) {
            return `<div class="flip-message">Press any key (except ESC) to see the answer</div>`;
        } else {
            return `
                <div class="grading-buttons">
                    <button class="btn-grade btn-cooked" data-grade="0">
                        <div class="grade-emoji">🥵</div>
                        <div class="grade-text">Cooked</div>
                        <div class="hotkey-description">
                            <p>Press</p>
                            <p class="hotkey">H</p>
                        </div>
                    </button>
                    <button class="btn-grade btn-not-remembering" data-grade="1">
                        <div class="grade-emoji">😵</div>
                        <div class="grade-text">Not remembering much</div>
                        <div class="hotkey-description">
                            <p>Press</p>
                            <p class="hotkey">J</p>
                        </div>
                    </button>
                    <button class="btn-grade btn-partially" data-grade="2">
                        <div class="grade-emoji">🤔</div>
                        <div class="grade-text">Partially recalled</div>
                        <div class="hotkey-description">
                            <p>Press</p>
                            <p class="hotkey">K</p>
                        </div>
                    </button>
                    <button class="btn-grade btn-effort" data-grade="3">
                        <div class="grade-emoji">😉</div>
                        <div class="grade-text">Recalled with effort</div>
                        <div class="hotkey-description">
                            <p>Press</p>
                            <p class="hotkey">L</p>
                        </div>
                    </button>
                    <button class="btn-grade btn-slayed" data-grade="4">
                        <div class="grade-emoji">😆</div>
                        <div class="grade-text">Slayed</div>
                        <div class="hotkey-description">
                            <p>Press</p>
                            <p class="hotkey">;</p>
                        </div>
                    </button>
                </div>
            `;
        }
    }

    flipCard() {
        if (this.showFront) {
            this.showFront = false;
            this.updatePracticeModal();
        }
    }

    addGradingListeners(modal) {
        modal.addEventListener('click', (e) => {
            // Find the button element (could be the target or a parent)
            const button = e.target.closest('.btn-grade');
            if (button) {
                const grade = button.getAttribute('data-grade');
                this.gradeCard(grade);
            }
        });
    }

    gradeCard(grade) {
        const currentCard = this.practiceQueue[this.currentPracticeIndex];
        
        // Set retention score directly to the grade (0-4)
        currentCard.retentionScore += parseInt(grade);

        // Update modified time
        currentCard.modifiedTime = Date.now();

        // Move to next card
        this.currentPracticeIndex++;
        this.showFront = true;

        if (this.currentPracticeIndex >= this.practiceQueue.length) {
            this.showPracticeComplete();
        } else {
            this.updatePracticeModal();
        }

        // Save changes to localStorage
        this.storage.saveFlashcards(this.flashcards);
    }

    updatePracticeModal() {
        const modal = document.querySelector('.practice-modal');
        if (modal) {
            modal.querySelector('.practice-card').innerHTML = this.renderPracticeCard();
            modal.querySelector('.practice-actions').innerHTML = this.renderPracticeActions();
            modal.querySelector('.progress-fill').style.width = `${(this.currentPracticeIndex / this.practiceQueue.length) * 100}%`;
            modal.querySelector('.progress-text').textContent = `${this.currentPracticeIndex + 1} / ${this.practiceQueue.length}`;
        }
    }

    showPracticeComplete() {
        const modal = document.querySelector('.practice-modal');
        if (modal) {
            modal.querySelector('.modal-content').innerHTML = `
                <div class="practice-header">
                    <h2>Practice Complete!</h2>
                    <button class="btn-close" title="Close Practice">×</button>
                </div>
                <div class="practice-complete">
                    <div class="complete-icon">🎉</div>
                    <h3>Great job!</h3>
                    <p>You've finished practicing all ${this.practiceQueue.length} flashcards.</p>
                    <button class="btn-done">Done</button>
                </div>
            `;
            
            // Add close listeners
            modal.querySelector('.btn-close').addEventListener('click', () => this.hidePracticeModal());
            modal.querySelector('.btn-done').addEventListener('click', () => this.hidePracticeModal());
        }
    }

    hidePracticeModal() {
        const modal = document.querySelector('.practice-modal');
        if (modal) {
            modal.remove();
        }
        this.removeKeyboardListeners();
        // Re-render main page to show updated retention scores
        this.render();
    }
}

// initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FlashcardApp();
});