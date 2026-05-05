import {
  SUFFIX_FEE,
  IDS,
  CLASSES,
  HEADER_PARTICIPANT,
  HEADER_TOTAL_PAYMENT,
  HEADER_PER_PERSON,
  HEADER_BALANCE,
} from '../constants.js';
import { dispatch, ACTIONS } from '../state.js';
import { createGenericTableElement } from './table.js';
import { renderParticipantChecklist } from './participant.js';

function createDynamicSectionElement(section) {
  const sectionElement = document.createElement('section');
  sectionElement.id = section.id;
  sectionElement.className = CLASSES.CONTENT_SECTION;
  sectionElement.dataset.sectionName = section.name;

  sectionElement.innerHTML = `
        <h2 class="${CLASSES.CONTENT_SECTION}__title ${CLASSES.DYNAMIC_SECTION_HEADER}">
            <input type="text" value="${section.name.replace(
    SUFFIX_FEE,
    ''
  )}" readonly> 
            <button class="btn ${CLASSES.DELETE_SECTION_BTN
    }" data-section-id="${section.id}">削除</button>
        </h2>
        <div id="${section.id
    }-participants-list" class="participant-checklist"></div>
        <button class="btn ${CLASSES.ADD_PARTICIPANT_GLOBAL_BTN
    }">参加者を追加</button>
        <p class="section-summary">合計人数: <span class="participant-count" data-section="${section.id
    }">0</span></p>
        <div class="table-container" id="${section.id}-table-container"></div>
    `;

  const tableContainer = sectionElement.querySelector(
    `#${section.id}-table-container`
  );
  tableContainer.appendChild(
    createGenericTableElement(`${section.id}-calculation-table`, [
      HEADER_PARTICIPANT,
      section.name,
      HEADER_TOTAL_PAYMENT,
      HEADER_PER_PERSON,
      HEADER_BALANCE,
    ])
  );

  return sectionElement;
}

export function renderDynamicSections(
  dynamicSections,
  participantInputValues,
  participantsList
) {
  const container = document.getElementById(IDS.DYNAMIC_SECTIONS_CONTAINER);
  if (!container) return;

  const sectionsToRemove = new Set(
    Array.from(container.children).map((child) => child.id)
  );

  dynamicSections.forEach((section) => {
    sectionsToRemove.delete(section.id);
    let sectionElement = document.getElementById(section.id);
    if (!sectionElement) {
      sectionElement = createDynamicSectionElement(section);
      container.appendChild(sectionElement);
    }

    const checklistContainer = sectionElement.querySelector(
      '.participant-checklist'
    );
    const checkKey = `${section.id}_checked`;
    renderParticipantChecklist(
      checklistContainer,
      checkKey,
      participantInputValues,
      participantsList
    );
  });

  sectionsToRemove.forEach((sectionId) => {
    document.getElementById(sectionId)?.remove();
  });
}

function displayErrorMessage(message) {
  const errorMessageElement = document.getElementById(IDS.ERROR_MESSAGE);
  if (errorMessageElement) {
    errorMessageElement.textContent = `エラー: ${message}`;
    errorMessageElement.style.display = 'block';
    setTimeout(() => {
      errorMessageElement.style.display = 'none';
    }, 5000);
  } else {
    console.error(`Error element not found. Message: ${message}`);
  }
}

export function setupDynamicSectionEventListeners() {
  const mainContent = document.querySelector(`.${CLASSES.MAIN_CONTENT}`);
  if (!mainContent) return;

  mainContent.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest(`.${CLASSES.DELETE_SECTION_BTN}`);
    if (deleteBtn) {
      const sectionId = deleteBtn.dataset.sectionId;
      if (sectionId && confirm('このテーブルを削除しますか？')) {
        dispatch({
          type: ACTIONS.DELETE_DYNAMIC_SECTION,
          payload: { sectionId },
        });
      }
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.id === IDS.ADD_NEW_SECTION_BTN) {
      const rawSectionName = prompt(
        '新しいテーブルの名前を入力してください:',
        '例：タープ代'
      );
      if (rawSectionName) {
        const invalidCharsRegex = /[\\/?%*:|"<>. ]/;
        if (invalidCharsRegex.test(rawSectionName)) {
          displayErrorMessage('テーブル名に無効な文字が含まれています。');
          return;
        }
        dispatch({
          type: ACTIONS.ADD_DYNAMIC_SECTION,
          payload: { rawSectionName },
        });
      }
    }
  });
}
