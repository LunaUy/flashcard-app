function loadPage(page, button) {
    const loadingDiv = document.getElementById("loading");
    const contentDiv = document.getElementById("content");

    loadingDiv.style.display = "flex";
    contentDiv.classList.remove("fade-in");

    fetch(page)
        .then(response => {
            if (!response.ok) throw new Error("Page not found");
            return response.text();
        })
        .then(html => {
            setTimeout(() => {
                contentDiv.innerHTML = html;
                loadingDiv.style.display = "none";
                contentDiv.classList.add("fade-in");

                if (button) {
                    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
                    button.classList.add("active");
                }

                localStorage.setItem("lastPage", page);

                // If flashcards.html is loaded, initialize the flashcards
                if (page === "flashcards.html" && typeof loadFlashcards === "function") {
                    loadFlashcards();
                }
            }, 300); // Simulated delay for effect
        })
        .catch(error => {
            console.error("Error loading page:", error);
            loadingDiv.style.display = "none";
            contentDiv.innerHTML = "<p>Page not found.</p>";
        });
}

window.addEventListener("DOMContentLoaded", () => {
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
                cardEl.addEventListener('click', () => {
                    cardEl.classList.toggle('flipped');
                });

                container.appendChild(cardEl);
            });
        })
        .catch(error => {
            console.error("Failed to load flashcards:", error);
        });
}

const darkModeToggle = document.getElementById('darkModeToggle');

function setDarkMode(enabled) {
  if (enabled) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
}

if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    const enabled = document.body.classList.contains('dark-mode');
    setDarkMode(!enabled);
  });
}

// Apply saved preference on load
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'enabled') {
    setDarkMode(true);
  }
});