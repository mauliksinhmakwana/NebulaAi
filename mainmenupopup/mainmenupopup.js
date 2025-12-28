let mmView = "menu"; // menu | content

function openMainMenuPopup() {
    document.getElementById("main-menu-popup").classList.add("active");
    document.body.style.overflow = "hidden";
    mmShowMenu();
}

function closeMainMenuPopup() {
    document.getElementById("main-menu-popup").classList.remove("active");
    document.body.style.overflow = "";
}

function openMMSection(section) {
    document.querySelectorAll("[data-mm]").forEach(s => {
        s.style.display = s.dataset.mm === section ? "block" : "none";
    });

    document.getElementById("mm-title").innerText =
        section.charAt(0).toUpperCase() + section.slice(1);

    mmView = "content";
    updateMMLayout();
}

function mmShowMenu() {
    mmView = "menu";
    document.getElementById("mm-title").innerText = "Settings";
    updateMMLayout();
}

function mmBack() {
    if (mmView === "content") {
        mmShowMenu();
    } else {
        closeMainMenuPopup();
    }
}

function updateMMLayout() {
    const isMobile = window.innerWidth < 768;

    const options = document.getElementById("mm-options");
    const content = document.getElementById("mm-content");
    const backBtn = document.querySelector(".mm-back");

    if (isMobile) {
        options.style.display = mmView === "menu" ? "block" : "none";
        content.style.display = mmView === "content" ? "block" : "none";
        backBtn.style.visibility = mmView === "content" ? "visible" : "hidden";
    } else {
        options.style.display = "block";
        content.style.display = "block";
        backBtn.style.visibility = "hidden";
    }
}

window.addEventListener("resize", updateMMLayout);

window.openMainMenuPopup = openMainMenuPopup;
