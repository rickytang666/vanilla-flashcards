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

        if (this.flashcards.length === 0) {
            // Show empty state message
            const emptyDiv = document.createElement('div');
            emptyDiv.innerHTML = `
                <div class="empty-state">
                    <h2>No flashcards yet!</h2>
                    <p>Create your first flashcard to get started with learning.</p>
                    <button class="btn-primary">+ Create First Flashcard</button>
                </div>
            `;
            this.mainElement.appendChild(emptyDiv);
        } else {
            // Show flashcards as cards
            const headerDiv = document.createElement('div');
            headerDiv.innerHTML = `
                <div class="flashcards-header">
                    <h2>Your Flashcards (${this.flashcards.length})</h2>
                    <button class="btn-primary">+ Add New Flashcard</button>
                </div>
            `;
            this.mainElement.appendChild(headerDiv);

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
}

// initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FlashcardApp();
});