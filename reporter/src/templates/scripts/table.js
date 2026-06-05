/**
 * Features table logic: search, sort, pagination
 */
window.ReportTable = {
  init: (data) => {
    const tableContainer = document.getElementById('features-table-container');
    const tableBody = document.getElementById('features-table-body');
    const searchInput = document.getElementById('feature-search');
    const pageSizeSelect = document.getElementById('records-per-page');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageNumbersContainer = document.getElementById('page-numbers');
    const showingStart = document.getElementById('showing-start');
    const showingEnd = document.getElementById('showing-end');
    const totalRecordsLabel = document.getElementById('total-records');

    if (!tableBody || !data.features) return;

    let filteredFeatures = [...data.features];
    let currentPage = 1;
    let pageSize = parseInt(pageSizeSelect?.value || '10', 10);
    let sortColumn = null;
    let sortDirection = 'asc';
    let selectedTags = [];
    let searchQuery = '';

    const applyAllFilters = () => {
      filteredFeatures = data.features.filter((f) => {
        const matchesSearch = searchQuery === '' ||
          f.name.toLowerCase().includes(searchQuery) ||
          (f.device || '').toLowerCase().includes(searchQuery) ||
          (f.os || '').toLowerCase().includes(searchQuery) ||
          (f.browser || '').toLowerCase().includes(searchQuery) ||
          (f.tags || []).some((t) => (t.name || '').toLowerCase().includes(searchQuery));

        const matchesTags = selectedTags.length === 0 ||
          (f.tags || []).some((t) => selectedTags.includes(t.name));

        return matchesSearch && matchesTags;
      });

      currentPage = 1;
      renderTable();
    };

    const iconForDevice = (value = '') =>
      /iPhone|Android|Mobile/i.test(value)
        ? 'fa-solid fa-mobile-screen-button'
        : /Tablet|iPad/i.test(value)
          ? 'fa-solid fa-tablet-screen-button'
          : 'fa-solid fa-desktop';

    const iconForOs = (value = '') =>
      /Windows/i.test(value)
        ? 'fa-brands fa-windows'
        : /Mac|iOS|macOS|darwin|osx/i.test(value)
          ? 'fa-brands fa-apple'
          : /Android/i.test(value)
            ? 'fa-brands fa-android'
            : /Linux|Ubuntu/i.test(value)
              ? 'fa-brands fa-linux'
              : 'fa-solid fa-laptop-code';

    const iconForBrowser = (value = '') =>
      /Chrome/i.test(value)
        ? 'fa-brands fa-chrome'
        : /Firefox/i.test(value)
          ? 'fa-brands fa-firefox'
          : /Safari/i.test(value)
            ? 'fa-brands fa-safari'
            : /Edge/i.test(value)
              ? 'fa-brands fa-edge'
              : 'fa-solid fa-globe';

    const platformIcon = (platform = 'local') => {
      if (platform === 'browserstack') {
        return '<span title="BrowserStack" class="text-[#e1660a]"><i class="fa-solid fa-cloud text-base"></i></span>';
      }
      if (platform === 'testmu') {
        return '<span title="TestMu AI" class="text-indigo-500"><i class="fa-solid fa-cloud text-base"></i></span>';
      }
      return '<span title="Local machine"><i class="fa-solid fa-computer text-base"></i></span>';
    };

    const renderTable = () => {
      const start = (currentPage - 1) * pageSize;
      const end = Math.min(start + pageSize, filteredFeatures.length);
      const paginatedItems = filteredFeatures.slice(start, end);

      tableBody.innerHTML = paginatedItems
        .map((feature) => {
          const total = (feature.passed || 0) + (feature.failed || 0) + (feature.ambiguous || 0) + (feature.notDefined || 0) + (feature.pending || 0) + (feature.skipped || 0);
          const passPercentage = total > 0 ? Math.round((feature.passed / total) * 100) : 0;

          const device = feature.device || 'Desktop';
          const os = feature.os || '';
          const browser = feature.browser || '';
          const deviceIcon = iconForDevice(device);
          const osIcon = os ? iconForOs(os) : '';
          const browserIcon = browser ? iconForBrowser(browser) : '';

          return `
            <tr class="hover:bg-muted/50 transition-colors">
              <td class="px-4 md:px-6 py-4 whitespace-nowrap md:whitespace-normal min-w-[200px]">
                <a href="features/${feature.id}.html" class="font-medium text-primary hover:underline">
                  ${feature.name}
                </a>
                <div class="flex flex-wrap gap-1 mt-1">
                  ${(feature.tags || [])
                    .map(
                      (tag) => `
                    <span class="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      ${tag.name}
                    </span>
                  `,
                    )
                    .join('')}
                </div>
              </td>
              <td class="px-4 md:px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2.5 text-muted-foreground">
                  <span title="${device}"><i class="${deviceIcon} text-base"></i></span>
                  ${osIcon ? `<span title="${os}"><i class="${osIcon} text-base"></i></span>` : ''}
                  ${browserIcon ? `<span title="${browser}"><i class="${browserIcon} text-base"></i></span>` : ''}
                  ${platformIcon(feature.executionPlatform)}
                </div>
              </td>
              <td class="px-4 md:px-6 py-4 min-w-[240px] whitespace-nowrap">
                <div class="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
                  ${feature.passed > 0 ? `<div class="h-full bg-status-passed" style="width: ${(feature.passed / total) * 100}%"></div>` : ''}
                  ${feature.failed > 0 ? `<div class="h-full bg-status-failed" style="width: ${(feature.failed / total) * 100}%"></div>` : ''}
                  ${feature.ambiguous > 0 ? `<div class="h-full bg-status-ambiguous" style="width: ${(feature.ambiguous / total) * 100}%"></div>` : ''}
                  ${feature.notDefined > 0 ? `<div class="h-full bg-status-undefined" style="width: ${(feature.notDefined / total) * 100}%"></div>` : ''}
                  ${feature.pending > 0 ? `<div class="h-full bg-status-pending" style="width: ${(feature.pending / total) * 100}%"></div>` : ''}
                  ${feature.skipped > 0 ? `<div class="h-full bg-status-skipped" style="width: ${(feature.skipped / total) * 100}%"></div>` : ''}
                </div>
                <div class="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] font-medium uppercase">
                  <span class="text-status-passed">${feature.passed} Passed</span>
                  <span class="text-status-failed">${feature.failed} Failed</span>
                  ${feature.ambiguous > 0 ? `<span class="text-status-ambiguous">${feature.ambiguous} Ambiguous</span>` : ''}
                  ${feature.notDefined > 0 ? `<span class="text-status-undefined">${feature.notDefined} Not Defined</span>` : ''}
                  ${feature.pending > 0 ? `<span class="text-status-pending">${feature.pending} Pending</span>` : ''}
                  <span class="text-status-skipped">${feature.skipped} Skipped</span>
                </div>
              </td>
              <td class="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                <div class="inline-flex items-center justify-end relative h-12 w-12">
                  <svg class="h-12 w-12 transform -rotate-90">
                    <circle class="text-muted/20" stroke-width="3" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
                    <circle class="text-status-passed transition-all duration-500 ease-out" stroke-width="3" 
                      stroke-dasharray="125.6" 
                      stroke-dashoffset="${125.66 - (passPercentage * 1.2566)}" 
                      stroke-linecap="round" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
                  </svg>
                  <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold">${passPercentage}%</span>
                </div>
              </td>
            </tr>
          `;
        })
        .join('');

      showingStart.textContent = filteredFeatures.length === 0 ? 0 : start + 1;
      showingEnd.textContent = end;
      totalRecordsLabel.textContent = filteredFeatures.length;

      renderPagination();
      updateSortIcons();

      const noFeaturesMessage = document.getElementById('no-features-message');
      const tableWrapper = tableContainer.querySelector('.overflow-x-auto');
      const paginationWrapper = tableContainer.querySelector('.px-6.py-4.border-t');

      if (filteredFeatures.length === 0) {
        noFeaturesMessage?.classList.remove('hidden');
        tableWrapper?.classList.add('hidden');
        paginationWrapper?.classList.add('hidden');
      } else {
        noFeaturesMessage?.classList.add('hidden');
        tableWrapper?.classList.remove('hidden');
        paginationWrapper?.classList.remove('hidden');
      }
    };

    const handleSort = (column) => {
      if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }

      filteredFeatures.sort((a, b) => {
        let valA, valB;
        const totalA = (a.passed || 0) + (a.failed || 0) + (a.ambiguous || 0) + (a.notDefined || 0) + (a.pending || 0) + (a.skipped || 0);
        const totalB = (b.passed || 0) + (b.failed || 0) + (b.ambiguous || 0) + (b.notDefined || 0) + (b.pending || 0) + (b.skipped || 0);

        switch (column) {
          case 0:
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 2:
            valA = a.passed;
            valB = b.passed;
            break;
          case 3:
            valA = totalA > 0 ? a.passed / totalA : 0;
            valB = totalB > 0 ? b.passed / totalB : 0;
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      currentPage = 1;
      renderTable();
    };

    const updateSortIcons = () => {
      const headers = tableContainer.querySelectorAll('thead th');
      headers.forEach((th, idx) => {
        const icon = th.querySelector('i.fa-sort, i.fa-sort-up, i.fa-sort-down');
        if (icon) {
          icon.className = 'fa-solid text-[10px] ml-1.5 transition-all';
          if (idx === sortColumn) {
            icon.classList.add(sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
            icon.classList.remove('opacity-30');
            icon.classList.add('opacity-100', 'text-primary');
          } else {
            icon.classList.add('fa-sort', 'opacity-30');
          }
        }
      });
    };

    const renderPagination = () => {
      const totalPages = Math.ceil(filteredFeatures.length / pageSize);
      pageNumbersContainer.innerHTML = '';
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      if (endPage - startPage + 1 < maxVisiblePages) startPage = Math.max(1, endPage - maxVisiblePages + 1);

      for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = `h-8 w-8 flex items-center justify-center rounded border transition-all ${
          i === currentPage
            ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
            : 'hover:bg-muted border-transparent hover:border-border text-muted-foreground hover:text-foreground'
        }`;
        btn.textContent = i;
        btn.onclick = () => {
          currentPage = i;
          renderTable();
        };
        pageNumbersContainer.appendChild(btn);
      }
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    };

    // Events
    const headers = tableContainer.querySelectorAll('thead th');
    headers.forEach((th, idx) => {
      if (idx === 0 || idx === 2 || idx === 3) th.addEventListener('click', () => handleSort(idx));
    });

    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      applyAllFilters();
    });

    // Tag Dropdown Setup
    const allTags = new Set();
    data.features.forEach((f) => {
      (f.tags || []).forEach((t) => {
        if (t.name) allTags.add(t.name);
      });
    });
    const sortedTags = Array.from(allTags).sort();

    const filterDropdown = document.getElementById('feature-tag-filter-dropdown');
    const filterButton = document.getElementById('feature-tag-filter-button');
    const filterLabel = document.getElementById('feature-tag-filter-label');

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
        applyAllFilters();
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
        applyAllFilters();
      });
    }

    pageSizeSelect?.addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value, 10);
      currentPage = 1;
      renderTable();
    });

    prevBtn?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
    nextBtn?.addEventListener('click', () => {
      if (currentPage < Math.ceil(filteredFeatures.length / pageSize)) {
        currentPage++;
        renderTable();
      }
    });

    renderTable();
  },
};
