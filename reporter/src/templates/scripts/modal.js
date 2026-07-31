/**
 * Modal handling and attachment functions
 */
window.ReportModal = {
  init: () => {
    // Global click listener for modal triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.modal-trigger');
      if (trigger) {
        const type = trigger.dataset.attachmentType;
        const name = trigger.dataset.attachmentName;
        const content = trigger.dataset.attachmentContent || '';
        // A sniffed-as-video HTML attachment is normally a whole-scenario
        // recording, not tied to one step - the scenario name is more useful
        // context there than which step happened to trigger the attach().
        const isVideo = trigger.dataset.isVideo === 'true';
        const context = isVideo ? trigger.dataset.scenarioContext : trigger.dataset.stepContext;
        window.ReportModal.open(type, name, content, context || '');
      }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.ReportModal.close();
    });

    window.ReportModal._initDrag();
    window.ReportModal._initResize();
  },

  close: () => {
    const modal = document.getElementById('media-modal');
    const backdrop = document.getElementById('media-modal-backdrop');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    if (backdrop) {
      backdrop.classList.add('hidden');
    }
    document.body.style.overflow = '';
  },

  // Panel is non-modal (page behind stays interactive); this wires up
  // dragging it by its header.
  _initDrag: () => {
    const modal = document.getElementById('media-modal');
    const handle = document.getElementById('modal-drag-handle');
    if (!modal || !handle) return;

    let drag = null;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      const rect = modal.getBoundingClientRect();
      drag = { offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
      // First drag switches from the default right-anchored position to an
      // explicit left/top so it tracks the cursor from wherever it already is.
      modal.style.right = 'auto';
      modal.style.left = `${rect.left}px`;
      modal.style.top = `${rect.top}px`;
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!drag) return;
      modal.style.left = `${e.clientX - drag.offsetX}px`;
      modal.style.top = `${e.clientY - drag.offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
      drag = null;
      document.body.style.userSelect = '';
    });
  },

  // Edge/corner handles (see media_modal.liquid's [data-resize-dir] divs) -
  // 'n'/'s' resize height, 'e'/'w' resize width; 'n'/'w' also have to move
  // the panel's top/left as they shrink/grow, since resizing from the near
  // edge keeps the *opposite* edge fixed rather than the origin.
  _initResize: () => {
    const modal = document.getElementById('media-modal');
    if (!modal) return;

    const MIN_WIDTH = 320; // matches the min-width set in media_modal.liquid
    const MIN_HEIGHT = 192; // matches the min-height set in media_modal.liquid
    let resize = null;

    modal.querySelectorAll('[data-resize-dir]').forEach((handle) => {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const rect = modal.getBoundingClientRect();
        resize = {
          dir: handle.dataset.resizeDir,
          startX: e.clientX,
          startY: e.clientY,
          startWidth: rect.width,
          startHeight: rect.height,
          startLeft: rect.left,
          startTop: rect.top,
        };
        modal.style.right = 'auto';
        modal.style.left = `${rect.left}px`;
        modal.style.top = `${rect.top}px`;
        document.body.style.userSelect = 'none';
      });
    });

    document.addEventListener('mousemove', (e) => {
      if (!resize) return;
      const { dir } = resize;
      const dx = e.clientX - resize.startX;
      const dy = e.clientY - resize.startY;

      if (dir.includes('e')) {
        modal.style.width = `${Math.max(MIN_WIDTH, resize.startWidth + dx)}px`;
      }
      if (dir.includes('s')) {
        modal.style.height = `${Math.max(MIN_HEIGHT, resize.startHeight + dy)}px`;
      }
      if (dir.includes('w')) {
        const newWidth = Math.max(MIN_WIDTH, resize.startWidth - dx);
        modal.style.width = `${newWidth}px`;
        modal.style.left = `${resize.startLeft + (resize.startWidth - newWidth)}px`;
      }
      if (dir.includes('n')) {
        const newHeight = Math.max(MIN_HEIGHT, resize.startHeight - dy);
        modal.style.height = `${newHeight}px`;
        modal.style.top = `${resize.startTop + (resize.startHeight - newHeight)}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      resize = null;
      document.body.style.userSelect = '';
    });
  },

  open: (type, name, content, stepContext) => {
    const modal = document.getElementById('media-modal');
    const title = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !title || !modalContent) return;

    title.textContent = name;
    let html = '';

    if (type === 'screenshot' || type?.includes('image')) {
      html = `
        <div class="flex flex-col h-full overflow-hidden">
          ${
            stepContext
              ? `<div class="shrink-0 px-4 py-2 bg-slate-800 border-b border-slate-700 text-slate-400 text-xs whitespace-pre-wrap break-words">${window.ReportUtils.escape(stepContext)}</div>`
              : ''
          }
          <div class="flex-1 min-h-0 flex items-center justify-center bg-slate-900 rounded p-2 overflow-auto">
            <img src="${content}" alt="${name}" class="max-w-full h-auto rounded shadow-2xl transition-transform duration-300 hover:scale-[1.02]" onerror='this.onerror=null; this.src="../assets/img/placeholder.png"; this.parentElement.innerHTML="<p class="text-slate-400 p-8">Failed to load image</p>"'>
          </div>
        </div>`;
    } else if (type === 'video' || type?.includes('video')) {
      html = `
        <div class="flex flex-col h-full overflow-hidden">
          ${
            stepContext
              ? `<div class="shrink-0 px-4 py-2 bg-slate-800 border-b border-slate-700 text-slate-400 text-xs whitespace-pre-wrap break-words">${window.ReportUtils.escape(stepContext)}</div>`
              : ''
          }
          <div class="flex-1 min-h-0 flex items-center justify-center bg-slate-900 rounded p-2">
            <video controls class="max-w-full max-h-full rounded shadow-2xl" autoplay>
              <source src="${content}" type="${type}">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>`;
    } else if (type === 'html') {
      // text/html attachments are meant to be rendered as real markup (e.g. a
      // hand-built <video> tag, common when a framework has no native video
      // attachment mime type to attach() with) - content is intentionally
      // NOT escaped here, unlike the 'log' branch below.
      html = `
        <div class="flex flex-col h-full overflow-hidden">
          ${
            stepContext
              ? `<div class="shrink-0 px-4 py-2 bg-slate-800 border-b border-slate-700 text-slate-400 text-xs whitespace-pre-wrap break-words">${window.ReportUtils.escape(stepContext)}</div>`
              : ''
          }
          <div class="flex-1 min-h-0 overflow-auto p-4 bg-white rounded-b">${content}</div>
        </div>`;
    } else if (type === 'log') {
      html = `
        <div class="flex flex-col h-full overflow-hidden">
          <div class="shrink-0 flex flex-col gap-1 px-4 py-2 bg-slate-800 rounded-t border-b border-slate-700">
            <div class="flex items-center justify-between">
              <span class="text-slate-300 text-xs font-semibold uppercase tracking-wider">Console Log</span>
              <button onclick="window.ReportModal.copyLog()" id="copy-btn" class="flex items-center gap-1.5 px-3 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all text-xs font-medium">
                <i class="fa-solid fa-copy"></i>
                <span>Copy Log</span>
              </button>
            </div>
            ${
              stepContext
                ? `<div class="text-slate-400 text-xs whitespace-pre-wrap break-words">${window.ReportUtils.escape(stepContext)}</div>`
                : ''
            }
          </div>
          <div class="flex-1 min-h-0 bg-slate-900 text-slate-300 p-4 rounded-b font-mono text-[10px] md:text-xs overflow-auto leading-relaxed">
            ${window.ReportUtils.escape(content)
              .split('\n')
              .map((line) => `<div class="whitespace-pre-wrap mb-0.5">${line}</div>`)
              .join('')}
          </div>
        </div>`;
      window._lastModalContent = content;
    } else if (type === 'error') {
      html = `
        <div class="flex flex-col h-full overflow-hidden">
          <div class="shrink-0 flex items-center justify-between px-4 py-2 bg-red-950/40 rounded-t border-b border-red-500/20">
            <span class="text-red-400 text-xs font-semibold uppercase tracking-wider">Error Details & Stack Trace</span>
            <button onclick="window.ReportModal.copyLog()" id="copy-btn" class="flex items-center gap-1.5 px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all text-xs font-medium">
              <i class="fa-solid fa-copy"></i>
              <span>Copy Error</span>
            </button>
          </div>
          <div class="flex-1 min-h-0 bg-slate-950 text-red-400/90 p-4 rounded-b font-mono text-[10px] md:text-sm overflow-auto leading-relaxed">
            ${window.ReportUtils.escape(content)
              .split('\n')
              .map((line) => `<div class="whitespace-pre-wrap mb-1.5">${line}</div>`)
              .join('')}
          </div>
        </div>`;
      window._lastModalContent = content;
    }

    modalContent.innerHTML = html;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const backdrop = document.getElementById('media-modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('hidden');
    }
    // Classic mode has no separate backdrop element (the backdrop IS
    // #media-modal) but still blocks the page, so this can't just check
    // whether `backdrop` exists - window.ReportConfig.modalBackdrop is the
    // authoritative signal either way (defaults to true).
    if (!window.ReportConfig || window.ReportConfig.modalBackdrop !== false) {
      document.body.style.overflow = 'hidden';
    }
  },

  copyLog: () => {
    const content = window._lastModalContent;
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        const btn = document.getElementById('copy-btn');
        if (btn) {
          const originalInner = btn.innerHTML;
          btn.innerHTML = `<i class="fa-solid fa-check text-green-400"></i><span class="text-green-400">Copied!</span>`;
          setTimeout(() => (btn.innerHTML = originalInner), 2000);
        }
      });
    }
  },
};

// Aliases for global scope (legacy/shorthand support)
window.closeModal = window.ReportModal.close;
window.openModal = window.ReportModal.open;
window.copyModalContent = window.ReportModal.copyLog;
