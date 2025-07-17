function loadPage(page) {
    fetch(page)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
        })
        .catch(error => {
            console.error("Error loading page:", error);
            document.getElementById("content").innerHTML = "<p>Page not found.</p>";
        });
}

// Optionally load the home page by default
window.addEventListener("DOMContentLoaded", () => {
    loadPage("home.html");
});