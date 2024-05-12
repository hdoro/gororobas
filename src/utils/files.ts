export function base64ToFile(
	base64String: string,
	fileName: string,
	mimeType = 'application/octet-stream',
): File {
	// Split the base64 string into the data and the data prefix
	const base64Data = base64String.split(';base64,').pop() || ''
	// Convert the base64 string to a byte array
	const byteCharacters = atob(base64Data)
	const byteNumbers = new Array(byteCharacters.length)
	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i)
	}
	const byteArray = new Uint8Array(byteNumbers)
	// Create a Blob from the byte array
	const blob = new Blob([byteArray], { type: mimeType })
	// Create and return the File object from the blob
	return new File([blob], fileName, { type: mimeType })
}

/**
 * Converts a File object to a Base64 encoded string.
 * @param file The file to be converted.
 * @returns A Promise that resolves to a Base64 encoded string.
 */
export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		// Create a FileReader object
		const reader = new FileReader()
		// Define the onload event handler
		reader.onload = () => {
			// On successful reading of the file, resolve the promise with the base64 string
			const result = reader.result as string
			resolve(result)
		}
		// Define the onerror event handler
		reader.onerror = (error) => {
			reject(error)
		}
		// Read the file as a data URL
		reader.readAsDataURL(file)
	})
}
