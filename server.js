const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const galleryPath = path.join(__dirname, "/gallery");

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "/frontend")));

// Ensure gallery directory exists
if (!fs.existsSync(galleryPath)) fs.mkdirSync(galleryPath);

const currentPrompt = "What does happiness look like?"; // Update weekly

app.get("/current-prompt", (req, res) => {
    res.json({ prompt: currentPrompt });
});

const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""); // Convert prompt to a folder-friendly name
const currentPromptSlug = slugify(currentPrompt);

app.post("/submit", (req, res) => {
    const { image } = req.body;
    const promptPath = path.join(galleryPath, currentPromptSlug);

    // Ensure the prompt folder exists
    if (!fs.existsSync(promptPath)) fs.mkdirSync(promptPath);

    // Save the drawing
    const filename = `drawing-${Date.now()}.png`;
    const filePath = path.join(promptPath, filename);

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(filePath, base64Data, "base64");

    console.log(`Saved drawing for prompt: ${currentPrompt}`);
    res.sendStatus(200);
});

app.get("/archive/latest", (req, res) => {
    try {
        const prompts = fs.readdirSync(galleryPath)
            .filter((folder) => fs.statSync(path.join(galleryPath, folder)).isDirectory()); // Filter only directories

        const latestDrawings = prompts.map((prompt) => {
            const promptPath = path.join(galleryPath, prompt);
            const files = fs.readdirSync(promptPath);

            if (files.length === 0) return null;

            const latestFile = files.sort().pop(); // Get the latest file
            return {
                prompt: prompt.replace(/-/g, " "), // Convert slug back to text
                image: `/gallery/${prompt}/${latestFile}`,
            };
        }).filter(Boolean); // Remove empty prompts

        res.json(latestDrawings);
    } catch (error) {
        console.error("Error in /archive/latest:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Handle API requests for prompt-specific data
app.get("/api/archive/:promptSlug", (req, res) => {
    const promptSlug = req.params.promptSlug;
    const promptPath = path.join(galleryPath, promptSlug);

    if (!fs.existsSync(promptPath)) {
        return res.status(404).json({ error: "Prompt not found" });
    }

    const files = fs.readdirSync(promptPath);
    const images = files.map((file) => `/gallery/${promptSlug}/${file}`);
    res.json({ prompt: promptSlug.replace(/-/g, " "), images });
});

// Serve prompt-gallery.html for any prompt-specific archive route
app.get("/archive/:promptSlug", (req, res) => {
    res.sendFile(path.join(__dirname, "/frontend/prompt-gallery.html"));
});

app.get("/gallery/all", (req, res) => {
    try {
        // Get all files for the current prompt
        const promptPath = path.join(galleryPath, currentPromptSlug);
        if (!fs.existsSync(promptPath)) {
            return res.json([]); // Return an empty array if the prompt folder doesn't exist
        }

        const files = fs.readdirSync(promptPath); // Sort files in reverse order
        const images = files.map((file) => `/gallery/${currentPromptSlug}/${file}`); // Create full paths

        res.json(images); // Return all image URLs
    } catch (error) {
        console.error("Error in /gallery/all:", error);
        res.status(500).send("Internal Server Error");
    }
});



// Serve gallery images
app.use("/gallery", express.static(galleryPath));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.use("/gallery", express.static(path.join(__dirname, "/gallery")));
