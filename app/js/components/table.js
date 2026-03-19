import {
  TICKET_TYPE_TENT,
  TICKET_TYPE_PARKING,
  HEADER_PARTICIPANT,
  HEADER_BEER_SERVER_FEE,
  HEADER_TOTAL_PAYMENT,
  HEADER_PER_PERSON,
  HEADER_BALANCE,
  HEADER_TICKET,
  HEADER_FOOD,
  HEADER_FINAL_BALANCE,
  PARTICIPANT_FEE,
  PARTICIPANT_BEER_SERVER,
  PARTICIPANT_FOOD,
  PARTICIPANT_CHECK_MAIN,
  PARTICIPANT_CHECK_BEER_SERVER,
  PARTICIPANT_CHECK_FOOD,
  SUFFIX_FEE,
  IDS,
  CLASSES,
} from '../constants.js';
import { formatNumberWithCommas } from '../utils/format.js';

// --- Helper Functions ---

function updateParticipantCount(section, count) {
  const countElement = document.querySelector(
    `.${CLASSES.PARTICIPANT_COUNT}[data-section='${section}']`
  );
  if (countElement) countElement.textContent = count;
}

// --- Table Creation (Initial Setup) ---

export function initializeTables() {
  const pricingTableContainer = document.getElementById(
    IDS.PRICING_TABLE_CONTAINER
  );
  if (pricingTableContainer)
    pricingTableContainer.appendChild(createPricingTableElement());

  const calculationTableContainer = document.getElementById(
    IDS.CALCULATION_TABLE_CONTAINER
  );
  if (calculationTableContainer)
    calculationTableContainer.appendChild(
      createGenericTableElement(IDS.CALCULATION_TABLE, [])
    );

  const beerServerTableContainer = document.getElementById(
    IDS.BEER_SERVER_TABLE_CONTAINER
  );
  if (beerServerTableContainer)
    beerServerTableContainer.appendChild(
      createGenericTableElement(IDS.BEER_SERVER_TABLE, [
        HEADER_PARTICIPANT,
        HEADER_BEER_SERVER_FEE,
        HEADER_TOTAL_PAYMENT,
        HEADER_PER_PERSON,
        HEADER_BALANCE,
      ])
    );

  const foodTableContainer = document.getElementById(IDS.FOOD_TABLE_CONTAINER);
  if (foodTableContainer)
    foodTableContainer.appendChild(
      createGenericTableElement(IDS.FOOD_TABLE, [
        HEADER_PARTICIPANT,
        HEADER_FOOD,
        HEADER_TOTAL_PAYMENT,
        HEADER_PER_PERSON,
        HEADER_BALANCE,
      ])
    );
}

function createPricingTableElement() {
  const table = document.createElement('table');
  table.id = IDS.PRICING_TABLE;
  table.className = 'data-table';
  table.innerHTML = `<thead><tr><th>チケット名</th><th>金額</th></tr></thead><tbody></tbody>`;
  const tbody = table.querySelector('tbody');
  [TICKET_TYPE_TENT, TICKET_TYPE_PARKING].forEach((type) => {
    const tr = tbody.insertRow();
    tr.innerHTML = `<td>${type}</td><td><input type="number" class="${CLASSES.FORM_INPUT} ${CLASSES.FORM_INPUT_NUMERIC} ${CLASSES.TICKET_PRICE_INPUT}" data-ticket-type="${type}" value="0"><span class="${CLASSES.ERROR_MESSAGE_FIELD}"></span></td>`;
  });
  return table;
}

export function createGenericTableElement(id, headers) {
  const table = document.createElement('table');
  table.id = id;
  table.className = 'data-table';
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  headers.forEach((headerText) => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.createTBody();
  return table;
}

// --- Table Data Update ---

export function renderTables(state) {
  const {
    participants,
    participantInputValues,
    dynamicSections,
    calculationResults,
  } = state;

  // Temporary helper to get participant lists for rendering rows
  const getParticipantLists = () => {
    const selectedParticipants = participants.filter(
      (p) => participantInputValues[p]?.[PARTICIPANT_CHECK_MAIN]
    );
    const selectedBeerServerParticipants = participants.filter(
      (p) => participantInputValues[p]?.[PARTICIPANT_CHECK_BEER_SERVER]
    );
    const selectedFoodParticipants = participants.filter(
      (p) => participantInputValues[p]?.[PARTICIPANT_CHECK_FOOD]
    );
    const dynamicSectionsWithParticipants = dynamicSections.map((sec) => ({
      ...sec,
      participants: participants.filter(
        (p) => participantInputValues[p]?.[`${sec.id}_checked`] !== false
      ),
    }));
    return {
      selectedParticipants,
      selectedBeerServerParticipants,
      selectedFoodParticipants,
      dynamicSectionsWithParticipants,
    };
  };

  const {
    selectedParticipants,
    selectedBeerServerParticipants,
    selectedFoodParticipants,
    dynamicSectionsWithParticipants,
  } = getParticipantLists();

  updateParticipantCount('ticket', selectedParticipants.length);
  updateParticipantCount('beer-server', selectedBeerServerParticipants.length);
  updateParticipantCount('food', selectedFoodParticipants.length);

  const calculationTbody = document.querySelector(
    `#${IDS.CALCULATION_TABLE} tbody`
  );
  updateParticipantRows(
    calculationTbody,
    selectedParticipants,
    IDS.CALCULATION_ROW_TEMPLATE,
    participantInputValues,
    (clone, p) => {
      clone.querySelector(`th`).textContent = p;
    }
  );

  const beerServerTbody = document.querySelector(
    `#${IDS.BEER_SERVER_TABLE} tbody`
  );
  updateParticipantRows(
    beerServerTbody,
    selectedBeerServerParticipants,
    IDS.STANDARD_ROW_TEMPLATE,
    participantInputValues,
    (clone, p) => {
      clone.querySelector('td:first-child').textContent = p;
      const input = clone.querySelector('input');
      if (input) input.classList.add(CLASSES.BEER_SERVER_INPUT);
    }
  );

  const foodTbody = document.querySelector(`#${IDS.FOOD_TABLE} tbody`);
  updateParticipantRows(
    foodTbody,
    selectedFoodParticipants,
    IDS.STANDARD_ROW_TEMPLATE,
    participantInputValues,
    (clone, p) => {
      clone.querySelector('td:first-child').textContent = p;
      const input = clone.querySelector('input');
      if (input) input.classList.add(CLASSES.FOOD_INPUT);
    }
  );

  // Update rows for dynamic sections
  dynamicSectionsWithParticipants.forEach((sec) => {
    updateParticipantCount(sec.id, sec.participants.length);
    const sectionTbody = document.querySelector(
      `#${sec.id}-calculation-table tbody`
    );
    updateParticipantRows(
      sectionTbody,
      sec.participants,
      IDS.STANDARD_ROW_TEMPLATE,
      participantInputValues,
      (clone, p) => {
        clone.querySelector('td:first-child').textContent = p;
        const input = clone.querySelector('input');
        if (input) {
          input.classList.add(CLASSES.DYNAMIC_SECTION_INPUT);
          input.dataset.sectionName = sec.name;
        }
      }
    );
  });

  // Calculation is no longer done here.
  // Instead, we use the results from the state.
  if (calculationResults) {
    updateUIWithResults(calculationResults);
    updateSummaryTable(calculationResults);
  }
}

function updateParticipantRows(
  tbody,
  selectedParticipants,
  templateId,
  participantInputValues,
  configureClone
) {
  if (!tbody) return;
  const template = document.getElementById(templateId)?.content;
  if (!template) return;

  const rowsMap = new Map();
  tbody.querySelectorAll('tr[data-participant]').forEach((tr) => {
    const pName = tr.dataset.participant;
    if (!rowsMap.has(pName)) rowsMap.set(pName, []);
    rowsMap.get(pName).push(tr);
  });

  // 1. Remove rows for deselected participants
  rowsMap.forEach((rows, pName) => {
    if (!selectedParticipants.includes(pName)) {
      rows.forEach((row) => row.remove());
      rowsMap.delete(pName);
    }
  });

  // 2. Add new rows for newly selected participants
  selectedParticipants.forEach((p) => {
    if (!rowsMap.has(p)) {
      const clone = document.importNode(template, true);
      configureClone(clone, p);
      const newRows = [];
      Array.from(clone.children).forEach((child) => {
        if (child.tagName === 'TR') {
          child.dataset.participant = p;
          newRows.push(child);
        }
      });
      rowsMap.set(p, newRows);
    }
  });

  // 3. Update values for all rows and re-order them in a fragment
  const fragment = document.createDocumentFragment();
  selectedParticipants.forEach((p) => {
    const rows = rowsMap.get(p);
    if (rows) {
      rows.forEach((row) => {
        updateRowValues(row, p, participantInputValues);
        fragment.appendChild(row);
      });
    }
  });

  // 4. Append the ordered fragment to the tbody
  tbody.appendChild(fragment);
}

function updateRowValues(row, participant, participantInputValues) {
  const pData = participantInputValues[participant];
  if (!pData) return;

  const inputs = row.querySelectorAll('input');
  inputs.forEach((input) => {
    if (document.activeElement === input) return;

    if (input.classList.contains(CLASSES.TICKET_QUANTITY_INPUT)) {
      input.value = pData[input.dataset.ticketType] || 0;
    } else if (input.classList.contains(CLASSES.FEE_INPUT)) {
      input.value = pData[PARTICIPANT_FEE] || 0;
    } else if (input.classList.contains(CLASSES.BEER_SERVER_INPUT)) {
      input.value = pData[PARTICIPANT_BEER_SERVER] || 0;
    } else if (input.classList.contains(CLASSES.FOOD_INPUT)) {
      input.value = pData[PARTICIPANT_FOOD] || 0;
    }
  });
}

function updateUIWithResults(results) {
  const {
    calculationResults,
    perPersonExpense,
    perPersonBeerServerExpense,
    perPersonFoodExpense,
    dynamicSectionTotals,
    totalTentTickets,
    totalParkingTickets,
  } = results;

  if (calculationResults) {
    for (const p in calculationResults) {
      const result = calculationResults[p];
      const valueRow = document.querySelector(
        `#${IDS.CALCULATION_TABLE} tr[data-participant="${p}"].calculation-table__value-row`
      );
      if (valueRow) {
        valueRow.querySelector(`.${CLASSES.TOTAL_PAYMENT}`).textContent =
          formatNumberWithCommas(result.totalPayment);
        valueRow.querySelector(`.${CLASSES.PER_PERSON_PAYMENT}`).textContent =
          formatNumberWithCommas(Math.round(perPersonExpense));
        updateBalanceCell(
          valueRow.querySelector(`.${CLASSES.BALANCE}`),
          result.balance
        );
      }
    }
  }

  const totalTentTicketsElement = document.getElementById(
    'total-tent-tickets'
  );
  const totalParkingTicketsElement = document.getElementById(
    'total-parking-tickets'
  );

  if (totalTentTicketsElement) {
    totalTentTicketsElement.textContent = totalTentTickets || 0;
  }
  if (totalParkingTicketsElement) {
    totalParkingTicketsElement.textContent = totalParkingTickets || 0;
  }

  updateStandardTableUI(
    `#${IDS.BEER_SERVER_TABLE}`,
    calculationResults,
    perPersonBeerServerExpense,
    'beerBalance',
    'beerServerPayment'
  );
  updateStandardTableUI(
    `#${IDS.FOOD_TABLE}`,
    calculationResults,
    perPersonFoodExpense,
    'foodBalance',
    'foodPayment'
  );

  if (dynamicSectionTotals) {
    for (const sectionName in dynamicSectionTotals) {
      const section = document.querySelector(
        `.content-section[data-section-name="${sectionName}"]`
      );
      if (section) {
        const table = section.querySelector('table');
        const perPerson = dynamicSectionTotals[sectionName].perPerson;
        updateStandardTableUI(
          `#${table.id}`,
          calculationResults,
          perPerson,
          `${sectionName}_balance`,
          `${sectionName}_payment`
        );
      }
    }
  }
}

function updateStandardTableUI(
  tableSelector,
  results,
  perPerson,
  balanceKey,
  paymentKey
) {
  const table = document.querySelector(tableSelector);
  if (!table) return;

  table.querySelectorAll('tbody tr[data-participant]').forEach((row) => {
    const p = row.dataset.participant;
    if (results && results[p] && results[p][balanceKey] !== undefined) {
      const totalPaymentCell = row.querySelector(`.${CLASSES.TOTAL_PAYMENT}`);
      if (totalPaymentCell)
        totalPaymentCell.textContent = formatNumberWithCommas(
          results[p][paymentKey] || 0
        );

      const perPersonCell = row.querySelector(`.${CLASSES.PER_PERSON_PAYMENT}`);
      if (perPersonCell)
        perPersonCell.textContent = formatNumberWithCommas(
          Math.round(perPerson || 0)
        );

      const balanceCell = row.querySelector(`.${CLASSES.BALANCE}`);
      if (balanceCell) updateBalanceCell(balanceCell, results[p][balanceKey]);
    }
  });
}

function updateSummaryTable(results) {
  const { calculationResults, dynamicSections } = results;
  const summaryTbody = document.querySelector(`#${IDS.SUMMARY_TABLE} tbody`);
  const summaryThead = document.querySelector(`#${IDS.SUMMARY_TABLE} thead`);
  if (!summaryTbody || !summaryThead) return;

  const headers = [
    HEADER_PARTICIPANT,
    HEADER_TICKET,
    HEADER_BEER_SERVER_FEE,
    HEADER_FOOD,
  ];
  if (dynamicSections) {
    dynamicSections.forEach((sec) =>
      headers.push(sec.name.replace(SUFFIX_FEE, ''))
    );
  }
  headers.push(HEADER_FINAL_BALANCE);
  summaryThead.innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;

  const existingRows = new Map();
  summaryTbody.querySelectorAll('tr[data-participant]').forEach((row) => {
    existingRows.set(row.dataset.participant, row);
  });

  const fragment = document.createDocumentFragment();
  const participantsInResults = new Set();

  if (calculationResults) {
    for (const participant in calculationResults) {
      participantsInResults.add(participant);
      const result = calculationResults[participant];
      let row = existingRows.get(participant);

      if (!row) {
        row = document.createElement('tr');
        row.dataset.participant = participant;
        fragment.appendChild(row);
      }

      let cellsHtml = `<td>${participant}</td>`;
      cellsHtml += `<td>${updateBalanceCell(null, result.balance, true)}</td>`;
      cellsHtml += `<td>${updateBalanceCell(null, result.beerBalance, true)}</td>`;
      cellsHtml += `<td>${updateBalanceCell(null, result.foodBalance, true)}</td>`;
      if (dynamicSections) {
        dynamicSections.forEach((sec) => {
          cellsHtml += `<td>${updateBalanceCell(null, result[`${sec.name}_balance`], true)}</td>`;
        });
      }
      cellsHtml += `<td>${updateBalanceCell(null, result.totalBalance, true)}</td>`;
      row.innerHTML = cellsHtml;
    }
  }

  existingRows.forEach((row, participant) => {
    if (!participantsInResults.has(participant)) {
      row.remove();
    }
  });

  if (fragment.children.length > 0) {
    summaryTbody.appendChild(fragment);
  }
}

function updateBalanceCell(cell, balanceValue, returnHtml = false) {
  const roundedBalance = Math.round(balanceValue || 0);
  let text,
    className = CLASSES.BALANCE;

  if (roundedBalance > 0) {
    text = `貰う: ${formatNumberWithCommas(roundedBalance)}`;
    className += ` ${CLASSES.BALANCE_POSITIVE}`;
  } else if (roundedBalance < 0) {
    text = `払う: ${formatNumberWithCommas(Math.abs(roundedBalance))}`;
    className += ` ${CLASSES.BALANCE_NEGATIVE}`;
  } else {
    text = '0';
  }

  if (returnHtml) return `<span class="${className}">${text}</span>`;

  if (cell) {
    cell.textContent = text;
    cell.className = className;
  }
}
