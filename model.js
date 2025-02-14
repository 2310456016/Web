class Model {
    constructor() {
        this.lists = [];
        this.participants = [];
        this.products = []; // Neu: Produkte-Array
        this.loadParticipants();
        this.loadProducts(); // Neu: Produkte laden
    }

    async loadParticipants() {
        try {
            const response = await fetch("user.json");
            if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`);
            this.participants = await response.json();
        } catch (error) {
            console.error("Fehler beim Laden der Teilnehmer:", error);
        }
    }

    async loadProducts() { // Neu: Produkte laden
        try {
            const response = await fetch("product.json");
            if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`);
            this.products = await response.json();
            console.log("Produkte geladen:", this.products); // Debug
        } catch (error) {
            console.error("Fehler beim Laden der Produkte:", error);
        }
    }

    addList(title, selectedParticipants) {
        const newList = { title, participants: selectedParticipants };
        this.lists.push(newList);
        return newList;
    }

    getLists() {
        return this.lists;
    }

    getParticipants() {
        return this.participants;
    }

    getProducts() { // Neu: Methode, um Produkte zu holen
        return this.products;
    }
}

const model = new Model();
