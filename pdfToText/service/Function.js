export const functions = [
    {
      name: 'row_to_select',
      description: 'Select the rows based on given conditions',
      parameters: {
        type: 'object',
        properties: {
          columnFilters: {
            type: 'string',
            description: 'Filters to select rows based on conditions',
          },
        },
        required: ['columnFilters'],
      },
    },
    {
      name: 'sum_of_column',
      description: 'Calculate the sum of values in a specific column based on given conditions',
      parameters: {
        type: 'object',
        properties: {
          columnName: { 
            type: 'string',
            description: 'Name of the column for which to calculate the sum',
          },
          columnFilters: {
            type: 'string',
            description: 'Filters to select rows based on conditions',
          },
        },
        required: ['columnName'],
      },
    },
    {
      name: 'average_of_column',
      description: 'Calculate the average of values in a specific column based on given conditions',
      parameters: {
        type: 'object',
        properties: {
          columnName: { 
            type: 'string',
            description: 'Name of the column for which to calculate the average',
          },
          columnFilters: {
            type: 'string',
            description: 'Filters to select rows based on conditions',
          },
        },
        required: ['columnName'], 
      },
    },
    {
      name: "sort_and_select",
      description: "Sort the table based on a specific column, and select rows based on given conditions.",
      parameters: {
        type: "object",
        properties: {
          columnName: {
            type: "string",
            description: "Name of the column by which to sort the table."
          },
          columnFilters: {
            type: "string",
            description: "Filters to select rows based on conditions."
          }
        },
        required: ["columnName"], 
      },
    },
  ];
  