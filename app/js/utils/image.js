/**
 * Saves a DOM element as an image.
 * @param {string} elementId - The ID of the element to save.
 * @param {string} fileName - The name of the file to save as.
 */
export async function saveElementAsImage(elementId, fileName) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found.`);
    return;
  }

  try {
    // html2canvas is loaded via CDN in index.html
    if (typeof html2canvas === 'undefined') {
      throw new Error('html2canvas library is not loaded.');
    }

    // Temporarily hide buttons and other non-essential UI for the image
    const buttons = element.querySelectorAll('.btn:not(.pricing-display__value), .participant-checklist, .add-participant-global-btn');
    const originalStyles = [];
    buttons.forEach((btn) => {
      originalStyles.push({ el: btn, display: btn.style.display });
      btn.style.display = 'none';
    });

    // Handle scrollable containers for full table capture
    const tableContainers = element.querySelectorAll('.table-container');
    const originalContainerStyles = [];
    tableContainers.forEach((container) => {
      originalContainerStyles.push({
        el: container,
        maxHeight: container.style.maxHeight,
        overflow: container.style.overflow
      });
      container.style.maxHeight = 'none';
      container.style.overflow = 'visible';
    });

    const canvas = await html2canvas(element, {
      backgroundColor: getComputedStyle(document.body).getPropertyValue('--surface-color'),
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      windowWidth: element.scrollWidth + 100, // Ensure enough width for horizontal scroll
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.width = 'fit-content';
          clonedElement.style.padding = '20px';
          clonedElement.style.boxShadow = 'none';
          clonedElement.style.borderRadius = '0';

          // Ensure all parent containers in the clone don't restrict width
          let parent = clonedElement.parentElement;
          while (parent && parent.tagName !== 'BODY') {
            parent.style.width = 'fit-content';
            parent.style.maxWidth = 'none';
            parent.style.overflow = 'visible';
            parent = parent.parentElement;
          }

          // Expand table containers in the clone
          const containers = clonedElement.querySelectorAll('.table-container');
          containers.forEach(container => {
            container.style.width = 'fit-content';
            container.style.maxWidth = 'none';
            container.style.overflow = 'visible';
            
            const table = container.querySelector('table');
            if (table) {
              table.style.width = 'auto';
            }
          });

          // Disable sticky positioning in the clone as it often causes clipping/misalignment
          const stickyElements = clonedElement.querySelectorAll('th, td');
          stickyElements.forEach(el => {
            if (getComputedStyle(el).position === 'sticky') {
              el.style.position = 'static';
            }
          });
        }
      }
    });

    // Restore original styles
    originalStyles.forEach((item) => {
      item.el.style.display = item.display;
    });
    originalContainerStyles.forEach((item) => {
      item.el.style.maxHeight = item.maxHeight;
      item.el.style.overflow = item.overflow;
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `${fileName}.png`;
    link.click();
  } catch (error) {
    console.error('Failed to save image:', error);
    alert('画像の保存に失敗しました。');
  }
}
