/**
 * BloodCompress Client Application Engine
 */

document.addEventListener('DOMContentLoaded', () => {

  // ===============================
  // UI Elements
  // ===============================

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');

  fileInput.setAttribute('autocomplete', 'off');

  const processingSection = document.getElementById('processingSection');
  const resultSection = document.getElementById('resultSection');

  const imagePreview = document.getElementById('imagePreview');
  const fileNameDisplay = document.getElementById('fileNameDisplay');
  const fileSizeDisplay = document.getElementById('fileSizeDisplay');

  const compressBtn = document.getElementById('compressBtn');
  const btnText = compressBtn.querySelector('.btn-text');
  const btnLoader = compressBtn.querySelector('.btn-loader');

  const changeFileBtn = document.getElementById('changeFileBtn');
  const resetBtn = document.getElementById('resetBtn');
  const downloadLink = document.getElementById('downloadLink');

  const errorAlert = document.getElementById('errorAlert');
  const errorMessage = document.getElementById('errorMessage');

  const resOrigSize = document.getElementById('resOrigSize');
  const resCompSize = document.getElementById('resCompSize');
  const resRatio = document.getElementById('resRatio');

  // ===============================
  // App State
  // ===============================

  let currentFile = null;
  let selectedFormat = 'jpg';
  let selectedQuality = 'high';

  // ===============================
  // Format Buttons
  // ===============================

  const formatBtns = document.querySelectorAll('.format-btn');

  formatBtns.forEach((btn) => {

    btn.addEventListener('click', () => {

      formatBtns.forEach((b) => b.classList.remove('active'));

      btn.classList.add('active');

      selectedFormat = btn.dataset.format;

    });

  });

  // ===============================
  // Quality Cards
  // ===============================

  const qualityCards = document.querySelectorAll('.quality-card');

  qualityCards.forEach((card) => {

    card.addEventListener('click', () => {

      qualityCards.forEach((c) => c.classList.remove('active'));

      card.classList.add('active');

      const radio = card.querySelector('input');

      radio.checked = true;

      selectedQuality = radio.value;

    });

  });

  // ===============================
  // Drag Events
  // ===============================

  ['dragenter', 'dragover'].forEach((eventName) => {

    dropZone.addEventListener(eventName, (e) => {

      e.preventDefault();
      e.stopPropagation();

      dropZone.classList.add('dragover');

    });

  });

  ['dragleave', 'drop'].forEach((eventName) => {

    dropZone.addEventListener(eventName, (e) => {

      e.preventDefault();
      e.stopPropagation();

      dropZone.classList.remove('dragover');

    });

  });

  dropZone.addEventListener('drop', (e) => {

    const files = e.dataTransfer.files;

    if (files.length > 0) {

      handleSelectedFile(files[0]);

    }

  });

  // ===============================
  // File Picker
  // ===============================

  dropZone.addEventListener('click', () => fileInput.click());

  browseBtn.addEventListener('click', (e) => {

    e.stopPropagation();

    fileInput.click();

  });

  fileInput.addEventListener('change', (e) => {

    if (e.target.files.length > 0) {

      handleSelectedFile(e.target.files[0]);

    }

  });

  changeFileBtn.addEventListener('click', resetToUploadState);

  resetBtn.addEventListener('click', resetToUploadState);

  // ===============================
  // File Preview
  // ===============================

  function handleSelectedFile(file) {

    hideError();

    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp'
    ];

    if (!validTypes.includes(file.type)) {

      showError('Only PNG, JPG, JPEG and WEBP are supported.');

      return;

    }

    if (file.size > 20 * 1024 * 1024) {

      showError('Maximum allowed size is 20MB.');

      return;

    }

    currentFile = file;

    const reader = new FileReader();

    reader.onload = (event) => {

      imagePreview.src = event.target.result;

      fileNameDisplay.textContent = file.name;

      fileSizeDisplay.textContent = formatBytes(file.size);

      dropZone.classList.add('hidden');

      processingSection.classList.remove('hidden');

      resultSection.classList.add('hidden');

    };

    reader.readAsDataURL(file);

  }
    // ===============================
  // Compress Image
  // ===============================

  compressBtn.addEventListener('click', async () => {

    if (compressBtn.disabled) return;

    if (!currentFile) {

      showError('Please select an image first.');

      return;

    }

    hideError();

    setLoadingState(true);

    const formData = new FormData();

    formData.append('image', currentFile);
    formData.append('format', selectedFormat);
    formData.append('quality', selectedQuality);

    try {

      const response = await fetch('/api/v1/images/compress', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to process image.');
      }

      displayResults(result.data);

    } catch (err) {

      showError(
        err.message ||
        'Unable to connect to server. Please try again.'
      );

    } finally {

      setLoadingState(false);

    }

  });

  // ===============================
  // Display Results
  // ===============================

  function displayResults(data) {

    resOrigSize.textContent = formatBytes(data.stats.originalSize);

    resCompSize.textContent = formatBytes(data.stats.compressedSize);

    const ratio = data.stats.compressionRatio;

    if (ratio >= 0) {

      resRatio.textContent = `-${ratio}%`;

      resRatio.parentElement.classList.add('success');

    } else {

      resRatio.textContent = `+${Math.abs(ratio)}%`;

      resRatio.parentElement.classList.remove('success');

    }

    downloadLink.href = data.downloadPath;

    downloadLink.setAttribute(
      'download',
      data.filename
    );

    processingSection.classList.add('hidden');

    resultSection.classList.remove('hidden');

  }

  // ===============================
  // Reset
  // ===============================

  function resetToUploadState() {

    currentFile = null;

    fileInput.value = '';

    imagePreview.src = '';

    downloadLink.removeAttribute('href');

    downloadLink.removeAttribute('download');

    hideError();

    processingSection.classList.add('hidden');

    resultSection.classList.add('hidden');

    dropZone.classList.remove('hidden');

  }

  // ===============================
  // Loading State
  // ===============================

  function setLoadingState(isLoading) {

    compressBtn.disabled = isLoading;

    if (isLoading) {

      btnText.classList.add('hidden');

      btnLoader.classList.remove('hidden');

    } else {

      btnText.classList.remove('hidden');

      btnLoader.classList.add('hidden');

    }

  }

  // ===============================
  // Error Handling
  // ===============================

  function showError(message) {

    errorMessage.textContent = message;

    errorAlert.classList.remove('hidden');

  }

  function hideError() {

    errorAlert.classList.add('hidden');

  }

  // ===============================
  // Format Bytes
  // ===============================

  function formatBytes(bytes) {

    if (bytes === 0) return '0 Bytes';

    const k = 1024;

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
      ' ' +
      sizes[i]
    );

  }

});