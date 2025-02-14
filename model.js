class Model {
    constructor() {
        this.lists = [];
        this.participants = [];
        this.loadParticipants();
    }

    async loadParticipants() {
        try {
            const response = await fetch("user.json");
            this.participants = await response.json();
        } catch (error) {
            console.error("Fehler beim Laden der Teilnehmer:", error);
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
}

const model = new Model();
