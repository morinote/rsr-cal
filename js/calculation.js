import { dispatch, ACTIONS, getLastCalculationInputs } from './state.js';
import {
  PARTICIPANT_CHECK_MAIN,
  PARTICIPANT_CHECK_BEER_SERVER,
  PARTICIPANT_CHECK_FOOD,
} from './constants.js';

/**
 * Prepares the input object for `performCalculations` from the global state.
 * @param {object} state - The current application state.
 * @returns {object} An object structured for the `performCalculations` function.
 */
function getInputsForCalculation(state) {
  const { participants, participantInputValues, ticketPrices, dynamicSections } =
    state;

  const selectedParticipants = participants.filter(
    (p) => participantInputValues[p]?.[PARTICIPANT_CHECK_MAIN]
  );
  const selectedBeerServerParticipants = participants.filter(
    (p) => participantInputValues[p]?.[PARTICIPANT_CHECK_BEER_SERVER]
  );
  const selectedFoodParticipants = participants.filter(
    (p) => participantInputValues[p]?.[PARTICIPANT_CHECK_FOOD]
  );

  const dynamicSectionsData = dynamicSections.map((sec) => {
    const checkKey = `${sec.id}_checked`;
    const sectionParticipants = participants.filter(
      (p) => participantInputValues[p]?.[checkKey] !== false
    );
    return {
      id: sec.id,
      name: sec.name,
      participants: sectionParticipants,
    };
  });

  return {
    selectedParticipants,
    selectedBeerServerParticipants,
    selectedFoodParticipants,
    dynamicSections: dynamicSectionsData,
    currentTicketPrices: ticketPrices,
    participantData: participantInputValues,
  };
}

/**
 * Triggers the calculation based on the current state and dispatches the results to the state store.
 * @param {object} state - The current application state.
 */
export function calculateAndDispatch(state) {
  try {
    const inputs = getInputsForCalculation(state);
    const inputsJSON = JSON.stringify(inputs);

    if (inputsJSON === getLastCalculationInputs()) return;

    const results = performCalculations(inputs);
    dispatch({
      type: ACTIONS.UPDATE_CALCULATION_RESULTS,
      payload: { results, inputsJSON },
    });
  } catch (error) {
    console.error('Calculation and dispatch failed:', error);
  }
}

/**
 * Performs all necessary calculations based on the gathered input data.
 * Calculates total expenses, per-person expenses, and individual balances.
 * @param {object} inputs - An object containing all input data, typically from `getInputs()`.
 * @param {string[]} inputs.selectedParticipants - Array of selected main participants.
 * @param {string[]} inputs.selectedBeerServerParticipants - Array of selected beer server participants.
 * @param {string[]} inputs.selectedFoodParticipants - Array of selected food participants.
 * @param {object[]} inputs.dynamicSections - Array of dynamic section data (id, name, participants).
 * @param {object} inputs.currentTicketPrices - Object mapping ticket types to their prices.
 * @param {object} inputs.participantData - Object mapping participant names to their input values.
 * @returns {object} An object containing:
 *   - calculationResults {object} - Object mapping participant names to their payment, balance, and total balance.
 *   - perPersonExpense {number} - Average expense per main participant.
 *   - perPersonBeerServerExpense {number} - Average beer server expense per beer server participant.
 *   - perPersonFoodExpense {number} - Average food expense per food participant.
 *   - dynamicSectionTotals {object} - Object mapping dynamic section names to their total and per-person costs.
 *   - totalTentTickets {number} - Total quantity of tent tickets.
 *   - totalParkingTickets {number} - Total quantity of parking tickets.
 *   - totalCommission {number} - Total commission.
 *   - dynamicSections {object[]} - Array of dynamic section data (same as input).
 */
export function performCalculations(inputs) {
  try {
    const {
      selectedParticipants,
      selectedBeerServerParticipants,
      selectedFoodParticipants,
      dynamicSections,
      currentTicketPrices,
      participantData,
    } = inputs;
    let totalTentTickets = 0,
      totalParkingTickets = 0,
      totalCommission = 0,
      totalExpense = 0,
      totalBeerServerExpense = 0,
      totalFoodExpense = 0;
    const calculationResults = {};
    const dynamicSectionTotals = {};

    const allParticipantsInTables = new Set([
      ...selectedParticipants,
      ...selectedBeerServerParticipants,
      ...selectedFoodParticipants,
    ]);
    dynamicSections.forEach((sec) => {
      sec.participants.forEach((p) => allParticipantsInTables.add(p));
      dynamicSectionTotals[sec.name] = { total: 0, perPerson: 0 };
    });

    allParticipantsInTables.forEach((p) => {
      calculationResults[p] = {
        totalPayment: 0,
        beerServerPayment: 0,
        foodPayment: 0,
        balance: 0,
        beerBalance: 0,
        foodBalance: 0,
      };
      dynamicSections.forEach((sec) => {
        calculationResults[p][`${sec.name}_payment`] = 0;
        calculationResults[p][`${sec.name}_balance`] = 0;
      });
    });

    // 静的セクションの計算
    selectedParticipants.forEach((p) => {
      const tentVal = participantData[p]['テント券'],
        parkingVal = participantData[p]['駐車券'],
        fee = participantData[p]['手数料'];
      totalTentTickets += tentVal;
      totalParkingTickets += parkingVal;
      totalCommission += fee;
      const totalPayment =
        tentVal * currentTicketPrices['テント券'] +
        parkingVal * currentTicketPrices['駐車券'] +
        fee;
      calculationResults[p].totalPayment = totalPayment;
      totalExpense += totalPayment;
    });

    selectedBeerServerParticipants.forEach((p) => {
      const beerServerCost = participantData[p]['ビアサーバー'];
      calculationResults[p].beerServerPayment = beerServerCost;
      totalBeerServerExpense += beerServerCost;
    });

    selectedFoodParticipants.forEach((p) => {
      const foodCost = participantData[p]['食材'];
      calculationResults[p].foodPayment = foodCost;
      totalFoodExpense += foodCost;
    });

    // 動的セクションの計算
    dynamicSections.forEach((sec) => {
      sec.participants.forEach((p) => {
        const cost = participantData[p][sec.name] || 0;
        calculationResults[p][`${sec.name}_payment`] = cost;
        dynamicSectionTotals[sec.name].total += cost;
      });
    });

    const perPersonExpense =
      selectedParticipants.length > 0
        ? totalExpense / selectedParticipants.length
        : 0;
    const perPersonBeerServerExpense =
      selectedBeerServerParticipants.length > 0
        ? totalBeerServerExpense / selectedBeerServerParticipants.length
        : 0;
    const perPersonFoodExpense =
      selectedFoodParticipants.length > 0
        ? totalFoodExpense / selectedFoodParticipants.length
        : 0;

    dynamicSections.forEach((sec) => {
      dynamicSectionTotals[sec.name].perPerson =
        sec.participants.length > 0
          ? dynamicSectionTotals[sec.name].total / sec.participants.length
          : 0;
    });

    // バランス計算
    allParticipantsInTables.forEach((p) => {
      let totalBalance = 0;
      if (selectedParticipants.includes(p)) {
        const balance = calculationResults[p].totalPayment - perPersonExpense;
        calculationResults[p].balance = balance;
        totalBalance += balance;
      }
      if (selectedBeerServerParticipants.includes(p)) {
        const beerBalance =
          calculationResults[p].beerServerPayment - perPersonBeerServerExpense;
        calculationResults[p].beerBalance = beerBalance;
        totalBalance += beerBalance;
      }
      if (selectedFoodParticipants.includes(p)) {
        const foodBalance =
          calculationResults[p].foodPayment - perPersonFoodExpense;
        calculationResults[p].foodBalance = foodBalance;
        totalBalance += foodBalance;
      }
      dynamicSections.forEach((sec) => {
        if (sec.participants.includes(p)) {
          const dynamicBalance =
            calculationResults[p][`${sec.name}_payment`] -
            dynamicSectionTotals[sec.name].perPerson;
          calculationResults[p][`${sec.name}_balance`] = dynamicBalance;
          totalBalance += dynamicBalance;
        }
      });
      calculationResults[p].totalBalance = totalBalance;
    });

    // Ensure totalBalance is correctly summed up before returning
    allParticipantsInTables.forEach((p) => {
      let finalBalance = 0;
      finalBalance += calculationResults[p].balance || 0;
      finalBalance += calculationResults[p].beerBalance || 0;
      finalBalance += calculationResults[p].foodBalance || 0;
      dynamicSections.forEach((sec) => {
        if (sec.participants.includes(p)) {
          finalBalance += calculationResults[p][`${sec.name}_balance`] || 0;
        }
      });
      calculationResults[p].totalBalance = finalBalance;
    });

    return {
      calculationResults,
      totalExpense,
      totalBeerServerExpense,
      totalFoodExpense,
      perPersonExpense,
      perPersonBeerServerExpense,
      perPersonFoodExpense,
      dynamicSectionTotals,
      totalTentTickets,
      totalParkingTickets,
      totalCommission,
      dynamicSections,
    };
  } catch (error) {
    console.error('計算ロジックでエラーが発生しました:', error);
    throw new Error('計算処理中に予期せぬエラーが発生しました。');
  }
}
