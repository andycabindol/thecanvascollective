async function loadArchive() {
    const response = await fetch("http://localhost:3000/archive/latest");
    const latestDrawings = await response.json();

    const archive = document.getElementById("archive");
    archive.innerHTML = "";

    latestDrawings.forEach(({ prompt, image }) => {
        const card = document.createElement("div");
        card.className = "prompt-card";

        // Create a link to the specific prompt gallery
        const link = document.createElement("a");
        link.href = `/archive/${prompt.replace(/\s+/g, "-").toLowerCase()}`; // Use the slugified prompt
        link.style.textDecoration = "none";
        link.style.color = "inherit";

        // Card content
        link.innerHTML = `
            <h3>${prompt}</h3>
            <img src="${image}" alt="${prompt}" />
        `;

        card.appendChild(link);
        archive.appendChild(card);
    });
}

loadArchive();
