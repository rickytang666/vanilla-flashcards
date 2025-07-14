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
        // clear main element content
        this.mainElement.innerHTML = '';

        // Always show the "Add New Flashcard" button
        const headerDiv = document.createElement('div');
        headerDiv.innerHTML = `
            <div class="flashcards-header">
                <h2>Your Flashcards (${this.flashcards.length})</h2>
                <button class="btn-create">+ Create New Flashcard</button>
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
}

// initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FlashcardApp();
});