// template-loader.js
document.addEventListener("DOMContentLoaded", () => {
    const placeholders = document.querySelectorAll("[data-template]");

    placeholders.forEach(async (el) => {
        const templateName = el.getAttribute("data-template");
        const path = `components/${templateName}.html`;

        try {
            const res = await fetch(path);
            const text = await res.text();

            // Create a temporary DOM to extract the template
            const temp = document.createElement("div");
            temp.innerHTML = text.trim();

            const template = temp.querySelector("template");

            if (template) {
                const clone = template.content.cloneNode(true);
                el.replaceWith(clone);
            } else {
                console.warn(`Template not found in ${path}`);
            }
        } catch (e) {
            console.error(`Failed to load template ${templateName}:`, e);
        }
    });
});