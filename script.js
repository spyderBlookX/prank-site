let originalImage = null;
let processedImage = null;

const imageInput = document.getElementById('imageInput');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const maintainAspectInput = document.getElementById('maintainAspect');
const removeGreenScreenInput = document.getElementById('removeGreenScreen');
const toleranceInput = document.getElementById('tolerance');
const toleranceValue = document.getElementById('toleranceValue');
const toleranceGroup = document.getElementById('toleranceGroup');
const originalCanvas = document.getElementById('originalCanvas');
const processedCanvas = document.getElementById('processedCanvas');
const processBtn = document.getElementById('processBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const originalInfo = document.getElementById('originalInfo');
const processedInfo = document.getElementById('processedInfo');

// Image upload
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            displayOriginal();
            downloadBtn.disabled = true;
            processedImage = null;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Display original image
function displayOriginal() {
    if (!originalImage) return;

    const ctx = originalCanvas.getContext('2d');
    originalCanvas.width = originalImage.width;
    originalCanvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    originalInfo.textContent = `${originalImage.width}x${originalImage.height}px`;
    widthInput.value = originalImage.width;
    heightInput.value = originalImage.height;
}

// Maintain aspect ratio
widthInput.addEventListener('change', () => {
    if (maintainAspectInput.checked && originalImage) {
        const ratio = originalImage.height / originalImage.width;
        heightInput.value = Math.round(widthInput.value * ratio);
    }
});

heightInput.addEventListener('change', () => {
    if (maintainAspectInput.checked && originalImage) {
        const ratio = originalImage.width / originalImage.height;
        widthInput.value = Math.round(heightInput.value * ratio);
    }
});

// Toggle green screen tolerance
removeGreenScreenInput.addEventListener('change', () => {
    toleranceGroup.style.display = removeGreenScreenInput.checked ? 'block' : 'none';
});

toleranceInput.addEventListener('input', () => {
    toleranceValue.textContent = toleranceInput.value;
});

// Process image
processBtn.addEventListener('click', () => {
    if (!originalImage) {
        alert('Please upload an image first');
        return;
    }

    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);

    if (width < 10 || height < 10 || width > 4000 || height > 4000) {
        alert('Width and height must be between 10 and 4000 pixels');
        return;
    }

    // Create temporary canvas for processing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');

    // Draw resized image
    ctx.drawImage(originalImage, 0, 0, width, height);

    // Apply green screen removal if enabled
    if (removeGreenScreenInput.checked) {
        removeGreenScreen(ctx, width, height, parseInt(toleranceInput.value));
    }

    // Display processed image
    processedCanvas.width = width;
    processedCanvas.height = height;
    const processedCtx = processedCanvas.getContext('2d');
    processedCtx.drawImage(tempCanvas, 0, 0);

    processedInfo.textContent = `${width}x${height}px`;
    downloadBtn.disabled = false;
});

// Green screen removal
function removeGreenScreen(ctx, width, height, tolerance) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Convert tolerance (0-100) to color difference threshold (0-441, max distance in RGB space)
    const threshold = (tolerance / 100) * 255;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Check if pixel is greenish
        // Green screen typically has high G value and lower R, B values
        const isGreen = g > r && g > b && (g - r) > threshold && (g - b) > threshold;

        if (isGreen) {
            // Make transparent
            data[i + 3] = 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

// Download processed image
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = processedCanvas.toDataURL('image/png');
    link.download = 'imagepro-processed.png';
    link.click();
});

// Reset
resetBtn.addEventListener('click', () => {
    imageInput.value = '';
    originalImage = null;
    processedImage = null;
    originalCanvas.width = 0;
    originalCanvas.height = 0;
    processedCanvas.width = 0;
    processedCanvas.height = 0;
    originalInfo.textContent = '';
    processedInfo.textContent = '';
    downloadBtn.disabled = true;
    removeGreenScreenInput.checked = false;
    toleranceGroup.style.display = 'none';
});