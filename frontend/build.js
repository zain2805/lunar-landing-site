const fs = require('fs');
const path = require('path');

const imagePath = "C:/Users/lenovo/.gemini/antigravity/brain/7aa5438f-4044-4037-b50a-9c2bd6667ac8/.user_uploaded/media_1794648270788_855c92d5.jpg";
const imageBytes = fs.readFileSync(imagePath);
const base64Data = imageBytes.toString('base64');
const dataUrl = `data:image/jpeg;base64,${base64Data}`;

console.log("Image loaded, length:", base64Data.length);

const templatePath = path.join(__dirname, 'template.html');
const templateHtml = fs.readFileSync(templatePath, 'utf8');

const finalHtml = templateHtml.replace('/*__ROCKET_BG_DATA_URL__*/', dataUrl);

const targetStandalone = path.join(__dirname, 'lunar_navigator_standalone.html');
const targetIndex = path.join(__dirname, 'index.html');

fs.writeFileSync(targetStandalone, finalHtml, 'utf8');
fs.writeFileSync(targetIndex, finalHtml, 'utf8');

console.log("Build complete!");
console.log("Written to:", targetStandalone, `(${finalHtml.length} bytes)`);
console.log("Written to:", targetIndex, `(${finalHtml.length} bytes)`);
