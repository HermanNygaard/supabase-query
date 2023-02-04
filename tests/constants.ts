export const url = "http://test.com" as const;
export const tableName = "todos" as const;
export const supabaseUrl = `${url}/rest/v1/${tableName}` as const;
