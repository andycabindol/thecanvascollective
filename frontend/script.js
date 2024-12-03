const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const undoStack = []; // To store previous canvas states for undo
let isDrawing = false;
let isErasing = false; // Toggle for eraser mode

// Set default drawing settings
ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.strokeStyle = "black";

// Start drawing
canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;

    // Save current canvas state for undo
    undoStack.push(canvas.toDataURL());

    // Limit the undo stack size to 20
    if (undoStack.length > 20) undoStack.shift();

    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

// Stop drawing
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    ctx.beginPath();
});

// Handle drawing or erasing
canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    if (isErasing) {
        ctx.globalCompositeOperation = "destination-out"; // Eraser mode
        ctx.lineWidth = 10; // Eraser size
    } else {
        ctx.globalCompositeOperation = "source-over"; // Drawing mode
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
    }

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

// Undo the last action
document.getElementById("undoBtn").addEventListener("click", () => {
    if (undoStack.length === 0) return;

    const previousState = undoStack.pop();
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        ctx.drawImage(img, 0, 0); // Restore the previous state
    };
});

// Toggle eraser mode
document.getElementById("eraserBtn").addEventListener("click", () => {
    isErasing = !isErasing;
    document.getElementById("eraserBtn").innerText = `Eraser: ${isErasing ? "ON" : "OFF"}`;
});

// Submit the drawing
document.getElementById("submitBtn").addEventListener("click", async () => {
    const dataURL = canvas.toDataURL("image/png");

    // Send the image to the backend
    try {
        const response = await fetch("http://localhost:3000/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataURL }),
        });
        console.log("Server response:", response);
    } catch (error) {
        console.error("Error submitting drawing:", error);
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reload the gallery
    loadGallery();
});

// Load and display the gallery
async function loadGallery() {
    try {
        const response = await fetch("http://localhost:3000/gallery/all");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const images = await response.json();
        const gallery = document.getElementById("gallery");
        gallery.innerHTML = ""; // Clear the gallery

        // Reverse the images array to show latest first
        images.reverse();

        images.forEach((src) => {
            const img = document.createElement("img");
            img.src = src; // Use the full URL provided by the backend
            img.alt = "Drawing"; // Add alt text for accessibility
            img.className = "gallery-item";
            img.style.border = "1px solid black"; // Optional styling
            img.style.margin = "5px";
            img.style.width = "100px"; // Optional size
            img.style.height = "100px"; // Optional size

            // Add click event to open modal
            img.addEventListener("click", () => openModal(src));

            gallery.appendChild(img);
        });
    } catch (error) {
        console.error("Error loading gallery:", error);
    }
}



// Fetch the current prompt from the server and display it
async function loadCurrentPrompt() {
    try {
        const response = await fetch("http://localhost:3000/current-prompt");
        const data = await response.json();

        const promptText = document.getElementById("promptText");
        promptText.textContent = data.prompt; // Update the prompt dynamically
    } catch (error) {
        console.error("Error loading the current prompt:", error);
        const promptText = document.getElementById("promptText");
        promptText.textContent = "Error loading prompt.";
    }
}

// Load the current prompt on page load
loadCurrentPrompt();





// Load the gallery on page load
loadGallery();
