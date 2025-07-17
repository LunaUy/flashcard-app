// Load a page dynamically and manage loading animation
function loadPage(page, button) {
  const loadingDiv = document.getElementById("loading");
  const contentDiv = document.getElementById("content");

  let showLoader = setTimeout(() => {
    loadingDiv.style.display = "flex";
    contentDiv.style.opacity = 0.5;
  }, 150); // Delay loader to prevent flicker on fast loads

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

      if (page === "flashcards.html" && typeof loadFlashcards === "function") {
        loadFlashcards();
      }
    })
    .catch(error => {
      console.error("Error loading page:", error);
      clearTimeout(showLoader);
      loadingDiv.style.display = "none";
      contentDiv.innerHTML = "<p>Page not found.</p>";
    });
}

// Load flashcards from JSON and enable flip effect
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
        });

        container.appendChild(cardEl);
      });
    })
    .catch(error => {
      console.error("Failed to load flashcards:", error);
    });
}

// Dark Mode Toggle Logic
const darkModeToggle = document.getElementById("darkModeToggle");

function updateDarkModeButton(isDark) {
  darkModeToggle.innerHTML = `
    <i class="fas ${isDark ? 'fa-sun' : 'fa-moon'}"></i> 
    ${isDark ? 'Light Mode' : 'Dark Mode'}
  `;
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

// Unified DOMContentLoaded handler
window.addEventListener("DOMContentLoaded", () => {
  // Apply dark mode if saved
  const savedDark = localStorage.getItem("darkMode") === "enabled";
  setDarkMode(savedDark);

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