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
        window.ReportModal.open(type, name, content);
      }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.ReportModal.close();
    });
  },

  close: () => {
    const modal = document.getElementById('media-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  },

  open: (type, name, content) => {
    const modal = document.getElementById('media-modal');
    const title = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (!modal || !title || !modalContent) return;

    title.textContent = name;
    let html = '';

    if (type === 'screenshot') {
      html = `
        <div class="flex items-center justify-center bg-slate-900 rounded p-4 md:p-8">
          <div class="text-center text-slate-400">
            <i class="fa-solid fa-image text-5xl mb-4 opacity-30"></i>
            <p class="text-sm font-medium">Screenshot: ${name}</p>
            <p class="text-xs opacity-50 mt-2 italic">Preview requires asset hosting in static mode</p>
          </div>
        </div>`;
    } else if (type === 'video') {
      html = `
        <div class="flex items-center justify-center bg-slate-900 rounded p-4 md:p-8">
          <div class="text-center text-slate-300">
            <i class="fa-solid fa-video text-5xl mb-4 opacity-30"></i>
            <p class="text-sm font-medium">Video: ${name}</p>
            <p class="text-xs opacity-50 mt-2 italic">Playback requires asset hosting in static mode</p>
          </div>
        </div>`;
    } else if (type === 'log') {
      html = `
        <div class="flex flex-col h-full overflow-hidden">
          <div class="flex items-center justify-between px-4 py-2 bg-slate-800 rounded-t border-b border-slate-700">
            <span class="text-slate-300 text-xs font-semibold uppercase tracking-wider">Console Log</span>
            <button onclick="window.ReportModal.copyLog()" id="copy-btn" class="flex items-center gap-1.5 px-3 py-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all text-xs font-medium">
              <i class="fa-solid fa-copy"></i>
              <span>Copy Log</span>
            </button>
          </div>
          <div class="bg-slate-900 text-slate-300 p-4 rounded-b font-mono text-[10px] md:text-xs overflow-auto max-h-[60vh] leading-relaxed">
            ${content
              .split('\n')
              .map((line) => `<div class="whitespace-pre-wrap mb-0.5">${line}</div>`)
              .join('')}
          </div>
        </div>`;
      window._lastModalContent = content;
    }

    modalContent.innerHTML = html;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
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
