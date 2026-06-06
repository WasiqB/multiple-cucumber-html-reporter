window.ReportScenarios = {
  init: (featureData) => {
    const filters = document.querySelectorAll('.status-filter');
    const scenarios = document.querySelectorAll('.scenario-card');
    const searchInput = document.getElementById('scenario-search');
    const noScenariosMessage = document.getElementById('no-scenarios-message');

    let currentStatus = 'all';
    let currentSearch = '';
    let selectedTags = [];

    const applyFilters = () => {
      let visibleCount = 0;
      scenarios.forEach((card) => {
        const cardStatus = (card.getAttribute('data-status') || '').toLowerCase().trim();
        const cardName = (card.querySelector('h4')?.textContent || '').toLowerCase().trim();
        const cardTagsAttr = card.getAttribute('data-tags') || '';
        const cardTags = cardTagsAttr ? cardTagsAttr.split(',').map((t) => t.trim()) : [];

        const matchesStatus = currentStatus === 'all' || cardStatus === currentStatus;
        const matchesSearch = currentSearch === '' || cardName.includes(currentSearch);
        const matchesTags = selectedTags.length === 0 || cardTags.some((tag) => selectedTags.includes(tag));

        if (matchesStatus && matchesSearch && matchesTags) {
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

    // Tag Dropdown Setup
    const allTags = new Set();
    scenarios.forEach((card) => {
      const tagsAttr = card.getAttribute('data-tags');
      if (tagsAttr) {
        tagsAttr.split(',').forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) allTags.add(trimmed);
        });
      }
    });
    const sortedTags = Array.from(allTags).sort();

    const filterDropdown = document.getElementById('scenario-tag-filter-dropdown');
    const filterButton = document.getElementById('scenario-tag-filter-button');
    const filterLabel = document.getElementById('scenario-tag-filter-label');

    if (filterDropdown && filterButton) {
      filterDropdown.innerHTML = '';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'flex items-center justify-between p-1 border-b border-border mb-1 sticky top-0 bg-card z-10';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'text-[10px] font-bold text-muted-foreground uppercase px-1';
      titleSpan.textContent = 'Tags';

      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'clear-tags-btn text-[10px] font-bold text-primary hover:underline px-1 cursor-pointer';
      clearBtn.textContent = 'Clear';

      headerDiv.appendChild(titleSpan);
      headerDiv.appendChild(clearBtn);
      filterDropdown.appendChild(headerDiv);

      const listContainer = document.createElement('div');
      listContainer.className = 'space-y-1';

      sortedTags.forEach((tag) => {
        const label = document.createElement('label');
        label.className = 'flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted cursor-pointer transition-colors text-foreground';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = tag;
        input.className = 'rounded border-input text-primary focus:ring-ring h-3.5 w-3.5 tag-checkbox';

        const span = document.createElement('span');
        span.className = 'truncate';
        span.textContent = tag;

        label.appendChild(input);
        label.appendChild(span);
        listContainer.appendChild(label);
      });

      filterDropdown.appendChild(listContainer);

      filterButton.addEventListener('click', (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!filterDropdown.contains(e.target) && e.target !== filterButton) {
          filterDropdown.classList.add('hidden');
        }
      });

      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const checkedBoxes = filterDropdown.querySelectorAll('.tag-checkbox:checked');
        checkedBoxes.forEach((cb) => {
          cb.checked = false;
        });
        selectedTags = [];
        filterLabel.textContent = 'Filter by tags...';
        filterLabel.classList.add('text-muted-foreground');
        applyFilters();
      });

      filterDropdown.addEventListener('change', () => {
        const checkedBoxes = filterDropdown.querySelectorAll('.tag-checkbox:checked');
        selectedTags = Array.from(checkedBoxes).map((cb) => cb.value);

        if (selectedTags.length === 0) {
          filterLabel.textContent = 'Filter by tags...';
          filterLabel.classList.add('text-muted-foreground');
        } else {
          filterLabel.textContent = selectedTags.join(', ');
          filterLabel.classList.remove('text-muted-foreground');
        }
        applyFilters();
      });
    }
  },
};
