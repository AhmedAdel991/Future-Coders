const sharp = require("sharp");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

// Directory containing the images
const imagesDir = path.join(__dirname, "images");

// Supported image formats
const supportedFormats = [".png", ".jpg", ".jpeg", ".webp"];

// Function to recursively find and process images in directories
async function processImages(directory) {
	const files = await fs.readdir(directory);

	for (const file of files) {
		const filePath = path.join(directory, file);
		const fileStat = await fs.stat(filePath);

		if (fileStat.isDirectory()) {
			// Recursively process subdirectories
			await processImages(filePath);
		} else {
			const ext = path.extname(file).toLowerCase();

			if (supportedFormats.includes(ext)) {
				await compressImage(filePath, ext);
			} else if (ext === ".svg") {
				console.log(`Skipping SVG file: ${filePath}`);
			} else {
				console.log(`Unsupported file format: ${filePath}`);
			}
		}
	}
}

// Function to compress an image
async function compressImage(filePath, ext) {
	try {
		// Create a temporary file path
		const tempFilePath = path.join(
			os.tmpdir(),
			`${path.basename(filePath)}_tmp${ext}`
		);

		// Set quality or compression options based on the format
		const options = {
			quality: 80, // Adjust quality as needed (for JPEG/WebP)
		};

		if (ext === ".jpg" || ext === ".jpeg") {
			await sharp(filePath).jpeg(options).toFile(tempFilePath);
		} else if (ext === ".png") {
			await sharp(filePath)
				.png({ compressionLevel: 9 }) // Max compression for PNG
				.toFile(tempFilePath);
		} else if (ext === ".webp") {
			await sharp(filePath).webp(options).toFile(tempFilePath);
		}

		// Replace the original file with the compressed file
		await fs.move(tempFilePath, filePath, { overwrite: true });

		console.log(`Compressed: ${filePath}`);
	} catch (error) {
		console.error(`Error compressing ${filePath}:`, error);
	}
}

// Start processing the images
(async () => {
	try {
		await processImages(imagesDir);
		console.log("Image compression completed.");
	} catch (error) {
		console.error("Error processing images:", error);
	}
})();
