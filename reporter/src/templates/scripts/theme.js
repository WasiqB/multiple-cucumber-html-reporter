/**
 * Theme management logic
 */
window.ReportTheme = {
  init: () => {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    const setTheme = (isDark) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        sunIcon?.classList.remove('hidden');
        moonIcon?.classList.add('hidden');
      } else {
        document.documentElement.classList.remove('dark');
        sunIcon?.classList.add('hidden');
        moonIcon?.classList.remove('hidden');
      }
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme === 'dark' || (!savedTheme && systemPrefersDark));

    themeToggle?.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      setTheme(!isCurrentlyDark);

      // Re-init charts to update colors with new brightness
      if (typeof chartData !== 'undefined') window.ReportCharts.initDashboard(chartData);
      if (typeof featureData !== 'undefined') window.ReportCharts.initFeature(featureData);
    });
  },
};
