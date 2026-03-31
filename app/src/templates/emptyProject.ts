export const EMPTY_PROJECT_FILES = new Map<string, string>([
  ['project_metadata.json', JSON.stringify({ format_version: '3.0', project_name: '', units: 'meters' }, null, 2)],
  ['global/level.csv', 'id,number,name,elevation\nlv-1,1,Level 1,0\n'],
  ['global/grid.csv', 'id,number,start_x,start_y,end_x,end_y\ngr-1,A,0,-10,0,10\ngr-2,1,-10,0,10,0\n'],
]);
