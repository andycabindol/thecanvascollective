// Function to open modal
function openModal(imageSrc) {
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    console.log("running")

    modal.style.display = "block"; // Show the modal
    modalImage.src = imageSrc; // Set the image source
}

// Function to close modal
document.getElementById("closeModal").addEventListener("click", () => {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none"; // Hide the modal
});

// Close the modal when clicking outside the modal container
window.addEventListener("click", (event) => {
    const modal = document.getElementById("imageModal");
    const container = document.querySelector(".modal-container");
    if (event.target === modal) {
        modal.style.display = "none"; // Hide the modal
    }
});
