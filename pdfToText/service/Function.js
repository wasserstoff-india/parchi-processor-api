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
    description:
      'Calculate the sum of values in a specific column based on given conditions',
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
    description:
      'Calculate the average of values in a specific column based on given conditions',
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
];
