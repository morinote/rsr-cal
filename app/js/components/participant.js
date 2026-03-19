import { isInitialParticipant } from '../config.js';
import {
  IDS,
  CLASSES,
  PARTICIPANT_CHECK_MAIN,
  PARTICIPANT_CHECK_BEER_SERVER,
  PARTICIPANT_CHECK_FOOD,
} from '../constants.js';

/**
 * Renders a checklist of participants in a given container.
 * Adds labels for new participants, removes labels for deleted ones,
 * and updates the checked state for existing ones.
 *
 * @param {HTMLElement} container
 * @param {string} checkKey - State key for the checked boolean (e.g. 'mainチェック')
 * @param {object} participantInputValues
 * @param {string[]} participantsList
 */
export function renderParticipantChecklist(
  container,
  checkKey,
  participantInputValues,
  participantsList
) {
  if (!container) return;
  const template = document.getElementById(IDS.PARTICIPANT_TEMPLATE)?.content;
  if (!template) return;

  const listToRender = participantsList || [];

  // Remove labels for participants no longer in the list
  container.querySelectorAll(`.${CLASSES.PARTICIPANT_CHECKLIST_LABEL}`).forEach((label) => {
    if (!listToRender.includes(label.querySelector('input').value)) {
      label.remove();
    }
  });

  const fragment = document.createDocumentFragment();

  listToRender.forEach((participant) => {
    let label = container.querySelector(`[value="${participant}"]`)?.parentElement;

    // Create label from template if it doesn't exist yet
    if (!label) {
      const clone = document.importNode(template, true);
      label = clone.querySelector('label');
      label.querySelector('input').value = participant;
      label.querySelector('input').dataset.key = checkKey;
      label.querySelector(`.${CLASSES.PARTICIPANT_CHECKLIST_NAME}`).textContent = participant;
      fragment.appendChild(clone);
    }

    // Add delete button only for dynamically-added (non-initial) participants
    if (!isInitialParticipant(participant) && !label.querySelector(`.${CLASSES.DELETE_PARTICIPANT_BTN}`)) {
      const btn = document.createElement('span');
      btn.className = CLASSES.DELETE_PARTICIPANT_BTN;
      btn.title = '削除';
      btn.textContent = '×';
      label.appendChild(btn);
    }

    // Sync checked state
    const isChecked = participantInputValues[participant]?.[checkKey] !== false;
    label.querySelector('input').checked = isChecked;
    label.classList.toggle(CLASSES.PARTICIPANT_CHECKLIST_LABEL_CHECKED, isChecked);
  });

  if (fragment.children.length > 0) {
    container.appendChild(fragment);
  }
}

/**
 * Renders participant checklists for the three main sections.
 * @param {object} participantInputValues
 * @param {string[]} participantsList
 */
export function renderParticipants(participantInputValues, participantsList) {
  [
    [IDS.PARTICIPANTS_LIST, PARTICIPANT_CHECK_MAIN],
    [IDS.BEER_SERVER_PARTICIPANTS_LIST, PARTICIPANT_CHECK_BEER_SERVER],
    [IDS.FOOD_PARTICIPANTS_LIST, PARTICIPANT_CHECK_FOOD],
  ].forEach(([id, key]) => {
    renderParticipantChecklist(
      document.getElementById(id),
      key,
      participantInputValues,
      participantsList
    );
  });
}
