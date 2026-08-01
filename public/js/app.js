/**
 * BloodCompress Client Application Engine
 */

document.addEventListener("DOMContentLoaded", () => {

  // ===========================
  // UI Elements
  // ===========================

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const browseBtn = document.getElementById("browseBtn");

  const processingSection = document.getElementById("processingSection");
  const resultSection = document.getElementById("resultSection");

  const imagePreview = document.getElementById("imagePreview");
  const fileNameDisplay = document.getElementById("fileNameDisplay");
  const fileSizeDisplay = document.getElementById("fileSizeDisplay");

  const compressBtn = document.getElementById("compressBtn");
  const btnText = compressBtn.querySelector(".btn-text");
  const btnLoader = compressBtn.querySelector(".btn-loader");

  const changeFileBtn = document.getElementById("changeFileBtn");
  const resetBtn = document.getElementById("resetBtn");
  const downloadLink = document.getElementById("downloadLink");

  const errorAlert = document.getElementById("errorAlert");
  const errorMessage = document.getElementById("errorMessage");

  const resOrigSize = document.getElementById("resOrigSize");
  const resCompSize = document.getElementById("resCompSize");
  const resRatio = document.getElementById("resRatio");

  // ===========================
  // App State
  // ===========================

  let currentFile = null;
  let selectedFormat = "jpg";
  let selectedQuality = "high";

  fileInput.setAttribute("autocomplete", "off");

  // ===========================
  // Format Selection
  // ===========================

  const formatBtns = document.querySelectorAll(".format-btn");

  formatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {

      formatBtns.forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");

      selectedFormat = btn.dataset.format;

    });
  });

  // ===========================
  // Quality Selection
  // ===========================

  const qualityCards = document.querySelectorAll(".quality-card");

  qualityCards.forEach((card) => {

    card.addEventListener("click", () => {

      qualityCards.forEach((c) => c.classList.remove("active"));

      card.classList.add("active");

      const radio = card.querySelector("input");

      radio.checked = true;

      selectedQuality = radio.value;

    });

  });

  // ===========================
  // Drag Events
  // ===========================

  ["dragenter", "dragover"].forEach((eventName) => {

    dropZone.addEventListener(eventName, (e) => {

      e.preventDefault();

      dropZone.classList.add("dragover");

    });

  });

  ["dragleave", "drop"].forEach((eventName) => {

    dropZone.addEventListener(eventName, (e) => {

      e.preventDefault();

      dropZone.classList.remove("dragover");

    });

  });

  dropZone.addEventListener("drop", (e) => {

    const files = e.dataTransfer.files;

    if (files.length) {

      handleSelectedFile(files[0]);

    }

  });

  dropZone.addEventListener("click", () => {

    fileInput.click();

  });

  browseBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    fileInput.click();

  });

  fileInput.addEventListener("change", (e) => {

    if (e.target.files.length) {

      handleSelectedFile(e.target.files[0]);

    }

  });

  changeFileBtn.addEventListener("click", resetToUploadState);

  resetBtn.addEventListener("click", resetToUploadState);

  // ===========================
  // File Preview
  // ===========================

  function handleSelectedFile(file) {

    hideError();

    const allowed = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowed.includes(file.type)) {

      showError("Unsupported image format.");

      return;

    }

    if (file.size > 20 * 1024 * 1024) {

      showError("Maximum file size is 20MB.");

      return;

    }

    currentFile = file;

    const reader = new FileReader();

    reader.onload = (e) => {

      imagePreview.src = e.target.result;

      fileNameDisplay.textContent = file.name;

      fileSizeDisplay.textContent = formatBytes(file.size);

      dropZone.classList.add("hidden");

      processingSection.classList.remove("hidden");

      resultSection.classList.add("hidden");

    };

    reader.readAsDataURL(file);

    }
    // ===========================
  // Compress Image
  // ===========================

  compressBtn.addEventListener("click", async () => {

    if (!currentFile) return;

    hideError();

    setLoadingState(true);

    const formData = new FormData();

    formData.append("image", currentFile);
    formData.append("format", selectedFormat);
    formData.append("quality", selectedQuality);

    try {

      const response = await fetch("/api/v1/images/compress", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {

        let message = "Image processing failed.";

        try {
          const err = await response.json();
          message = err.error || message;
        } catch {}

        throw new Error(message);

      }

      const blob = await response.blob();

      const downloadURL = URL.createObjectURL(blob);

      let filename = "compressed-image";

      const disposition = response.headers.get("Content-Disposition");

      if (disposition) {

        const match = disposition.match(/filename="(.+)"/);

        if (match) filename = match[1];

      }

      resOrigSize.textContent = formatBytes(currentFile.size);
      resCompSize.textContent = formatBytes(blob.size);

      const ratio = (
        ((currentFile.size - blob.size) / currentFile.size) *
        100
      ).toFixed(1);

      resRatio.textContent =
        ratio >= 0
          ? `-${ratio}%`
          : `+${Math.abs(ratio)}%`;

      downloadLink.href = downloadURL;
      downloadLink.download = filename;

      processingSection.classList.add("hidden");
      resultSection.classList.remove("hidden");

    } catch (err) {

      showError(err.message || "Something went wrong.");

    } finally {

      setLoadingState(false);

    }

  });

  // ===========================
  // Reset
  // ===========================

  function resetToUploadState() {

    currentFile = null;

    fileInput.value = "";

    imagePreview.src = "";

    downloadLink.removeAttribute("href");
    downloadLink.removeAttribute("download");

    hideError();

    resultSection.classList.add("hidden");
    processingSection.classList.add("hidden");
    dropZone.classList.remove("hidden");

  }

  // ===========================
  // Loading
  // ===========================

  function setLoadingState(isLoading) {

    compressBtn.disabled = isLoading;

    if (isLoading) {

      btnText.classList.add("hidden");
      btnLoader.classList.remove("hidden");

    } else {

      btnText.classList.remove("hidden");
      btnLoader.classList.add("hidden");

    }

  }

  // ===========================
  // Errors
  // ===========================

  function showError(message) {

    errorMessage.textContent = message;

    errorAlert.classList.remove("hidden");

  }

  function hideError() {

    errorAlert.classList.add("hidden");

  }

  // ===========================
  // Utils
  // ===========================

  function formatBytes(bytes) {

    if (bytes === 0) return "0 Bytes";

    const k = 1024;

    const sizes = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return (
      parseFloat(
        (bytes / Math.pow(k, i)).toFixed(2)
      ) +
      " " +
      sizes[i]
    );

  }

});
