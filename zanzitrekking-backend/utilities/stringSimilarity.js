/**
 * String Similarity Utility
 * Implements Levenshtein distance algorithm to check similarity between strings
 */

class StringSimilarity {
  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Levenshtein distance
   */
  static levenshteinDistance(str1, str2) {
    const matrix = [];

    // Create matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate similarity percentage between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Similarity percentage (0-100)
   */
  static similarity(str1, str2) {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 100;

    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 100;

    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const similarity = ((maxLength - distance) / maxLength) * 100;

    return Math.round(similarity * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Find the most similar string from an array
   * @param {string} target - Target string to compare
   * @param {Array<string>} strings - Array of strings to compare against
   * @returns {Object|null} - Object with 'string' and 'similarity' or null
   */
  static findMostSimilar(target, strings) {
    if (!target || !strings || strings.length === 0) return null;

    let maxSimilarity = 0;
    let mostSimilar = null;

    for (const str of strings) {
      const similarity = this.similarity(target, str);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        mostSimilar = str;
      }
    }

    return mostSimilar ? { string: mostSimilar, similarity: maxSimilarity } : null;
  }

  /**
   * Check if a string is similar to any string in an array above a threshold
   * @param {string} target - Target string to compare
   * @param {Array<string>} strings - Array of strings to compare against
   * @param {number} threshold - Similarity threshold (default: 80)
   * @returns {Object|null} - Object with 'string' and 'similarity' if above threshold, null otherwise
   */
  static checkSimilarity(target, strings, threshold = 80) {
    const result = this.findMostSimilar(target, strings);
    
    if (result && result.similarity >= threshold) {
      return result;
    }

    return null;
  }
}

module.exports = StringSimilarity;
