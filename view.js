class View {
    constructor() {
        this.popup = document.getElementById("popup");
        this.listContainer = document.getElementById("list-row");
        this.participantsList = document.getElementById("participants-list");
        this.productsList = document.getElementById("products-list"); // Neu: Produkt-Liste
        this.listTitleInput = document.getElementById("list-title");

        // Event-Listener
        document.querySelector(".bcreate").addEventListener("click", () => this.showPopup());
        document.querySelector(".close").addEventListener("click", () => this.hidePopup());
    }

    async showPopup() {
        this.popup.style.display = "block";
        this.listTitleInput.value = "";
        this.participantsList.innerHTML = "";
        this.productsList.innerHTML = ""; // Neu: Produkte zurücksetzen

        if (model.participants.length === 0) {
            await model.loadParticipants();
        }
        if (model.products.length === 0) {
            await model.loadProducts();
        }

        // Teilnehmer anzeigen
        model.getParticipants().forEach(person => {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" value="${person.Name}"> ${person.Name}`;
            this.participantsList.appendChild(label);
        });

        // Produkte anzeigen
        model.getProducts().forEach(product => {
            const div = document.createElement("div");
            div.innerHTML = `<input type="checkbox" value="${product.Name}"> ${product.Name} 
                            <input type="number" min="1" value="1" class="product-qty" data-name="${product.Name}">`;
            this.productsList.appendChild(div);
        });
    }

    hidePopup() {
        this.popup.style.display = "none";
    }

    renderList(lists) {
        this.listContainer.innerHTML = "";
        lists.forEach(list => {
            const card = document.createElement("div");
            card.classList.add("col-md-4", "mb-3");

            // Hier werden die Cards mit den Buttons erstellt
            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${list.title}</h5>
                        <p class="card-text">${list.participants.length > 0 ? list.participants.join(", ") : "Keine Teilnehmer"}</p>

                        <!-- Buttons unter den Teilnehmern -->
                        <div class="d-flex flex-column">
                            <button class="bedit">Bearbeiten</button>
                            <button class="bdone">Abschließen</button>
                            <button class="bdelete">Löschen</button>
                        </div>
                    </div>
                </div>
            `;

            this.listContainer.appendChild(card);
        });
    }
}

const view = new View();
