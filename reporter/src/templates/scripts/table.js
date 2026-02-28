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

    const renderTable = () => {
      const start = (currentPage - 1) * pageSize;
      const end = Math.min(start + pageSize, filteredFeatures.length);
      const paginatedItems = filteredFeatures.slice(start, end);

      tableBody.innerHTML = paginatedItems
        .map((feature) => {
          const slug = window.ReportUtils.formatSlug(feature.name);
          const total = (feature.passed || 0) + (feature.failed || 0) + (feature.skipped || 0);
          const passPercentage = total > 0 ? Math.round((feature.passed / total) * 100) : 0;

          const deviceIcon = feature.device.match(/iPhone|Android|Mobile/i)
            ? 'fa-solid fa-mobile-screen-button'
            : feature.device.match(/Tablet|iPad/i)
              ? 'fa-solid fa-tablet-screen-button'
              : 'fa-solid fa-desktop';

          const osIcon = feature.os.match(/Windows/i)
            ? 'fa-brands fa-microsoft'
            : feature.os.match(/Mac|iOS|macOS/i)
              ? 'fa-brands fa-apple'
              : feature.os.match(/Android/i)
                ? 'fa-brands fa-android'
                : feature.os.match(/Linux|Ubuntu/i)
                  ? 'fa-brands fa-linux'
                  : 'fa-solid fa-laptop-code';

          const browserIcon = feature.browser.match(/Chrome/i)
            ? 'fa-brands fa-chrome'
            : feature.browser.match(/Firefox/i)
              ? 'fa-brands fa-firefox'
              : feature.browser.match(/Safari/i)
                ? 'fa-brands fa-safari'
                : feature.browser.match(/Edge/i)
                  ? 'fa-brands fa-edge'
                  : 'fa-solid fa-globe';

          return `
            <tr class="hover:bg-muted/50 transition-colors">
              <td class="px-4 md:px-6 py-4 whitespace-nowrap md:whitespace-normal min-w-[200px]">
                <a href="features/${slug}.html" class="font-medium text-primary hover:underline">
                  ${feature.name}
                </a>
                <div class="flex flex-wrap gap-1 mt-1">
                  ${(feature.tags || [])
                    .map(
                      (tag) => `
                    <span class="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      ${tag}
                    </span>
                  `,
                    )
                    .join('')}
                </div>
              </td>
              <td class="px-4 md:px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2 text-foreground font-medium">
                  <i class="${deviceIcon} text-muted-foreground w-4"></i>
                  ${feature.device}
                </div>
                <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span class="flex items-center gap-1">
                    <i class="${osIcon} w-3"></i>
                    ${feature.os}
                  </span>
                  <span class="opacity-30">/</span>
                  <span class="flex items-center gap-1">
                    <i class="${browserIcon} w-3"></i>
                    ${feature.browser}
                  </span>
                </div>
              </td>
              <td class="px-4 md:px-6 py-4 whitespace-nowrap">
                <div class="flex h-2 w-24 md:w-32 overflow-hidden rounded-full bg-secondary">
                  ${feature.passed > 0 ? `<div class="h-full bg-green-500" style="width: ${(feature.passed / total) * 100}%"></div>` : ''}
                  ${feature.failed > 0 ? `<div class="h-full bg-red-500" style="width: ${(feature.failed / total) * 100}%"></div>` : ''}
                  ${feature.skipped > 0 ? `<div class="h-full bg-yellow-500" style="width: ${(feature.skipped / total) * 100}%"></div>` : ''}
                </div>
                <div class="mt-1 flex gap-2 text-[10px] font-medium uppercase">
                  <span class="text-green-600">${feature.passed} Passed</span>
                  <span class="text-red-600">${feature.failed} Failed</span>
                  <span class="text-yellow-600">${feature.skipped} Skipped</span>
                </div>
              </td>
              <td class="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                ${passPercentage}%
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
        const totalA = (a.passed || 0) + (a.failed || 0) + (a.skipped || 0);
        const totalB = (b.passed || 0) + (b.failed || 0) + (b.skipped || 0);

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
      const query = e.target.value.toLowerCase();
      filteredFeatures = data.features.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.device.toLowerCase().includes(query) ||
          f.os.toLowerCase().includes(query) ||
          f.browser.toLowerCase().includes(query) ||
          (f.tags || []).some((t) => t.toLowerCase().includes(query)),
      );
      currentPage = 1;
      renderTable();
    });

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
