import { getTable } from "../src";

test("getTable", () => {
  expect(getTable(new URL("http://test.com/rest/v1/todo?select=*"))).toEqual(
    "todo"
  );
  expect(getTable(new URL("http://test.com/rest/v1/todo?"))).toEqual("todo");
  expect(getTable(new URL("http://test.com/rest/v1/todo"))).toEqual("todo");
});
