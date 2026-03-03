/**
 * Main entry point for the report
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme
  if (window.ReportTheme) {
    window.ReportTheme.init();
  }

  // Initialize Modals/Attachments
  if (window.ReportModal) {
    window.ReportModal.init();
  }

  // Initialize Dashboard (if on dashboard page)
  if (typeof chartData !== 'undefined' && window.ReportCharts) {
    window.ReportCharts.initDashboard(chartData);

    // Initialize Table if data exists
    if (window.ReportTable) {
      window.ReportTable.init(chartData);
    }
  }

  // Initialize Feature Details (if on feature page)
  if (typeof featureData !== 'undefined' && window.ReportCharts) {
    window.ReportCharts.initFeature(featureData);
    if (window.ReportScenarios) window.ReportScenarios.init();
  }
});
