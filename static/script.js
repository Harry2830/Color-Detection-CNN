const fileInput = document.getElementById('fileInput');
const predictionResult = document.getElementById('predictionResult');
const probabilitiesContainer = document.getElementById('probabilities');
const toggleProbabilitiesButton = document.getElementById('toggleProbabilities');
const uploadedImage = document.getElementById('uploadedImage');

let probabilitiesVisible = false;

document.getElementById('uploadForm').onsubmit = async function (event) {
    event.preventDefault();

    if (!fileInput.files.length) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const response = await fetch('/predict', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (result.error) {
        predictionResult.textContent = result.error;
        probabilitiesContainer.innerHTML = "";
        toggleProbabilitiesButton.style.display = "none";
    } else {
        predictionResult.innerHTML = `Predicted Way: <strong>${result.predicted_class}</strong> Conveyor Belt`;
        probabilitiesContainer.innerHTML = "";  // Clear previous probabilities
        for (const className in result.probabilities) {
            const probability = (result.probabilities[className] * 100).toFixed(2);
            probabilitiesContainer.innerHTML += `<p>${className}: ${probability}%</p>`;
        }
        toggleProbabilitiesButton.style.display = "inline-block";  // Show toggle button

        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
};

toggleProbabilitiesButton.onclick = function () {
    probabilitiesVisible = !probabilitiesVisible;
    probabilitiesContainer.style.display = probabilitiesVisible ? "block" : "none";  // Toggle visibility
    toggleProbabilitiesButton.textContent = probabilitiesVisible ? "Hide Probabilities" : "Show Probabilities";
};
