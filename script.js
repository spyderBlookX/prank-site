let originalImage = null;

const imageInput = document.getElementById('imageInput');
const toleranceInput = document.getElementById('tolerance');
const toleranceValue = document.getElementById('toleranceValue');
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
}

// Update tolerance value display
toleranceInput.addEventListener('input', () => {
    toleranceValue.textContent = toleranceInput.value;
});

// Process image - Remove green screen
processBtn.addEventListener('click', () => {
    if (!originalImage) {
        alert('Please upload an image first');
        return;
    }

    // Create canvas for processing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalImage.width;
    tempCanvas.height = originalImage.height;
    const ctx = tempCanvas.getContext('2d');

    // Draw original image
    ctx.drawImage(originalImage, 0, 0);

    // Apply green screen removal
    removeGreenScreen(ctx, originalImage.width, originalImage.height, parseInt(toleranceInput.value));

    // Display processed image
    processedCanvas.width = originalImage.width;
    processedCanvas.height = originalImage.height;
    const processedCtx = processedCanvas.getContext('2d');
    processedCtx.drawImage(tempCanvas, 0, 0);

    processedInfo.textContent = `${originalImage.width}x${originalImage.height}px (green removed)`;
    downloadBtn.disabled = false;
});

// Green screen removal function
function removeGreenScreen(ctx, width, height, tolerance) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Convert tolerance (0-100) to color difference threshold
    const threshold = (tolerance / 100) * 255;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel is greenish
        // Green screen has high G value and lower R, B values
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
    originalCanvas.width = 0;
    originalCanvas.height = 0;
    processedCanvas.width = 0;
    processedCanvas.height = 0;
    originalInfo.textContent = '';
    processedInfo.textContent = '';
    downloadBtn.disabled = true;
    toleranceInput.value = 30;
    toleranceValue.textContent = '30';
});