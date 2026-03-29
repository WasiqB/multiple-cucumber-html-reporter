window.ReportScenarios = {
  init: () => {
    const filters = document.querySelectorAll('.status-filter');
    const scenarios = document.querySelectorAll('.scenario-card');
    const searchInput = document.getElementById('scenario-search');
    const noScenariosMessage = document.getElementById('no-scenarios-message');

    let currentStatus = 'all';
    let currentSearch = '';

    const applyFilters = () => {
      let visibleCount = 0;
      scenarios.forEach((card) => {
        const cardStatus = (card.getAttribute('data-status') || '').toLowerCase().trim();
        const cardName = (card.querySelector('h4')?.textContent || '').toLowerCase().trim();

        const matchesStatus = currentStatus === 'all' || cardStatus === currentStatus;
        const matchesSearch = currentSearch === '' || cardName.includes(currentSearch);

        if (matchesStatus && matchesSearch) {
          card.style.display = 'block';
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.style.display = 'none';
          card.classList.add('hidden');
        }
      });

      if (visibleCount === 0) {
        noScenariosMessage?.classList.remove('hidden');
      } else {
        noScenariosMessage?.classList.add('hidden');
      }
    };

    filters.forEach((filter) => {
      // Ensure cursor is pointer
      filter.style.cursor = 'pointer';

      filter.addEventListener('click', () => {
        currentStatus = filter.dataset.status.toLowerCase().trim();

        // Update UI
        filters.forEach((f) => {
          f.classList.remove('active', 'bg-background', 'shadow-sm', 'border-primary', 'ring-2', 'ring-primary/20');
          f.classList.add('border-transparent');
          f.style.fontWeight = 'normal';
        });
        filter.classList.remove('border-transparent');
        filter.classList.add('active', 'bg-background', 'shadow-sm', 'border-primary', 'ring-2', 'ring-primary/20');
        filter.style.fontWeight = 'bold';

        applyFilters();
      });
    });

    searchInput?.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  },
};
