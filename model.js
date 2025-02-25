class Model {
    constructor() {
        // Listen - Array: speichert alle Listen
        this.lists = [];
        // Abgeschlossene Listen - Array: für abgeschlossene Listen
        this.completedLists = [];
        // Meine Teilnehmer - Array
        this.participants = [];
        // Meine Produkte - Array
        this.products = [];

        // Laden der JSON-Dateien: Teilnehmer, Produkte, Listen
        this.loadParticipants();
        this.loadProducts();
        this.loadLists();

        // Speichern aller Kategorien (Set)
        this.categories = new Set();
    }

    //------------------------------------------------------------------------------------------------------------------
    // Laden der vorgefertigten Listen
    async loadLists() {
        try {
            const response = await fetch("lists.json");
            if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`);
            const data = await response.json();

            // Sicherstellen dass jede Liste ein Set für `selectedProducts` bekommt
            this.lists = data.map(list => ({
                ...list,
                completed: list.completed || false,
                selectedProducts: new Set(list.selectedProducts || [])
                // Hinzufügen eines Sets für `selectedProducts` (ermöglicht, dass für jede Liste ein Set von
                // selectedProducts gespeichert wird (für die abzuhakenden Checkboxen)
            }));
        } catch (error) {
            console.error("Fehler beim Laden der Listen:", error);
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Hier werden die Teilnehmer geladen
    async loadParticipants() {
        try {
            const response = await fetch("user.json");
            if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`);
            this.participants = await response.json();
        } catch (error) {
            console.error("Fehler beim Laden der Teilnehmer:", error);
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Laden der Produkte aus JSON
    async loadProducts() {
        try {
            const response = await fetch("product.json");
            if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`);
            this.products = await response.json();
        } catch (error) {
            console.error("Fehler beim Laden der Produkte:", error);
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Produkte hinzufügen: Name und Kategorie
    addProduct(name, tag) {
        if (!name || !tag) {
            console.error("Produktname und Kategorie erforderlich!");
            return;
        }
        const newProduct = { Name: name, Tag: tag };
        this.products.push(newProduct);
    }

    //------------------------------------------------------------------------------------------------------------------
    // Hinzufügen einer neuen Liste
    addList(title, selectedParticipants, selectedProducts) {
        const newList = {
            title,
            participants: selectedParticipants,
            products: selectedProducts,
            selectedProducts: new Set(selectedProducts) // Jede Liste bekommt ihr eigenes Set für ausgewählte Produkte
        };
        this.lists.push(newList);
        return newList;
    }

    //------------------------------------------------------------------------------------------------------------------
    // Updaten/Bearbeiten einer Liste
    updateList(index, title, selectedParticipants, selectedProducts) {
        if (index >= 0 && index < this.lists.length) {
            this.lists[index] = {
                title,
                participants: selectedParticipants,
                products: selectedProducts,
                selectedProducts: new Set(selectedProducts) // Aktualisieren des Sets für ausgewählte Produkte
            };
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Liste löschen
    deleteList(index) {
        if (index >= 0 && index < this.lists.length) {
            this.lists.splice(index, 1);
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Abgeschlossene Liste wird gespeichert
    completeList(index) {
        if (index >= 0 && index < this.lists.length) {
            this.completedLists.push(this.lists[index]);
            this.lists.splice(index, 1);
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Getter-Funktionen
    // Listen: gibt alle offenen Listen zurück
    getLists() {
        return this.lists;
    }
    // Abgeschlossene Listen: gibt alle abgeschlossenen Listen zurück
    getCompletedLists() {
        return this.completedLists;
    }
    // Gibt alle Teilnehmer zurück
    getParticipants() {
        return this.participants;
    }
    // Gibt alle Produkte zurück
    getProducts() {
        return this.products;
    }


    //------------------------------------------------------------------------------------------------------------------
    // Speichern der Checkboxen (Produkte) für die jeweilige Liste (Ansehmodus)
    // Auswahlstatus wird geändert
    toggleProductSelection(list, productName, isSelected) {
        const listIndex = this.lists.indexOf(list);
        if (listIndex !== -1) {
            const selectedProducts = this.lists[listIndex].selectedProducts;
            if (isSelected) {
                selectedProducts.add(productName);  // Produkt hinzufügen
            } else {
                selectedProducts.delete(productName);  // Produkt entfernen
            }
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Produke löschen (entfernt Produkt aus dem Array this.products)
    removeProduct(productName) {
        this.products = this.products.filter(product => product.Name !== productName);
    }

    //------------------------------------------------------------------------------------------------------------------
    // Produkt bearbeiten (aktualisieren)
    updateProduct(oldName, newName, newTag) {
        const product = this.products.find(p => p.Name === oldName);
        if (product) {
            product.Name = newName;
            product.Tag = newTag;
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Kategorie bearbeiten
    updateCategory(oldCategoryName, newCategoryName) {
        // Alle Produkte, die alte Kategorie hinterlegt haben, umändern (also Produkte neuer Kategorie zuordnen)
        this.products.forEach(product => {
            if (product.Tag === oldCategoryName) {
                product.Tag = newCategoryName;
            }
        });

        // Neuen Kategorienamen:
        //Der alte Kategoriename soll gelöscht werden und der neue hinzugefügt werden.
        if (this.categories && this.categories.has(oldCategoryName)) {
            this.categories.delete(oldCategoryName);
            this.categories.add(newCategoryName);
        }
    }

}

const model = new Model();
