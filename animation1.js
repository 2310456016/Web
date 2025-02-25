const OverlayController = {
    overlay: document.getElementById("overlay"),
    startButton: document.getElementById("startButton"),

    // Initialisierung des Controllers
    init: function () {
        this.addEventListeners();
    },

    // Event-Listener für den Button
    addEventListeners: function () {
        this.startButton.addEventListener("click", this.handleStartButtonClick.bind(this));
    },

    // Event-Handler: Was passiert, wenn der Button geklickt wird
    handleStartButtonClick: function (event) {
        event.preventDefault(); // Verhindert das sofortige Laden der Seite

        this.showOverlay(); // Overlay anzeigen

        // Nach der Verzögerung die Navigation zur nächsten Seite
        this.navigateAfterDelay();
    },

    // Overlay anzeigen (View wird geändert)
    showOverlay: function () {
        this.overlay.classList.add("show");
    },

    // Seite nach der Animation wechseln
    navigateAfterDelay: function () {
        setTimeout(() => {
            window.location.href = "list.html"; // Weiterleitung zur nächsten Seite
        }, 1500); // Verzögerung von 1,5 Sekunden
    }
};

// starten, wenn der DOM geladen ist
document.addEventListener("DOMContentLoaded", function () {
    OverlayController.init();
});
