import { IMAGES_URL } from "./constants";

/**
 * Refactors an image URL by extracting the filename and prepending the base images URL.
 * If the image is invalid or missing, returns a placeholder image path.
 *
 * @param {string|null|undefined} image - The original image path or URL
 * @returns {string} The refactored image URL or a placeholder if image is invalid
 *
 * @example
 * refectorImage('/uploads/image.jpg')
 * // Returns: 'https://api.zanzisafaris.com/public/uploads/image.jpg'
 *
 * @example
 * refectorImage(null)
 * // Returns: '/placeholder.svg'
 */
export const refectorImage = (image) =>
  image ? IMAGES_URL + image.split("/").pop() : "/placeholder.svg";