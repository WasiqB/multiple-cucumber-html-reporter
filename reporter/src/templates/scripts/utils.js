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

  escape: (unsafe) => {
    return (unsafe || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
};
