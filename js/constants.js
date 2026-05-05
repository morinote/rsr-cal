export const INPUT_WIDTH_PADDING = '4ch';

export const TICKET_TYPE_ALL = '通し券';
export const TICKET_TYPE_TENT = 'テント券';
export const TICKET_TYPE_PARKING = '駐車券';

export const HEADER_PARTICIPANT = '参加者';
export const HEADER_BEER_SERVER_FEE = 'ビアサーバー';
export const HEADER_TOTAL_PAYMENT = '支払合計';
export const HEADER_PER_PERSON = '一人当たり';
export const HEADER_BALANCE = '払う/貰う';
export const HEADER_TICKET = 'チケット';
export const HEADER_FOOD = '食材';
export const HEADER_FINAL_BALANCE = '最終収支';

export const PARTICIPANT_CHECK_MAIN = 'mainチェック';
export const PARTICIPANT_CHECK_BEER_SERVER = 'ビアサーバーチェック';
export const PARTICIPANT_CHECK_FOOD = '食材チェック';
export const PARTICIPANT_FEE = '手数料';
export const PARTICIPANT_BEER_SERVER = 'ビアサーバー';
export const PARTICIPANT_FOOD = '食材';

export const SUFFIX_FEE = '料金';

export const IDS = {
  // Containers
  CALCULATION_TABLE_CONTAINER: 'calculation-table-container',
  BEER_SERVER_TABLE_CONTAINER: 'beer-server-table-container',
  FOOD_TABLE_CONTAINER: 'food-table-container',
  DYNAMIC_SECTIONS_CONTAINER: 'dynamic-sections-container',
  SUMMARY_TABLE_CONTAINER: 'summary-table-container',

  // Lists
  PARTICIPANTS_LIST: 'participants-list',
  BEER_SERVER_PARTICIPANTS_LIST: 'beer-server-participants-list',
  FOOD_PARTICIPANTS_LIST: 'food-participants-list',

  // Tables
  PRICING_TABLE: 'pricing-table',
  CALCULATION_TABLE: 'calculation-table',
  BEER_SERVER_TABLE: 'beer-server-calculation-table',
  FOOD_TABLE: 'food-calculation-table',
  SUMMARY_TABLE: 'summary-table',

  // Buttons
  ADD_NEW_SECTION_BTN: 'add-new-table-section-btn',
  TOGGLE_SUMMARY_VIEW_BTN: 'toggle-summary-view-btn',

  // Templates
  PARTICIPANT_TEMPLATE: 'participant-template',
  CALCULATION_ROW_TEMPLATE: 'calculation-row-template',
  STANDARD_ROW_TEMPLATE: 'standard-row-template',

  // Misc
  ERROR_MESSAGE: 'error-message',
};

export const CLASSES = {
  // General
  MAIN_CONTENT: 'main-content',
  FORM_INPUT: 'form-input',
  FORM_INPUT_NUMERIC: 'form-input--numeric',
  PARTICIPANT_COUNT: 'participant-count',
  ADD_PARTICIPANT_GLOBAL_BTN: 'add-participant-global-btn',
  CONTENT_SECTION: 'content-section',
  ERROR_MESSAGE_FIELD: 'error-message--field',
  DYNAMIC_SECTION_HEADER: 'dynamic-section__header',

  // Participants
  PARTICIPANT_CHECKLIST_LABEL: 'participant-checklist__label',
  PARTICIPANT_CHECKLIST_LABEL_CHECKED: 'participant-checklist__label--checked',
  PARTICIPANT_CHECKBOX: 'participant-checklist__checkbox',
  PARTICIPANT_CHECKLIST_NAME: 'participant-checklist__name',
  DELETE_PARTICIPANT_BTN: 'btn-delete-participant',

  // Inputs
  TICKET_PRICE_INPUT: 'ticket-price',
  TICKET_QUANTITY_INPUT: 'ticket-quantity-input',
  FEE_INPUT: 'fee-input',
  BEER_SERVER_INPUT: 'beer-server-input',
  FOOD_INPUT: 'food-input',
  DYNAMIC_SECTION_INPUT: 'dynamic-section-input',

  // Buttons
  DELETE_SECTION_BTN: 'btn--delete-section',
  SAVE_IMAGE_BTN: 'btn--save-image',

  // Rows & Cells
  CALCULATION_HEADER_ROW: 'calculation-table__header-row',
  TOTAL_PAYMENT: 'total-payment',
  PER_PERSON_PAYMENT: 'per-person-payment',
  BALANCE: 'balance',
  BALANCE_POSITIVE: 'balance--positive',
  BALANCE_NEGATIVE: 'balance--negative',

  // Summary Table
  TABLE_CONTAINER_WRAP: 'table-container--wrap',
};
