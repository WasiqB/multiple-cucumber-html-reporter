/**
 * Shared utility functions
 */
window.ReportUtils = {
  clear: (id) => {
    const el = document.querySelector(id);
    if (el) el.innerHTML = '';
  },

  isDark: () => document.documentElement.classList.contains('dark'),

  getTextColor: () => (window.ReportUtils.isDark() ? '#94a3b8' : '#64748b'),

  getGridColor: () => (window.ReportUtils.isDark() ? '#334155' : '#e2e8f0'),

  calculateBoxPlotData: (arr) => {
    if (!arr || arr.length === 0) return [0, 0, 0, 0, 0];
    const sorted = [...arr].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Simple quartile calculation
    const getPercentile = (p) => {
      const idx = Math.floor((sorted.length - 1) * p);
      return sorted[idx];
    };

    return [
      min,
      getPercentile(0.25), // Q1
      getPercentile(0.5), // Median
      getPercentile(0.75), // Q3
      max,
    ];
  },
};
