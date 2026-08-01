# 🩸 BloodCompress

BloodCompress is a high-performance, production-ready image compression and format conversion web application built with Node.js, Express, Sharp, and vanilla CSS/JS. It provides a sleek, dark-themed SaaS interface with real-time drag-and-drop processing, client previews, format conversions, and customizable quality compression settings.

---

## ⚡ Features

- **Format Conversion**: Convert between `PNG`, `JPG`, `JPEG`, and `WEBP`.
- **Flexible Compression Settings**: High, Medium, and Low target quality tiers.
- **Drag & Drop Upload**: Instant preview with file specs and visual status indicators.
- **Auto Cleanup**: System automatically removes upload and output files safely after processing.
- **Ultra Fast**: Powered by the industry-standard `Sharp` image processing engine.
- **SaaS Dark Theme**: Built with CSS variable system, custom layout, fluid mobile responsiveness, and clean CSS animations.
- **Security First**: File extension validation, MIME-type verification, strict file size limits, and `Helmet` HTTP header protection.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation

1. **Clone or extract project files**:
   ```bash
   cd bloodcompress
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Application**:
   - Production Mode:
     ```bash
     npm start
     ```
   - Development Mode (with hot reloading):
     ```bash
     npm run dev
     ```

4. **Access in Browser**:
   Navigate to `http://localhost:3000`

---

## 📁 Project Architecture

```
bloodcompress/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   └── index.html
├── src/
│   ├── config/
│   │   └── config.js
│   ├── controllers/
│   │   └── imageController.js
│   ├── middleware/
│   │   └── upload.js
│   ├── routes/
│   │   └── imageRoutes.js
│   ├── services/
│   │   └── imageService.js
│   └── utils/
│       └── fileHelper.js
├── uploads/
├── outputs/
├── temp/
├── .gitignore
├── LICENSE
├── package.json
└── server.js
```

---

## 🔒 Security Measures

1. **Validation**: Enforces allowed MIME-types (`image/jpeg`, `image/png`, `image/webp`).
2. **Size Enforcement**: Configurable file upload limits (Default: 20MB).
3. **Automatic Cleanup**: Uploaded input files are unlinked immediately after processing; output temp files are garbage collected periodically or on download.
4. **Security Headers**: Managed via `Helmet.js` with tailored Content Security Policy (CSP).

---

## 📜 License

MIT License - see `LICENSE` file for details.
