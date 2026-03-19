import { INITIAL_PARTICIPANTS } from './config.js';
import {
  PARTICIPANT_CHECK_MAIN,
  PARTICIPANT_CHECK_BEER_SERVER,
  PARTICIPANT_CHECK_FOOD,
  TICKET_TYPE_TENT,
  TICKET_TYPE_PARKING,
  PARTICIPANT_FEE,
  PARTICIPANT_BEER_SERVER,
  PARTICIPANT_FOOD,
  SUFFIX_FEE,
} from './constants.js';

// --- Private State ---

let participants = [...INITIAL_PARTICIPANTS];
let participantInputValues = {};
let ticketPrices = {};
let dynamicSections = [];
let calculationResults = {};
let lastCalculationInputs = null;
let subscribers = [];

// --- Private Functions ---

function notifySubscribers() {
  const state = getState();
  subscribers.forEach((callback) => callback(state));
}

function saveData() {
  localStorage.setItem('participants', JSON.stringify(participants));
  localStorage.setItem(
    'participantInputValues',
    JSON.stringify(participantInputValues)
  );
  localStorage.setItem('ticketPrices', JSON.stringify(ticketPrices));
  localStorage.setItem('dynamicSections', JSON.stringify(dynamicSections));
}

function initializeParticipantDefaults(participant) {
  participantInputValues[participant] = {
    [TICKET_TYPE_TENT]: 0,
    [TICKET_TYPE_PARKING]: 0,
    [PARTICIPANT_FEE]: 0,
    [PARTICIPANT_BEER_SERVER]: 0,
    [PARTICIPANT_CHECK_BEER_SERVER]: true,
    [PARTICIPANT_FOOD]: 0,
    [PARTICIPANT_CHECK_FOOD]: true,
    [PARTICIPANT_CHECK_MAIN]: true,
  };
  // Also initialize for existing dynamic sections
  dynamicSections.forEach((sec) => {
    const checkKey = `${sec.id}_checked`;
    participantInputValues[participant][sec.name] = 0;
    participantInputValues[participant][checkKey] = true;
  });
}

function initializeAllParticipants() {
  participants.forEach(initializeParticipantDefaults);
}

// --- Public API ---

export function getState() {
  return JSON.parse(
    JSON.stringify({
      participants,
      participantInputValues,
      ticketPrices,
      dynamicSections,
      calculationResults,
    })
  );
}

export function getLastCalculationInputs() {
  return lastCalculationInputs;
}

export function subscribe(callback) {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter((sub) => sub !== callback);
  };
}

export function loadData() {
  // 0. Load participants list first
  const savedParticipants = localStorage.getItem('participants');
  if (savedParticipants) {
    try {
      const parsed = JSON.parse(savedParticipants);
      if (Array.isArray(parsed)) {
        participants = parsed;
      }
    } catch (e) {
      console.error('Error parsing participants from localStorage:', e);
    }
  }

  // 1. Load and validate participantInputValues
  const savedParticipantInputValues = localStorage.getItem(
    'participantInputValues'
  );
  if (savedParticipantInputValues) {
    try {
      const parsedData = JSON.parse(savedParticipantInputValues);
      if (typeof parsedData === 'object' && parsedData !== null) {
        participantInputValues = parsedData;
        participants.forEach((participant) => {
          const pData = participantInputValues[participant];
          if (pData) {
            [
              TICKET_TYPE_TENT,
              TICKET_TYPE_PARKING,
              PARTICIPANT_FEE,
              PARTICIPANT_BEER_SERVER,
              PARTICIPANT_FOOD,
            ].forEach((prop) => {
              if (pData[prop] === undefined || isNaN(pData[prop]))
                pData[prop] = 0;
            });
            [
              PARTICIPANT_CHECK_MAIN,
              PARTICIPANT_CHECK_BEER_SERVER,
              PARTICIPANT_CHECK_FOOD,
            ].forEach((prop) => {
              if (pData[prop] === undefined) pData[prop] = true;
            });

            // Ensure dynamic section keys exist for loaded data
            dynamicSections.forEach((sec) => {
              if (pData[sec.name] === undefined) {
                pData[sec.name] = 0;
              }
              const checkKey = `${sec.id}_checked`;
              if (pData[checkKey] === undefined) {
                pData[checkKey] = true;
              }
            });
          } else {
            initializeParticipantDefaults(participant);
          }
        });
      } else {
        initializeAllParticipants();
      }
    } catch (e) {
      console.error(
        'Error parsing participantInputValues from localStorage:',
        e
      );
      initializeAllParticipants();
    }
  } else {
    initializeAllParticipants();
  }

  // 2. Load and validate ticketPrices
  const savedTicketPrices = localStorage.getItem('ticketPrices');
  if (savedTicketPrices) {
    try {
      const parsedPrices = JSON.parse(savedTicketPrices);
      if (typeof parsedPrices === 'object' && parsedPrices !== null) {
        [TICKET_TYPE_TENT, TICKET_TYPE_PARKING].forEach((type) => {
          parsedPrices[type] = parseFloat(parsedPrices[type]) || 0;
        });
        ticketPrices = parsedPrices;
      }
    } catch (e) {
      console.error('Error parsing ticketPrices from localStorage:', e);
    }
  }

  // 3. Load dynamicSections
  const savedDynamicSections = localStorage.getItem('dynamicSections');
  if (savedDynamicSections) {
    try {
      const parsedSections = JSON.parse(savedDynamicSections);
      if (Array.isArray(parsedSections)) {
        dynamicSections = parsedSections;
      }
    } catch (e) {
      console.error('Error parsing dynamicSections from localStorage:', e);
      dynamicSections = [];
    }
  } else {
    dynamicSections = [];
  }
  // calculationResultsを初期化
  calculationResults = {};
  lastCalculationInputs = null;

  // 4. Notify all subscribers once all data is loaded
  notifySubscribers();
}

// --- Actions ---
export const ACTIONS = {
  SET_PARTICIPANT_CHECKED: 'SET_PARTICIPANT_CHECKED',
  UPDATE_TICKET_PRICE: 'UPDATE_TICKET_PRICE',
  UPDATE_PARTICIPANT_VALUE: 'UPDATE_PARTICIPANT_VALUE',
  ADD_DYNAMIC_SECTION: 'ADD_DYNAMIC_SECTION',
  DELETE_DYNAMIC_SECTION: 'DELETE_DYNAMIC_SECTION',
  UPDATE_CALCULATION_RESULTS: 'UPDATE_CALCULATION_RESULTS',
  ADD_PARTICIPANT: 'ADD_PARTICIPANT',
  DELETE_PARTICIPANT: 'DELETE_PARTICIPANT',
};

function reducer(action) {
  switch (action.type) {
    case ACTIONS.SET_PARTICIPANT_CHECKED: {
      const { participant, key, isChecked } = action.payload;
      if (
        participantInputValues[participant] &&
        participantInputValues[participant][key] !== isChecked
      ) {
        participantInputValues[participant][key] = !!isChecked;
        return true;
      }
      return false;
    }
    case ACTIONS.UPDATE_PARTICIPANT_VALUE: {
      const { participant, key, value } = action.payload;
      if (
        participantInputValues[participant] &&
        participantInputValues[participant][key] !== value
      ) {
        const numericValue = Number(value);
        participantInputValues[participant][key] = isNaN(numericValue)
          ? 0
          : numericValue;
        return true;
      }
      return false;
    }
    case ACTIONS.UPDATE_TICKET_PRICE: {
      const { type, price } = action.payload;
      if (ticketPrices[type] !== price) {
        ticketPrices[type] = parseFloat(price) || 0;
        return true;
      }
      return false;
    }
    case ACTIONS.ADD_DYNAMIC_SECTION: {
      const { rawSectionName } = action.payload;
      const sectionName = rawSectionName.endsWith(SUFFIX_FEE)
        ? rawSectionName
        : rawSectionName + SUFFIX_FEE;
      if (dynamicSections.some((sec) => sec.name === sectionName)) {
        console.warn(`Section "${sectionName}" already exists.`);
        return false;
      }

      const newSection = {
        id: `dynamic-section-${Date.now()}`,
        name: sectionName,
      };
      dynamicSections.push(newSection);

      participants.forEach((p) => {
        if (participantInputValues[p]) {
          participantInputValues[p][sectionName] = 0;
          participantInputValues[p][`${newSection.id}_checked`] = true;
        }
      });
      return true;
    }
    case ACTIONS.DELETE_DYNAMIC_SECTION: {
      const { sectionId } = action.payload;
      const sectionIndex = dynamicSections.findIndex(
        (sec) => sec.id === sectionId
      );
      if (sectionIndex === -1) {
        console.warn(`Section with id "${sectionId}" not found for deletion.`);
        return false;
      }

      const sectionToRemove = dynamicSections[sectionIndex];
      const sectionName = sectionToRemove.name;
      const checkKey = `${sectionToRemove.id}_checked`;

      // 1. Remove section from dynamicSections array
      dynamicSections.splice(sectionIndex, 1);

      // 2. Remove related values from participantInputValues
      Object.values(participantInputValues).forEach((pData) => {
        delete pData[sectionName];
        delete pData[checkKey];
      });
      return true;
    }
    case ACTIONS.UPDATE_CALCULATION_RESULTS: {
      const { results, inputsJSON } = action.payload;
      calculationResults = results;
      lastCalculationInputs = inputsJSON;
      return true;
    }
    case ACTIONS.ADD_PARTICIPANT: {
      const { name } = action.payload;
      if (!name || participants.includes(name)) return false;

      participants.push(name);
      initializeParticipantDefaults(name);
      return true;
    }
    case ACTIONS.DELETE_PARTICIPANT: {
      const { name } = action.payload;
      const index = participants.indexOf(name);
      if (index === -1) return false;

      // 1. Remove from participants array
      participants.splice(index, 1);

      // 2. Remove from participantInputValues
      delete participantInputValues[name];

      // 3. Remove from calculationResults
      delete calculationResults[name];

      return true;
    }
    default:
      return false;
  }
}

export function dispatch(action) {
  const stateChanged = reducer(action);
  if (stateChanged && action.type !== ACTIONS.UPDATE_CALCULATION_RESULTS) {
    saveData();
  }
  if (stateChanged) {
    notifySubscribers();
  }
}
