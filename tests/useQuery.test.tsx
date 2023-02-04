import { useSupabaseQuery } from "../src/index";
import React from "react";
import { customRender, screen, render, waitFor } from "./testUtils";
import { setupServer } from "msw/node";
import { rest } from "msw";

import { supabaseUrl } from "./constants";

const server = setupServer(
  rest.get(`${supabaseUrl}`, (_, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 2,
          name: "hi",
        },
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function Component() {
  const { data, isLoading } = useSupabaseQuery((client) =>
    client.from("todos").select()
  );

  if (isLoading) return "loading";

  return data[0].name;
}

test("useQuery throws if used outside of provider", () => {
  // suppress annoying logs
  const spy = jest.spyOn(console, "error");
  spy.mockImplementation(() => {});

  expect(() => render(<Component />)).toThrow(
    "Must be used inside SupabaseQueryProvider"
  );

  spy.mockRestore();
});

test("useQuery loads and shows data", async () => {
  customRender(<Component />);
  expect(screen.getByText("loading")).toBeInTheDocument();
  expect(screen.queryByText("hi")).toBeNull();
  await waitFor(() => {
    expect(screen.getByText("hi")).toBeInTheDocument();
  });
  expect(screen.queryByText("loading")).toBeNull();
});
