class View {
    constructor(controller) {
        this.controller = controller;
        this.popup = document.getElementById("popup");
        this.listContainer = document.getElementById("list-row");
        this.participantsList = document.getElementById("participants-list");
        this.productsList = document.getElementById("products-list");
        this.listTitleInput = document.getElementById("list-title");
        this.tagDropdown = document.getElementById("tag-dropdown");

        this.selectedProducts = new Set();
        //für Controller: editList, create/update List
        this.editingIndex = undefined;
        this.viewPopup = null;


        document.querySelector(".home").addEventListener("click", function() {
            window.location.href = "index.html"; // zurück zu index.html (Startseite)
        });

        //Neue Liste erstellen
        document.querySelector(".bcreate").addEventListener("click", () => this.showPopup());
        document.querySelector(".close").addEventListener("click", () => this.hidePopup());
        this.tagDropdown.addEventListener("change", () => this.filterProductsByTag());

        //Search Bar
        this.searchBar = document.getElementById("search-bar");
        this.clearSearchButton = document.getElementById("clear-search");

        this.searchBar.addEventListener("input", () => this.filterLists());
        this.clearSearchButton.addEventListener("click", () => this.clearSearch());

        this.searchBar.addEventListener("input", () => {
            this.clearSearchButton.style.display = this.searchBar.value ? "block" : "none";
        });

        //Buttons in Popup
        // Neue Kategorie
        this.newCategoryButton = document.getElementById("new-category-button");
        if (!this.newCategoryButton) {
            this.newCategoryButton = document.createElement("button");
            this.newCategoryButton.id = "new-category-button";
            this.newCategoryButton.textContent = "Neue Kategorie";
            this.newCategoryButton.addEventListener("click", () => this.createNewCategory());
            this.tagDropdown.parentElement.appendChild(this.newCategoryButton);
            // Zeilenumbruch hinzufügen
            this.tagDropdown.parentElement.appendChild(document.createElement("br"));
        }

        // Kategorie löschen
        if (!document.getElementById("delete-category-button")) {
            const deleteButton = document.createElement('button');
            deleteButton.id = "delete-category-button"; // ID setzen
            deleteButton.textContent = 'Kategorie löschen';
            deleteButton.addEventListener('click', this.showDeleteCategoryList.bind(this));
            this.tagDropdown.parentElement.appendChild(deleteButton);
            // Zeilenumbruch hinzufügen
            this.tagDropdown.parentElement.appendChild(document.createElement("br"));
        }

        // Kategorie bearbeiten
        if (!document.getElementById("edit-category-button")) {
            const editButton = document.createElement('button');
            editButton.id = "edit-category-button"; // ID setzen
            editButton.textContent = 'Kategorie bearbeiten';
            editButton.addEventListener('click', this.showEditCategoryList.bind(this));
            this.tagDropdown.parentElement.appendChild(editButton);
            // Zeilenumbruch hinzufügen
            this.tagDropdown.parentElement.appendChild(document.createElement("br"));
        }

        // Neues Produkt
        this.addProductButton = document.createElement("button");
        this.addProductButton.textContent = "Neues Produkt hinzufügen";
        this.addProductButton.addEventListener("click", () => this.showNewProductForm());
        // (nur einmaliges hinzufügen)
        if (!document.getElementById("add-product-button")) {
            this.addProductButton.id = "add-product-button";
            this.productsList.parentElement.appendChild(this.addProductButton);
            // Zeilenumbruch hinzufügen
            this.productsList.parentElement.appendChild(document.createElement("br"));
        }

        // Formular für neues Produkt
        this.newProductForm = document.createElement("div");
        this.newProductForm.style.display = "none";
        this.newProductForm.innerHTML = `
        <input type="text" id="new-product-name" placeholder="Produktname">
        <input type="text" id="new-product-tag" placeholder="Kategorie">
        <button id="save-new-product">Hinzufügen</button>
`;
        this.productsList.parentElement.appendChild(this.newProductForm);

        // Neues Produkt speichern
        const saveButton = document.getElementById("save-new-product");
        if (!saveButton.dataset.listenerAdded) {  // Verhindert doppelte Registrierung
            saveButton.addEventListener("click", () => this.addNewProduct());
            saveButton.dataset.listenerAdded = "true";  // Markiert, dass ein Listener existiert
        }

    }


    //------------------------------------------------------------------------------------------------------------------
    // Erstellen einer neuen Kategorie
    createNewCategory() {
        const newCategory = prompt("Bitte geben Sie den Namen der neuen Kategorie ein:");
        if (newCategory) {
            // Prüfen, ob die Kategorie bereits existiert
            const existingCategories = Array.from(this.tagDropdown.options).map(option => option.value);
            if (existingCategories.includes(newCategory)) {
                alert("Diese Kategorie existiert bereits!");
                return;
            }

            // Neue Kategorie hinzufügen
            const option = document.createElement("option");
            option.value = newCategory;
            option.textContent = newCategory;
            this.tagDropdown.appendChild(option);
        }
    }


    //------------------------------------------------------------------------------------------------------------------
    //Bearbeiten Popup
    async showPopup() {
        this.popup.style.display = "block";
        this.listTitleInput.value = "";
        this.participantsList.innerHTML = "";
        this.productsList.innerHTML = "";
        this.selectedProducts.clear();

        if (model.participants.length === 0) await model.loadParticipants();
        if (model.products.length === 0) await model.loadProducts();

        model.getParticipants().forEach(person => {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" value="${person.Name}"> ${person.Name}`;
            this.participantsList.appendChild(label);
        });

        this.populateTagDropdown(model.getProducts());
        this.displayProducts(model.getProducts());
    }
    //------------------------------------------------------------------------------------------------------------------
    // Verstecken/Nicht mehr anzeigen des hidePopups
    hidePopup() {
        this.popup.style.display = "none";
    }

    //------------------------------------------------------------------------------------------------------------------
    // Kategorie Dropdown
    populateTagDropdown(products) {
        const tags = [...new Set(products.map(product => product.Tag))];  // Tags extrahieren
        this.tagDropdown.innerHTML = "<option value='all'>Alle</option>";  // Standardwert für Dropdown

        tags.forEach(tag => {
            const option = document.createElement("option");
            option.value = tag;
            option.textContent = tag;
            this.tagDropdown.appendChild(option);
        });
    }
    //------------------------------------------------------------------------------------------------------------------
    // Löschen einer Kategorie Auswahlcontainer
    showDeleteCategoryList() {
        const deleteContainer = document.createElement('div');
        deleteContainer.classList.add('delete-category-container');

        // Alle Kategorien abrufen, auch die neu erstellten ohne Produkte
        const tags = [...new Set(this.tagDropdown.querySelectorAll("option"))].map(option => option.value);

        tags.forEach(tag => {
            if (tag !== "all") { // "Alle" soll nicht löschbar sein
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = tag;
                label.textContent = tag;
                label.appendChild(checkbox);
                deleteContainer.appendChild(label);
                deleteContainer.appendChild(document.createElement('br'));
            }
        });

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Löschen bestätigen';
        confirmButton.addEventListener('click', () => this.deleteSelectedCategories(deleteContainer));
        deleteContainer.appendChild(confirmButton);

        this.popup.appendChild(deleteContainer);
    }

    //------------------------------------------------------------------------------------------------------------------
    // Löschen der ausgewählten Kategorien
    deleteSelectedCategories(container) {
        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        const categoriesToDelete = [];
        checkboxes.forEach(checkbox => categoriesToDelete.push(checkbox.value));

        if (categoriesToDelete.length > 0) {
            // Überprüfen, ob in den ausgewählten Kategorien Produkte existieren
            const categoriesWithProducts = categoriesToDelete.filter(category =>
                model.products.some(product => product.Tag === category)
            );

            if (categoriesWithProducts.length > 0) {
                const categoriesList = categoriesWithProducts.join(", ");
                const confirmed = confirm(`In den folgenden Kategorien wurden bereits Produkte angelegt: "${categoriesList}". Möchten Sie diese Kategorien wirklich löschen?`);

                if (!confirmed) {
                    // Abbrechen, wenn der Benutzer nicht bestätigen möchte
                    return;
                }
            }

            // Kategorien aus der Produktliste entfernen
            model.products = model.products.filter(product => !categoriesToDelete.includes(product.Tag));
            this.populateTagDropdown(model.products);  // Dropdown aktualisieren
            this.displayProducts(model.getProducts());  // Produktliste aktualisieren
        }

        // Löschen-Container entfernen
        this.popup.removeChild(container);
    }

    //------------------------------------------------------------------------------------------------------------------
    // Filterfunktion der Kategorie
    filterProductsByTag() {
        const selectedTag = this.tagDropdown.value;

        document.querySelectorAll(".product-checkbox:checked").forEach(checkbox => {
            this.selectedProducts.add(checkbox.value);
        });

        const filteredProducts = model.getProducts().filter(product =>
            selectedTag === "all" || product.Tag === selectedTag
        );

        this.displayProducts(filteredProducts);
    }
    //------------------------------------------------------------------------------------------------------------------
    // Produktanzeige
    displayProducts(products) {
        this.productsList.innerHTML = "";

        products.forEach(product => {
            if (!this.productsList.querySelector(`[data-name="${product.Name}"]`)) {
                const div = document.createElement("div");
                div.innerHTML = `
                <input type="checkbox" value="${product.Name}" class="product-checkbox" data-name="${product.Name}"> 
                ${product.Name} 
                <input type="number" min="1" value="1" class="product-qty" data-name="${product.Name}">
                <button class="edit-product" data-name="${product.Name}">Bearbeiten</i></button>
                <button class="delete-product" data-name="${product.Name}">X</button>
            `;

                const checkbox = div.querySelector(".product-checkbox");

                if (this.selectedProducts.has(product.Name)) {
                    checkbox.checked = true;
                }

                checkbox.addEventListener("change", (e) => {
                    const productName = e.target.value;
                    e.target.checked ? this.selectedProducts.add(productName) : this.selectedProducts.delete(productName);
                });

                const editButton = div.querySelector(".edit-product");
                editButton.addEventListener("click", () => this.editProduct(product.Name, product.Tag));

                const deleteButton = div.querySelector(".delete-product");
                deleteButton.addEventListener("click", () => this.deleteProduct(product.Name));

                this.productsList.appendChild(div);
            }
        });
    }
    //------------------------------------------------------------------------------------------------------------------
    // Produkt bearbeiten
    editProduct(productName, productTag) {
        const checkbox = document.querySelector(`.product-checkbox[data-name="${productName}"]`);

        // Überprüfen, ob das Produkt bereits ausgewählt ist
        if (checkbox && checkbox.checked) {
            alert("Dieses Produkt ist bereits ausgewählt und kann nicht bearbeitet werden!");
            return;
        }

        // Neuer Name und Kategorie abfragen
        const newName = prompt("Neuer Name:", productName);
        const newTag = prompt("Neue Kategorie:", productTag);

        if (newName && newTag) {
            const existingProducts = model.getProducts() || [];

            // Überprüfen, ob der neue Name bereits in der Liste existiert (Vergleich ignoriert Groß-/Kleinschreibung)
            const isDuplicate = existingProducts.some(product =>
                product.Name?.toLowerCase() === newName.toLowerCase() && product.Name !== productName
            );

            if (isDuplicate) {
                alert("Ein Produkt mit diesem Namen existiert bereits!");
                return;
            }

            // Produkt aktualisieren, wenn der Name einzigartig ist
            model.updateProduct(productName, newName, newTag);
            this.populateTagDropdown(model.getProducts());
            this.displayProducts(model.getProducts());
        }
    }
    //----------------------------------------------------------------------------------------------------------------------
    //Löschen eines Produktes
    deleteProduct(productName) {
        const confirmed = confirm(`Möchtest du das Produkt "${productName}" wirklich löschen?`);

        if (confirmed) {
            // Hier speichere ich meine aktuelle Produktauswahl, falls ich bereits Produkte ausgewählt habe
            const selectedProductsBeforeDelete = [...document.querySelectorAll("#products-list input:checked")].map(input => input.value);

            // Das gewünschte Produkt wird gelöscht.
            model.removeProduct(productName);

            // Hier werden die Produkt neu geholt und gerendert.
            this.displayProducts(model.getProducts());

            // Produktauswahlzustand zurücksetzen
            const allProducts = model.getProducts();
            const productsList = document.getElementById("products-list");
            const checkboxes = productsList.querySelectorAll('input[type="checkbox"]');

            checkboxes.forEach(checkbox => {
                const productName = checkbox.value;
                // Hier schaue ich, welches Produkt ich vor dem Löschen ausgewählt habe und die Checkboxen werden wieder angekreuzt
                if (selectedProductsBeforeDelete.includes(productName)) {
                    checkbox.checked = true;
                }
            });
        }
    }

    //----------------------------------------------------------------------------------------------------------------------
    //Anzeigen Produkte
    showNewProductForm() {
        this.newProductForm.style.display = "block";
    }
    //----------------------------------------------------------------------------------------------------------------------
    //Neues Produkt hinzufügen
    addNewProduct() {
        const nameInput = document.getElementById("new-product-name");
        const tagInput = document.getElementById("new-product-tag");

        const nameValue = nameInput.value.trim();
        const tagValue = tagInput.value.trim();

        if (nameValue && tagValue) {
            const existingProducts = model.getProducts() || [];
            // dient nur zur Kontrolle: Ausgabe der Produkte mit denen neues Produkt verglichen wird
            console.log("Vorhandene Produkte:", existingProducts);

            // Checken, ob es bereits ein Produkt mit dem selben Namen gibt
            const isDuplicate = existingProducts.some(product => {
                console.log("Vergleiche:", product.Name, "mit", nameValue);
                return product.Name?.toLowerCase() === nameValue.toLowerCase();
            });

            if (isDuplicate) {
                // Browser Alert: Auskunft für die User
                alert("Dieses Produkt existiert bereits!");
                // Felder zurücksetzen nach der Meldung
                // Felder werden hier geleert und die Platzhalter sind wieder sichtbar
                nameInput.value = "";
                tagInput.value = "";
                // Container, der die Felder beinhaltet wird wieder zugeklappt
                this.newProductForm.style.display = "none";
                return;
            }
            // Das Produkt wird hinzugefügt
            model.addProduct(nameValue, tagValue);

            // Nach dem Hinzufügen, Abruf der neuen/aktualisierten Liste
            const updatedProducts = model.getProducts() || [];
            // Dropdown (Kategorie) wird aktualisert aufgerufen
            this.populateTagDropdown(updatedProducts);
            // Produktliste wird aktualisiert angezeigt
            this.displayProducts(updatedProducts);

            // Felder zurücksetzen nach dem Hinzufügen eines Produktes
            // Jetzt werden die Felder wieder geleert, damit wieder die Platzhalter sichtbar sind
            nameInput.value = "";
            tagInput.value = "";
            // Container mit den Bearbeitungsfeldern wird zugeklappt
            this.newProductForm.style.display = "none";
        }
    }
//----------------------------------------------------------------------------------------------------------------------
    //rendern der angezeigten Liste
    renderList(lists) {
        this.listContainer.innerHTML = "";

        lists.forEach((list, index) => {
            const card = document.createElement("div");
            card.classList.add("col-md-4", "mb-3");

            card.innerHTML = `
        <div class="card h-100 shadow-sm ${list.completed ? 'completed' : ''}">
            <div class="card-body" data-index="${index}" style="cursor: pointer;">
                <h5 class="card-title">${list.title}</h5>
                <p class="card-text"><strong>Teilnehmer:</strong> ${list.participants.join(", ") || "Keine Teilnehmer"}</p>
                <p class="card-text"><strong>Produkte:</strong> ${list.products.map(p => `${p.name} (${p.quantity}x)`).join(", ") || "Keine Produkte"}</p>
            </div>
            <div class="d-flex flex-column">
                <button class="bview btn btn-info btn-sm mt-2" data-index="${index}">Ansehen</button>
                <button class="bedit btn btn-warning btn-sm mt-2" data-index="${index}">Bearbeiten</button>
                <button class="bdelete btn btn-danger btn-sm mt-2" data-index="${index}">Löschen</button>
                <button class="bcomplete btn btn-success btn-sm mt-2" data-index="${index}">Abschließen</button>
            </div>
        </div>
    `;

            this.listContainer.appendChild(card);
        });

        // Event-Listener für Ansehen-Button
        document.querySelectorAll(".bview").forEach(button => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                const index = event.target.getAttribute("data-index");
                this.showViewPopup(index);
            });
        });

        // Event-Listener für Bearbeiten-Button
        document.querySelectorAll(".bedit").forEach(button => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                const index = event.target.getAttribute("data-index");
                this.controller.editList(index);
            });
        });

        // Event-Listener für Löschen-Button
        document.querySelectorAll(".bdelete").forEach(button => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                const index = event.target.getAttribute("data-index");
                this.controller.deleteList(index);
            });
        });

        // Event-Listener für Abschließen-Button
        document.querySelectorAll(".bcomplete").forEach(button => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                const index = event.target.getAttribute("data-index");
                this.controller.completeList(index);
            });
        });
    }


    //------------------------------------------------------------------------------------------------------------------
    // Zeigt das Ansehen-Popup mit den Produkten an (Ansehmodus: Produkte mit Checkbox)
    showViewPopup(index) {
        const list = model.getLists()[index];

        // Falls das Popup noch nicht existiert, erstellen wir es
        if (!this.viewPopup) {
            this.viewPopup = document.createElement("div");
            this.viewPopup.id = "view-popup";

            // Füge HTML für das Popup hinzu
            this.viewPopup.innerHTML = `
            <h2 id="view-popup-title"></h2>
            <p id="view-popup-participants"></p>
            <p id="view-popup-products"></p>
            <button id="close-view-popup">Speichern und Schließen</button>
        `;

            document.body.appendChild(this.viewPopup);
            document.getElementById("close-view-popup").addEventListener("click", () => {
                this.viewPopup.style.display = "none";
            });
        }

        // Setze die Inhalte des Popups
        document.getElementById("view-popup-title").textContent = list.title;
        document.getElementById("view-popup-participants").innerHTML = `<strong>Teilnehmer:</strong> ${list.participants.join(", ") || "Keine Teilnehmer"}`;

        // Zeige die Produkte mit Checkboxen an
        this.displayProductsInPopup(list);  // Übergebe die ganze Liste (damit wir die selectedProducts bekommen)

        // Zeige das Popup an
        this.viewPopup.style.display = "block";
    }
    //------------------------------------------------------------------------------------------------------------------
    // Anzeige der Produkte im Ansehen-Popup mit Checkbox
    displayProductsInPopup(list) {
        const productContainer = document.getElementById("view-popup-products");

        // Leere den Bereich für Produkte im Popup
        productContainer.innerHTML = "";

        list.products.forEach(product => {
            const div = document.createElement("div");
            div.innerHTML = `
            <input type="checkbox" value="${product.name}" class="product-checkbox" data-name="${product.name}">
            ${product.name} (${product.quantity}x)
        `;

            const checkbox = div.querySelector(".product-checkbox");

            // Setze die Checkbox als aktiviert, wenn das Produkt im `selectedProducts`-Set der aktuellen Liste ist
            if (list.selectedProducts.has(product.name)) {
                checkbox.checked = true;
            }

            // Event-Listener für Änderungen der Auswahl
            checkbox.addEventListener("change", (e) => {
                const productName = e.target.value;
                this.controller.toggleProductSelection(list, productName, e.target.checked);  // Übergabe der Liste an den Controller
            });

            productContainer.appendChild(div);
        });
    }
    //------------------------------------------------------------------------------------------------------------------
    // Suche (Listen)
    filterLists() {
        const searchText = this.searchBar.value.toLowerCase();
        const filteredLists = model.getLists().filter(list => list.title.toLowerCase().includes(searchText));
        this.renderList(filteredLists);
    }
    //------------------------------------------------------------------------------------------------------------------
    // Suchinhalt löschen, erneute Anzeige aller Listen
    clearSearch() {
        this.searchBar.value = "";
        this.clearSearchButton.style.display = "none";
        this.renderList(model.getLists());
    }

    //------------------------------------------------------------------------------------------------------------------
    // Abgeschlossene Listen
    renderCompletedList(completedLists) {
        const completedListContainer = document.getElementById("completed-list-row");
        completedListContainer.innerHTML = "";

        completedLists.forEach((list) => {
            const card = document.createElement("div");
            card.classList.add("col-md-4", "mb-3");

            card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${list.title}</h5>
                    <p class="card-text"><strong>Teilnehmer:</strong> ${list.participants.join(", ") || "Keine Teilnehmer"}</p>
                    <p class="card-text"><strong>Produkte:</strong> ${list.products.map(p => `${p.name} (${p.quantity}x)`).join(", ") || "Keine Produkte"}</p>
                </div>
            </div>
        `;
            completedListContainer.appendChild(card);
            console.log("Abgeschlossen");
        });
    }
    //------------------------------------------------------------------------------------------------------------------
    // Kategorie bearbeiten
    showEditCategoryList() {
        const editContainer = document.createElement('div');
        editContainer.classList.add('edit-category-container');

        // Alle Kategorien abrufen, auch die neu erstellten ohne Produkte
        const tags = [...new Set(this.tagDropdown.querySelectorAll("option"))].map(option => option.value);

        tags.forEach(tag => {
            if (tag !== "all") { // "Alle" soll nicht bearbeitbar sein
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = tag;
                checkbox.classList.add('category-checkbox');
                checkbox.addEventListener('change', () => this.handleCategorySelection(tag, checkbox.checked));

                label.textContent = tag;
                label.appendChild(checkbox);
                editContainer.appendChild(label);
                editContainer.appendChild(document.createElement('br'));
            }
        });

        // Bestätigungsbutton zum Speichern der Änderungen
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Änderungen speichern';
        confirmButton.addEventListener('click', () => {
            this.closeEditCategoryList();
        });
        editContainer.appendChild(confirmButton);

        this.popup.appendChild(editContainer);
    }
    //------------------------------------------------------------------------------------------------------------------
    // Kategorie bearbeiten
    handleCategorySelection(tag, isSelected) {
        if (isSelected) {
            const newName = prompt(`Neuer Name für Kategorie "${tag}":`, tag);
            if (newName && newName !== tag) {
                // Kategorie im Modell aktualisieren
                model.updateCategory(tag, newName);

                // Dropdown aktualisieren
                this.populateTagDropdown(model.getProducts());

                // Produktliste aktualisieren
                this.displayProducts(model.getProducts());
            }
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Methode zum Schließen der Bearbeitungsliste
    closeEditCategoryList() {
        const editContainer = document.querySelector('.edit-category-container');
        if (editContainer) {
            editContainer.remove();
        }
    }

}

const view = new View();
