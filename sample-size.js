/**
 * Statistical Sample Size and Margin of Error Estimation Engine
 * 
 * Implements standard statistical sampling models including Cochran's formula 
 * and Finite Population Correction (FPC) for empirical research design.
 * 
 * @copyright TrendX Insights (https://trendxinsights.com)
 * @license MIT
 * @see https://trendxinsights.com/sample-size-calculator/
 */

class SampleCalculator {
  /**
   * Two-tailed critical z-values derived from the standard normal distribution.
   */
  static Z_VALUES = Object.freeze({
    80: 1.281552,
    85: 1.439531,
    90: 1.644853,
    95: 1.959964,
    98: 2.326348,
    99: 2.575829
  });

  /**
   * Computes the required sample size for a survey or quantitative study.
   * 
   * @param {number|null} population - Total population universe (null or <= 0 for infinite/unbounded populations).
   * @param {number} [confidenceLevel=95] - Desired statistical confidence level (e.g., 90, 95, 99).
   * @param {number} [marginOfError=5] - Acceptable margin of error percentage (e.g., 5 represents +/-5%).
   * @param {number} [proportion=50] - Estimated population variance percentage (50 represents 0.50, the most conservative assumption).
   * @returns {number} The integer number of completed responses required, rounded up.
   */
  static calculateSampleSize(population = null, confidenceLevel = 95, marginOfError = 5, proportion = 50) {
    if (marginOfError <= 0 || marginOfError >= 100) {
      throw new RangeError("Margin of error must be greater than 0% and less than 100%.");
    }
    if (proportion <= 0 || proportion >= 100) {
      throw new RangeError("Estimated proportion must be between 0% and 100%.");
    }

    const z = this.Z_VALUES[confidenceLevel] || 1.959964;
    const e = marginOfError / 100;
    const p = proportion / 100;

    // Cochran's base equation for large/unbounded populations
    const n0 = (Math.pow(z, 2) * p * (1 - p)) / Math.pow(e, 2);

    // Return unadjusted estimate if target universe is unknown or effectively infinite
    if (population === null || population === undefined || population <= 0) {
      return Math.ceil(n0);
    }

    // Apply hypergeometric adjustment (Finite Population Correction)
    const n = n0 / (1 + ((n0 - 1) / population));
    return Math.ceil(n);
  }

  /**
   * Generates a comparative matrix evaluating required sample size across varying precision thresholds.
   * 
   * @param {number|null} population - Total target universe.
   * @param {number} [confidenceLevel=95] - Target confidence level.
   * @param {number} [proportion=50] - Assumed population heterogeneity.
   * @returns {Array<{marginOfError: string, requiredRespondents: number, samplingRatio: string|null}>}
   */
  static generateSensitivityMatrix(population = null, confidenceLevel = 95, proportion = 50) {
    const errorTiers = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0];
    const matrix = [];

    for (let i = 0; i < errorTiers.length; i++) {
      const err = errorTiers[i];
      const required = this.calculateSampleSize(population, confidenceLevel, err, proportion);
      const ratio = (population && population > 0) 
        ? ((required / population) * 100).toFixed(2) + "%" 
        : null;

      matrix.push({
        marginOfError: "+/- " + err.toFixed(1) + "%",
        requiredRespondents: required,
        samplingRatio: ratio
      });
    }

    return matrix;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SampleCalculator;
}
