// ========== Dynamic Page Loading ==========

function loadPage(page, button) {
    const loadingDiv = document.getElementById("loading");
    const contentDiv = document.getElementById("content");

    let showLoader = setTimeout(() => {
        loadingDiv.style.display = "flex";
        contentDiv.style.opacity = 0.5;
    }, 150);

    fetch(page)
        .then(response => {
            if (!response.ok) throw new Error("Page not found");
            return response.text();
        })
        .then(html => {
            clearTimeout(showLoader);
            loadingDiv.style.display = "none";
            contentDiv.style.opacity = 1;
            contentDiv.innerHTML = html;
            contentDiv.classList.add("fade-in");

            if (button) {
                document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
            }

            localStorage.setItem("lastPage", page);

            // Page-specific logic
            if (page === "flashcards.html" && typeof loadFlashcards === "function") {
                loadFlashcards();
            }

            // Ensure collapsible nav works
            setupCollapsibleNav();
        })
        .catch(error => {
            console.error("Error loading page:", error);
            clearTimeout(showLoader);
            loadingDiv.style.display = "none";
            contentDiv.innerHTML = "<p>Page not found.</p>";
        });
}

// ========== Flashcard Loading + Flip Effect ==========

function loadFlashcards() {
    fetch("flashcards.json")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("flashcard-container");
            container.innerHTML = "";

            data.forEach(card => {
                const cardEl = document.createElement("div");
                cardEl.className = "flashcard";
                cardEl.innerHTML = `
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <p><strong>Q:</strong> ${card.question}</p>
                        </div>
                        <div class="flashcard-back">
                            <p><strong>A:</strong> ${card.answer}</p>
                        </div>
                    </div>
                `;

                cardEl.addEventListener("click", () => {
                    cardEl.classList.toggle("flipped");
                    flipSound.play();
                });

                container.appendChild(cardEl);
            });
        })
        .catch(error => {
            console.error("Failed to load flashcards:", error);
        });
}

// ========== Collapsible Hamburger Navigation ==========

function setupCollapsibleNav() {
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (menuToggle && navLinks) {
        menuToggle.onclick = () => {
            navLinks.classList.toggle("show");
        };
    }
}
fetch('navbar.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('navbar').innerHTML = html;
    setupCollapsibleNav(); // must happen after insert
  });

// ========== Dark Mode Toggle ==========

const darkModeToggle = document.getElementById("darkModeToggle");

function updateDarkModeButton(isDark) {
    if (darkModeToggle) {
        darkModeToggle.innerHTML = `
            <i class="fas ${isDark ? 'fa-sun' : 'fa-moon'}"></i> 
            ${isDark ? 'Light Mode' : 'Dark Mode'}
        `;
    }
}

function setDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "disabled");
    }
    updateDarkModeButton(enabled);
}

if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark-mode");
        setDarkMode(!isDark);
    });
}

// ========== On Page Load ==========

window.addEventListener("DOMContentLoaded", () => {
    // Dark mode
    const savedDark = localStorage.getItem("darkMode") === "enabled";
    setDarkMode(savedDark);

    // Collapsible nav
    setupCollapsibleNav();

    // Load last visited page
    const lastPage = localStorage.getItem("lastPage") || "home.html";
    const buttons = document.querySelectorAll(".nav-btn");
    let activeButton = null;

    buttons.forEach(btn => {
        if (btn.getAttribute("onclick")?.includes(lastPage)) {
            activeButton = btn;
        }
    });

    loadPage(lastPage, activeButton);
});

// ========== Sound Effects (using Howler.js) ==========

const flipSound = new Howl({
    src: ['https://freesound.org/data/previews/331/331912_3248244-lq.mp3']
});

const correctSound = new Howl({
    src: ['https://freesound.org/data/previews/170/170686_2437358-lq.mp3']
});

const wrongSound = new Howl({
    src: ['https://freesound.org/data/previews/353/353904_5121236-lq.mp3']
});

// Example usage (call these in quiz logic):
// flipSound.play();
// correctSound.play();
// wrongSound.play();