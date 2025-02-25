class Controller {
    constructor(model) {
        this.model = model;
        this.view = new View(this);

        // Warten auf das Laden der Listen
        this.model.loadLists().then(() => {
            // Sobald die Listen erfolgreich geladen sind, rendere sie
            this.view.renderList(this.model.getLists());
        });

        // Confirm Button für Methode
        document.getElementById("confirm").addEventListener("click", () => this.createOrUpdateList());
    }
    //------------------------------------------------------------------------------------------------------------------
    //Neue Liste erstellen
    createOrUpdateList() {
        const title = document.getElementById("list-title").value.trim();
        const selectedParticipants = [...document.querySelectorAll("#participants-list input:checked")].map(input => input.value);

        const selectedProducts = [...document.querySelectorAll("#products-list input:checked")].map(input => {
            const name = input.value;
            const quantityInput = document.querySelector(`.product-qty[data-name="${name}"]`);
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

            return { name, quantity };
        });

        if (!title) {
            alert("Bitte einen Titel für die Einkaufsliste eingeben.");
            return;
        }
        const editingIndex = this.view.editingIndex;  // Index, um festzustellen, ob wir eine bestehende Liste bearbeiten
        if (editingIndex !== undefined) {
            this.model.updateList(editingIndex, title, selectedParticipants, selectedProducts);
        } else {
            // Wenn wir keine bestehende Liste bearbeiten, dann erstellen wir eine neue
            this.model.addList(title, selectedParticipants, selectedProducts);
        }

        this.view.renderList(this.model.getLists());
        this.view.hidePopup();
        this.view.editingIndex = undefined; // Index nach dem Speichern zurücksetzen
    }

    //------------------------------------------------------------------------------------------------------------------
    // Liste löschen
    deleteList(index) {
        if (confirm("Möchten Sie diese Liste wirklich löschen?")) {
            this.model.deleteList(index);
            this.view.renderList(this.model.getLists());
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Liste bearbeiten
    editList(index) {
        const list = this.model.getLists()[index];
        this.view.editingIndex = index;  // Setzen des Index, um zu wissen, dass wir bearbeiten
        this.view.showPopup();
        this.view.listTitleInput.value = list.title;

        const participantsList = this.view.participantsList;
        participantsList.innerHTML = "";
        this.model.getParticipants().forEach(person => {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" value="${person.Name}" ${list.participants.includes(person.Name) ? "checked" : ""}> ${person.Name}`;
            participantsList.appendChild(label);
        });

        this.view.selectedProducts.clear();
        const productsList = this.view.productsList;
        productsList.innerHTML = "";

        this.model.getProducts().forEach(product => {
            const div = document.createElement("div");
            const isChecked = list.products.some(p => p.name === product.Name);
            const quantity = list.products.find(p => p.name === product.Name)?.quantity || 1;

            div.innerHTML = `
            <input type="checkbox" value="${product.Name}" class="product-checkbox" data-name="${product.Name}" ${isChecked ? "checked" : ""}> 
            ${product.Name} 
            <input type="number" min="1" value="${quantity}" class="product-qty" data-name="${product.Name}">
            <button class="edit-product" data-name="${product.Name}">Bearbeiten</button>
            <button class="delete-product" data-name="${product.Name}">X</button>
        `;

            // Event-Listener für das Bearbeiten
            div.querySelector(".edit-product").addEventListener("click", () => {
                this.view.editProduct(product.Name, product.Tag);
            });

            // Event-Listener für das Löschen-Symbol
            div.querySelector(".delete-product").addEventListener("click", () => {
                this.view.deleteProduct(product.Name);
            });

            productsList.appendChild(div);
        });
    }

    //------------------------------------------------------------------------------------------------------------------
    // Liste updaten
    updateList(index) {
        const title = this.view.listTitleInput.value.trim();
        const selectedParticipants = [...document.querySelectorAll("#participants-list input:checked")].map(input => input.value);
        const selectedProducts = [...document.querySelectorAll("#products-list input:checked")].map(input => {
            const name = input.value;
            const quantityInput = document.querySelector(`.product-qty[data-name="${name}"]`);
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

            return { name, quantity };
        });

        this.model.updateList(index, title, selectedParticipants, selectedProducts);
        this.view.renderList(this.model.getLists());
        this.view.hidePopup();
        this.view.editingIndex = undefined;
    }
    //------------------------------------------------------------------------------------------------------------------
    // Liste abschließen
    completeList(index) {
        const list = this.model.getLists()[index];

        // Überprüfen, ob alle Produkte dieser Liste ausgewählt wurden
        const allProductsChecked = list.products.every(product =>
            list.selectedProducts.has(product.name)  // Prüfen, ob das Produkt in `selectedProducts` der Liste ist
        );

        if (allProductsChecked) {
            // Alle Produkte sind abgehakt --> die Liste kann ohne Nachfragen abgeschlossen werden
            this.model.completeList(index);
            this.view.renderList(this.model.getLists());
            this.view.renderCompletedList(this.model.getCompletedLists());
            alert("Die Liste wird nun abgeschlossen.");
        } else {
            // Bestätigung anzeigen, ob die Liste trotzdem abgeschlossen werden soll, auch wenn noch nicht alle Produkte
            if (confirm("Nicht alle Produkte sind abgehakt. Möchten Sie die Liste trotzdem abschließen?")) {
                this.model.completeList(index);
                this.view.renderList(this.model.getLists());
                this.view.renderCompletedList(this.model.getCompletedLists());
                alert("Die Liste wird nun abgeschlossen.");
            }
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Ansehenpopup: Checkboxen
    toggleProductSelection(list, productName, isSelected) {
        this.model.toggleProductSelection(list, productName, isSelected);
        this.view.renderList(this.model.getLists());
    }



}

const controller = new Controller(model);



