class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        document.getElementById("confirm").addEventListener("click", () => this.createList());
    }

    createList() {
        const title = document.getElementById("list-title").value.trim();
        const selectedParticipants = [...document.querySelectorAll("#participants-list input:checked")].map(input => input.value);

        if (!title) {
            alert("Bitte einen Titel für die Einkaufsliste eingeben.");
            return;
        }

        const newList = this.model.addList(title, selectedParticipants);
        this.view.renderList(this.model.getLists());
        this.view.hidePopup();
    }
}

const controller = new Controller(model, view);
