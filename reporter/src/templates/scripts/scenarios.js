/**
 * Scenario filtering logic
 */
window.ReportScenarios = {
  init: () => {
    const filters = document.querySelectorAll('.status-filter');
    const scenarios = document.querySelectorAll('.scenario-card');

    filters.forEach((filter) => {
      // Ensure cursor is pointer
      filter.style.cursor = 'pointer';

      filter.addEventListener('click', () => {
        const targetStatus = filter.dataset.status.toLowerCase().trim();

        // Update UI
        filters.forEach((f) => {
          f.classList.remove('active', 'bg-background', 'shadow-sm', 'border-primary', 'ring-2', 'ring-primary/20');
          f.classList.add('border-transparent');
          f.style.fontWeight = 'normal';
        });
        filter.classList.remove('border-transparent');
        filter.classList.add('active', 'bg-background', 'shadow-sm', 'border-primary', 'ring-2', 'ring-primary/20');
        filter.style.fontWeight = 'bold';

        // Filter scenarios
        scenarios.forEach((card) => {
          const cardStatus = (card.getAttribute('data-status') || '').toLowerCase().trim();

          if (targetStatus === 'all' || cardStatus === targetStatus) {
            card.style.display = 'block';
            card.classList.remove('hidden');
          } else {
            card.style.display = 'none';
            card.classList.add('hidden');
          }
        });
      });
    });
  },
};
