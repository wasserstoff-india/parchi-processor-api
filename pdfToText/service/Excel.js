export const filterRows = (rows, columnFilters) => {
  const hasOperator =
    columnFilters.includes('>') || columnFilters.includes('<');

  if (hasOperator) {
    return filteredRowsWithOperator(rows, columnFilters);
  } else {
    return filteredRowsSimple(rows, columnFilters);
  }
};

export const filteredRowsSimple = (rows, columnFilters) => {
  const filters = columnFilters.split(/[Oo][Rr]/);
  const selectedRows = [];

  filters.forEach((filter) => {
    // Use regex to remove extra spaces around the equal sign
    const [filterColumnValue, filterRowValue] = filter
      .replace(/'/g, '')
      .split(/\s*=\s*/); // Split on '=' with optional spaces
      const trimmedColumnName = filterColumnValue.replace(/\s/g, '').toLowerCase();
    console.log(trimmedColumnName, 'trimmedColumnName simple value');
    const trimmedRowValue = filterRowValue.trim().toLowerCase();
    console.log(trimmedRowValue, 'trimmed row value');

    const filteredRows = rows.filter((row) => {
      const columnValue = row[trimmedColumnName]?.trim().toLowerCase()
      ;
      return columnValue === trimmedRowValue;
    });

    selectedRows.push(...filteredRows);
  });

  return selectedRows;
};

const filteredRowsWithOperator = (rows, columnFilters) => {
  const filters = columnFilters.split(/ OR | or /);
  const selectedRows = [];

  filters.forEach((filter) => {
    const conditions = filter.split(/ AND | and /);
    let conditionMatches = [];

    conditions.forEach((condition) => {
      const [columnName, filterValue] = condition
        .replace(/'/g, '')
        .split(/[><=]/);
      const operator = condition.replace(/[^><]/g, '').trim();
      const trimmedColumnName = columnName.trim().toLowerCase();
      console.log(trimmedColumnName, ':::trimmedColumnName operator  value ');
      const trimmedRowValue = filterValue.trim().toLowerCase();

      const filteredRows = rows.filter((row) => {
        const columnValue = parseFloat(
          row[trimmedColumnName].replace(/[^0-9.-]+/g, '')
        );
        if (!isNaN(columnValue)) {
          switch (operator) {
            case '>':
              return columnValue > parseFloat(trimmedRowValue);
            case '>=':
              return columnValue >= parseFloat(trimmedRowValue);
            case '<':
              return columnValue < parseFloat(trimmedRowValue);
            case '<=':
              return columnValue <= parseFloat(trimmedRowValue);
            case '=':
              return columnValue === parseFloat(trimmedRowValue);
            default:
              return false;
          }
        }
        return false;
      });

      conditionMatches.push(filteredRows);
    });

    // Perform logical AND operation between condition matches
    let andMatches = conditionMatches.shift() || [];
    conditionMatches.forEach((conditionRows) => {
      andMatches = andMatches.filter((row) => conditionRows.includes(row));
    });

    selectedRows.push(...andMatches);
  });

  return selectedRows;
};
