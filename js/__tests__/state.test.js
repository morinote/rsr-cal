import {
  getState,
  subscribe,
  loadData,
  dispatch,
  ACTIONS,
  getLastCalculationInputs,
} from '../state.js';
// config.js is implicitly mocked by the jest.mock call below
import {
  TICKET_TYPE_TENT,
  TICKET_TYPE_PARKING,
  SUFFIX_FEE,
} from '../constants.js';

// Mock config to control participants list.
// This mock will be used for all tests in this file.
jest.mock('../config.js', () => ({
  participants: ['Alice', 'Bob'],
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('state.js', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Re-initialize state before each test by calling loadData,
    // which now also resets the non-persistent parts of the state.
    loadData();
    // Clear mock function calls after initialization
    localStorageMock.setItem.mockClear();
  });

  describe('initial state via loadData', () => {
    it('should initialize with default values for participants from mocked config', () => {
      const state = getState();
      expect(state.participantInputValues.Alice).toBeDefined();
      expect(state.participantInputValues.Bob).toBeDefined();
      expect(state.participantInputValues.Alice[TICKET_TYPE_TENT]).toBe(0);
      expect(state.ticketPrices).toEqual({});
      expect(state.dynamicSections).toEqual([]);
      expect(state.calculationResults).toEqual({});
      expect(getLastCalculationInputs()).toBeNull();
    });
  });

  describe('dispatch and reducers', () => {
    it('should update participant checked status on SET_PARTICIPANT_CHECKED', () => {
      dispatch({
        type: ACTIONS.SET_PARTICIPANT_CHECKED,
        payload: { participant: 'Alice', key: 'main_checked', isChecked: false },
      });
      const state = getState();
      expect(state.participantInputValues.Alice.main_checked).toBe(false);
      // Check if data was saved
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'participantInputValues',
        expect.any(String)
      );
    });

    it('should update participant value on UPDATE_PARTICIPANT_VALUE', () => {
      dispatch({
        type: ACTIONS.UPDATE_PARTICIPANT_VALUE,
        payload: { participant: 'Bob', key: TICKET_TYPE_TENT, value: '2' },
      });
      const state = getState();
      expect(state.participantInputValues.Bob[TICKET_TYPE_TENT]).toBe(2);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'participantInputValues',
        expect.any(String)
      );
    });

    it('should update ticket price on UPDATE_TICKET_PRICE', () => {
      dispatch({
        type: ACTIONS.UPDATE_TICKET_PRICE,
        payload: { type: TICKET_TYPE_PARKING, price: '1500' },
      });
      const state = getState();
      expect(state.ticketPrices[TICKET_TYPE_PARKING]).toBe(1500);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ticketPrices',
        expect.any(String)
      );
    });

    it('should add a new dynamic section on ADD_DYNAMIC_SECTION', () => {
      dispatch({
        type: ACTIONS.ADD_DYNAMIC_SECTION,
        payload: { rawSectionName: 'ギア代' },
      });
      const state = getState();
      const sectionName = `ギア代${SUFFIX_FEE}`;
      const section = state.dynamicSections.find(
        (s) => s.name === sectionName
      );
      expect(section).toBeDefined();
      expect(state.participantInputValues.Alice[sectionName]).toBe(0);
      expect(
        state.participantInputValues.Alice[`${section.id}_checked`]
      ).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dynamicSections',
        expect.any(String)
      );
    });

    it('should delete a dynamic section on DELETE_DYNAMIC_SECTION', () => {
      // First, add a section
      dispatch({
        type: ACTIONS.ADD_DYNAMIC_SECTION,
        payload: { rawSectionName: '交通費' },
      });
      const sectionName = `交通費${SUFFIX_FEE}`;
      const sectionId = getState().dynamicSections[0].id;
      localStorageMock.setItem.mockClear(); // Clear mocks for the next action

      // Then, delete it
      dispatch({
        type: ACTIONS.DELETE_DYNAMIC_SECTION,
        payload: { sectionId },
      });

      const state = getState();
      expect(state.dynamicSections.length).toBe(0);
      expect(state.participantInputValues.Alice[sectionName]).toBeUndefined();
      expect(
        state.participantInputValues.Alice[`${sectionId}_checked`]
      ).toBeUndefined();
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dynamicSections',
        '[]'
      );
    });

    it('should update calculation results on UPDATE_CALCULATION_RESULTS without saving to localStorage', () => {
      const mockResults = { calculationResults: { Alice: { balance: 100 } } };
      const mockInputsJSON = '{"mock": "inputs"}';
      dispatch({
        type: ACTIONS.UPDATE_CALCULATION_RESULTS,
        payload: { results: mockResults, inputsJSON: mockInputsJSON },
      });

      const state = getState();
      expect(state.calculationResults).toEqual(mockResults);
      expect(getLastCalculationInputs()).toBe(mockInputsJSON);
      // Data should not be persisted for this action
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should notify a subscriber when state changes', () => {
      const mockCallback = jest.fn();
      const unsubscribe = subscribe(mockCallback);

      dispatch({
        type: ACTIONS.UPDATE_TICKET_PRICE,
        payload: { type: TICKET_TYPE_PARKING, price: '500' },
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
      const newState = mockCallback.mock.calls[0][0];
      expect(newState.ticketPrices[TICKET_TYPE_PARKING]).toBe(500);

      // Test unsubscribe
      unsubscribe();
      dispatch({
        type: ACTIONS.UPDATE_TICKET_PRICE,
        payload: { type: TICKET_TYPE_PARKING, price: '1000' },
      });
      expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });
});