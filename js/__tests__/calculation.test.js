import {
  performCalculations,
  calculateAndDispatch,
} from '../calculation.js';
import * as state from '../state.js'; // Import all of state to mock it

// Mock state module
jest.mock('../state.js', () => ({
  ...jest.requireActual('../state.js'), // Import and retain default behavior
  dispatch: jest.fn(), // Mock the dispatch function
  getLastCalculationInputs: jest.fn(), // Mock the getter
}));

describe('calculation.js', () => {
  // Clear mocks before each test
  beforeEach(() => {
    state.dispatch.mockClear();
    state.getLastCalculationInputs.mockClear();
  });

  describe('performCalculations', () => {
    const baseInputs = {
      selectedParticipants: ['Alice', 'Bob'],
      selectedBeerServerParticipants: [],
      selectedFoodParticipants: [],
      dynamicSections: [],
      currentTicketPrices: {
        テント券: 1000,
        駐車券: 500,
      },
      participantData: {
        Alice: { テント券: 1, 駐車券: 0, 手数料: 100, 'ビアサーバー': 0, '食材': 0 },
        Bob: { テント券: 0, 駐車券: 1, 手数料: 0, 'ビアサーバー': 0, '食材': 0 },
      },
    };

    test('should correctly calculate expenses and balances for a simple case', () => {
      const inputs = JSON.parse(JSON.stringify(baseInputs));
      const results = performCalculations(inputs);

      expect(results.totalTentTickets).toBe(1);
      expect(results.totalParkingTickets).toBe(1);
      expect(results.totalCommission).toBe(100);
      expect(results.calculationResults['Alice'].totalPayment).toBe(1100);
      expect(results.calculationResults['Bob'].totalPayment).toBe(500);

      const expectedPerPersonExpense = (1100 + 500) / 2;
      expect(results.perPersonExpense).toBe(expectedPerPersonExpense);
      expect(results.calculationResults['Alice'].balance).toBeCloseTo(
        1100 - expectedPerPersonExpense
      );
      expect(results.calculationResults['Bob'].balance).toBeCloseTo(
        500 - expectedPerPersonExpense
      );
    });

    test('should handle beer server and food costs', () => {
      const inputs = JSON.parse(JSON.stringify(baseInputs));
      inputs.selectedBeerServerParticipants = ['Alice'];
      inputs.selectedFoodParticipants = ['Alice', 'Bob'];
      inputs.participantData.Alice['ビアサーバー'] = 2000;
      inputs.participantData.Alice['食材'] = 500;
      inputs.participantData.Bob['食材'] = 1500;

      const results = performCalculations(inputs);

      // Beer calculations
      expect(results.perPersonBeerServerExpense).toBe(2000);
      expect(results.calculationResults['Alice'].beerServerPayment).toBe(2000);
      expect(results.calculationResults['Alice'].beerBalance).toBe(0);
      expect(results.calculationResults['Bob'].beerBalance).toBe(0); // Bob didn't participate

      // Food calculations
      expect(results.perPersonFoodExpense).toBe((500 + 1500) / 2);
      expect(results.calculationResults['Alice'].foodPayment).toBe(500);
      expect(results.calculationResults['Bob'].foodPayment).toBe(1500);
      expect(results.calculationResults['Alice'].foodBalance).toBeCloseTo(
        500 - 1000
      );
      expect(results.calculationResults['Bob'].foodBalance).toBeCloseTo(
        1500 - 1000
      );

      // Total balance
      const totalBalanceAlice =
        results.calculationResults['Alice'].balance +
        results.calculationResults['Alice'].beerBalance +
        results.calculationResults['Alice'].foodBalance;
      expect(results.calculationResults['Alice'].totalBalance).toBeCloseTo(
        totalBalanceAlice
      );
    });

    test('should handle dynamic sections correctly', () => {
      const inputs = JSON.parse(JSON.stringify(baseInputs));
      inputs.dynamicSections = [
        { id: 'dyn1', name: 'ガソリン代', participants: ['Alice', 'Bob'] },
      ];
      inputs.participantData.Alice['ガソリン代'] = 3000;
      inputs.participantData.Bob['ガソリン代'] = 0;

      const results = performCalculations(inputs);

      expect(results.dynamicSectionTotals['ガソリン代'].total).toBe(3000);
      expect(results.dynamicSectionTotals['ガソリン代'].perPerson).toBe(1500);
      expect(
        results.calculationResults['Alice']['ガソリン代_payment']
      ).toBe(3000);
      expect(
        results.calculationResults['Alice']['ガソリン代_balance']
      ).toBe(1500);
      expect(
        results.calculationResults['Bob']['ガソリン代_payment']
      ).toBe(0);
      expect(results.calculationResults['Bob']['ガソリン代_balance']).toBe(-1500);
    });

    test('should return zero for all per-person costs if no participants', () => {
      const inputs = {
        selectedParticipants: [],
        selectedBeerServerParticipants: [],
        selectedFoodParticipants: [],
        dynamicSections: [
          { id: 'dyn1', name: 'ガソリン代', participants: [] },
        ],
        currentTicketPrices: {},
        participantData: {},
      };
      const results = performCalculations(inputs);
      expect(results.perPersonExpense).toBe(0);
      expect(results.perPersonBeerServerExpense).toBe(0);
      expect(results.perPersonFoodExpense).toBe(0);
      expect(results.dynamicSectionTotals['ガソリン代'].perPerson).toBe(0);
    });
  });

  describe('calculateAndDispatch', () => {
    const mockState = {
      participantInputValues: {
        Alice: { main_checked: true, テント券: 1 },
        Bob: { main_checked: true, テント券: 1 },
      },
      ticketPrices: { テント券: 1000 },
      dynamicSections: [],
    };

    test('should call dispatch with calculation results if inputs have changed', () => {
      // Mock that the last calculation was different
      state.getLastCalculationInputs.mockReturnValue('{}');

      calculateAndDispatch(mockState);

      expect(state.dispatch).toHaveBeenCalledTimes(1);
      const dispatchArg = state.dispatch.mock.calls[0][0];
      expect(dispatchArg.type).toBe(state.ACTIONS.UPDATE_CALCULATION_RESULTS);
      expect(dispatchArg.payload.results).toBeDefined();
      expect(dispatchArg.payload.results.perPersonExpense).toBe(1000);
      expect(dispatchArg.payload.inputsJSON).toBeDefined();
    });

    test('should NOT call dispatch if inputs have not changed', () => {
      // Mock that the last calculation was the same as the current one
      const inputs = {
        selectedParticipants: ['Alice', 'Bob'],
        selectedBeerServerParticipants: [],
        selectedFoodParticipants: [],
        dynamicSections: [],
        currentTicketPrices: { テント券: 1000 },
        participantData: {
          Alice: { main_checked: true, テント券: 1 },
          Bob: { main_checked: true, テント券: 1 },
        },
      };
      const inputsJSON = JSON.stringify(inputs);
      state.getLastCalculationInputs.mockReturnValue(inputsJSON);

      calculateAndDispatch(mockState);

      expect(state.dispatch).not.toHaveBeenCalled();
    });
  });
});