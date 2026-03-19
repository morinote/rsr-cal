import {
  PARTICIPANT_FEE,
  PARTICIPANT_BEER_SERVER,
  PARTICIPANT_FOOD,
  INPUT_WIDTH_PADDING,
  IDS,
  CLASSES,
} from './constants.js';
import { isInitialParticipant } from './config.js';
import { dispatch, ACTIONS } from './state.js';
import { renderTables } from './components/table.js';
import { renderParticipants } from './components/participant.js';
import { renderDynamicSections } from './components/dynamicSection.js';
import { calculateAndDispatch } from './calculation.js';

// --- Main Render Function ---

/**
 * Renders the entire application based on the provided state.
 * @param {object} state - The current application state.
 */
export function renderApp(state) {
  if (!state) return;
  const { participants, participantInputValues, ticketPrices, dynamicSections } =
    state;

  // Render components based on the current state
  renderParticipants(participantInputValues, participants);
  updatePricingTableUI(ticketPrices);
  renderDynamicSections(dynamicSections, participantInputValues, participants);
  renderTables(state);
  adjustAllInputWidths();

  // After rendering, trigger the calculation and dispatch the results.
  // This will cause another render cycle with the new calculation data.
  // A check can be added here later to prevent re-calculation if inputs haven't changed.
  calculateAndDispatch(state);
}

// --- Rendering Logic (Driven by state) ---

function updatePricingTableUI(ticketPrices) {
  document
    .querySelectorAll(`.${CLASSES.TICKET_PRICE_INPUT}`)
    .forEach((input) => {
      const type = input.dataset.ticketType;
      if (
        ticketPrices[type] !== undefined &&
        document.activeElement !== input
      ) {
        input.value = ticketPrices[type];
      }
    });
}

// --- Helper Functions ---

function adjustInputWidth(inputElement) {
  if (!inputElement) return;
  const value = inputElement.value || inputElement.placeholder || '';
  const newWidth = `calc(${value.length}ch + ${INPUT_WIDTH_PADDING})`;
  inputElement.style.width = newWidth;
}

function adjustAllInputWidths() {
  document
    .querySelectorAll(
      `.${CLASSES.FORM_INPUT_NUMERIC}, .${CLASSES.DYNAMIC_SECTION_HEADER} input`
    )
    .forEach(adjustInputWidth);
}

// --- Event Listeners ---

export function setupEventListeners() {
  const mainContent = document.querySelector(`.${CLASSES.MAIN_CONTENT}`);
  if (!mainContent) return;

  mainContent.addEventListener('change', (event) => {
    const target = event.target;
    if (target.matches(`.${CLASSES.PARTICIPANT_CHECKBOX}`)) {
      const participant = target.value;
      const key = target.dataset.key;
      const isChecked = target.checked;
      dispatch({
        type: ACTIONS.SET_PARTICIPANT_CHECKED,
        payload: { participant, key, isChecked },
      });
    }
  });

  mainContent.addEventListener(
    'blur',
    (event) => {
      const target = event.target;
      if (target.matches(`input[type="number"].${CLASSES.FORM_INPUT}`)) {
        if (target.value === '') target.value = '0';

        const participant =
          target.closest('[data-participant]')?.dataset.participant;
        let key;

        if (target.classList.contains(CLASSES.TICKET_PRICE_INPUT)) {
          dispatch({
            type: ACTIONS.UPDATE_TICKET_PRICE,
            payload: { type: target.dataset.ticketType, price: target.value },
          });
          return;
        }
        if (target.classList.contains(CLASSES.TICKET_QUANTITY_INPUT))
          key = target.dataset.ticketType;
        else if (target.classList.contains(CLASSES.FEE_INPUT))
          key = PARTICIPANT_FEE;
        else if (target.classList.contains(CLASSES.BEER_SERVER_INPUT))
          key = PARTICIPANT_BEER_SERVER;
        else if (target.classList.contains(CLASSES.FOOD_INPUT))
          key = PARTICIPANT_FOOD;
        else if (target.classList.contains(CLASSES.DYNAMIC_SECTION_INPUT))
          key = target.dataset.sectionName;

        if (participant && key) {
          dispatch({
            type: ACTIONS.UPDATE_PARTICIPANT_VALUE,
            payload: { participant, key, value: target.value },
          });
        }
      }
    },
    true
  );

  mainContent.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains(CLASSES.ADD_PARTICIPANT_GLOBAL_BTN)) {
      const name = prompt('追加する参加者の名前を入力してください:');
      if (name && name.trim()) {
        dispatch({
          type: ACTIONS.ADD_PARTICIPANT,
          payload: { name: name.trim() },
        });
      }
    }

    if (target.classList.contains(CLASSES.DELETE_PARTICIPANT_BTN)) {
      event.preventDefault();
      event.stopPropagation();
      const label = target.closest(`.${CLASSES.PARTICIPANT_CHECKLIST_LABEL}`);
      const name = label.querySelector('input').value;

      if (isInitialParticipant(name)) {
        alert('初期メンバーは削除できません。');
        return;
      }

      if (name && confirm(`「${name}」を削除してもよろしいですか？`)) {
        dispatch({
          type: ACTIONS.DELETE_PARTICIPANT,
          payload: { name },
        });
      }
    }
  });

  // Toggle wrap view for the summary table
  const toggleBtn = document.getElementById(IDS.TOGGLE_SUMMARY_VIEW_BTN);
  const summaryContainer = document.getElementById(IDS.SUMMARY_TABLE_CONTAINER);
  if (toggleBtn && summaryContainer) {
    toggleBtn.addEventListener('click', () => {
      const isWrapped = summaryContainer.classList.toggle(CLASSES.TABLE_CONTAINER_WRAP);
      toggleBtn.textContent = isWrapped ? '横スクロール表示に切り替え' : '折り返し表示に切り替え';
    });
  }
}
