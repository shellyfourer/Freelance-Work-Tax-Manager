import { test, expect, type Page } from "@playwright/test";

const BACKEND = process.env.PLAYWRIGHT_BACKEND_URL ?? "http://localhost:8080";
const today = new Date().toISOString().split("T")[0];

test.describe.serial("User journey", () => {
  let page: Page | undefined;

  const currentPage = (): Page => {
    if (!page) {
      throw new Error("Playwright page was not initialized");
    }
    return page;
  };

  test.beforeAll(async ({ browser, request }) => {
    // Wipe all income records then clients so each run starts empty
    page = await browser.newPage();

    const recordsRes = await request.get(`${BACKEND}/api/income-records?userId=1`);
    const records = await recordsRes.json();
    for (const r of records) {
      await request.delete(`${BACKEND}/api/income-records/${r.incomeId}`);
    }

    const sourcesRes = await request.get(`${BACKEND}/api/clients?userId=1`);
    const sources = await sourcesRes.json();
    for (const s of sources) {
      await request.delete(`${BACKEND}/api/clients/${s.sourceId}`);
    }
  });

  test.afterAll(async () => {
    await page?.close();
  });

  // Step 1: empty state

  test("sees empty client dashboard", async () => {
    await currentPage().goto("/clients", { waitUntil: "domcontentloaded" });

    await expect(currentPage().getByRole("heading", { name: "Clients" })).toBeVisible();
    await expect(
      currentPage().getByText("No clients yet. Add your first client to start tracking income."),
    ).toBeVisible({ timeout: 10000 });
  });

  // Step 2: add clients

  test("adds a FIXED client", async () => {
    await currentPage().getByRole("button", { name: "+ Add Client" }).click();
    await expect(currentPage().getByText("+ Add Client")).toBeVisible();

    await currentPage().getByLabel("Name").fill("Globex Project");
    await currentPage().getByLabel("Payment Type").fill("Fix");
    await currentPage().getByRole("button", { name: "Fixed price" }).waitFor({ state: "visible" });
    await currentPage().getByRole("button", { name: "Fixed price" }).click({ force: true });
    await currentPage().getByRole("button", { name: "Save" }).click();

    await expect(currentPage().getByText("Client created.").first()).toBeVisible();
    await expect(currentPage().getByText("Globex Project")).toBeVisible();
  });

  test("adds an HOURLY client", async () => {
    await currentPage().getByRole("button", { name: "+ Add Client" }).click();

    await currentPage().getByLabel("Name").fill("Acme Corp");
    await currentPage().getByLabel("Payment Type").fill("Hour");
    await currentPage().getByRole("button", { name: "Hourly rate" }).waitFor({ state: "visible" });
    await currentPage().getByRole("button", { name: "Hourly rate" }).click({ force: true });
    await currentPage().getByLabel("Hourly Rate").fill("75");
    await currentPage().getByRole("button", { name: "Save" }).click();

    await expect(currentPage().getByText("Client created.").first()).toBeVisible();
    await expect(currentPage().getByText("Acme Corp")).toBeVisible();
  });

  // Step 3: add income records

  test("adds an income record linked to a FIXED client", async () => {
    await currentPage().goto("/income", { waitUntil: "domcontentloaded" });

    await currentPage().getByRole("button", { name: "+ Add Income" }).click();
    await expect(currentPage().getByText("+ Add Income")).toBeVisible();

    await currentPage().getByLabel("Client").fill("Glob");
    await currentPage().getByLabel("Client").press("ArrowDown");
    await currentPage().getByLabel("Client").press("Enter");
    await currentPage().getByLabel("Income Amount").fill("2500");
    await currentPage().getByLabel("Income Date").fill(today);
    await currentPage().getByRole("button", { name: "Save" }).click();

    await expect(currentPage().getByText("Income record created.").first()).toBeVisible();
    await expect(currentPage().getByText("Globex Project").first()).toBeVisible();
  });

  test("adds an income record linked to an HOURLY client — hours convert to amount", async () => {
    await currentPage().getByRole("button", { name: "+ Add Income" }).click();

    await currentPage().getByLabel("Client").fill("Acme");
    await currentPage().getByLabel("Client").press("ArrowDown");
    await currentPage().getByLabel("Client").press("Enter");

    // 8 hrs × €75 = €600
    await currentPage().getByLabel("Hours").fill("8");
    await expect(currentPage().getByText("€600.00")).toBeVisible();

    await currentPage().getByLabel("Income Date").fill(today);
    await currentPage().getByRole("button", { name: "Save" }).click();

    await expect(currentPage().getByText("Income record created.").first()).toBeVisible();
    await expect(currentPage().getByText("Acme Corp").first()).toBeVisible();
  });

  // Step 4: delete

  test("deletes an income record", async () => {
    await currentPage().getByRole("button", { name: "+ Add Income" }).click();
    await currentPage().getByLabel("Client").fill("Glob");
    await currentPage().getByLabel("Client").press("ArrowDown");
    await currentPage().getByLabel("Client").press("Enter");
    await currentPage().getByLabel("Income Amount").fill("999");
    await currentPage().getByLabel("Income Date").fill(today);
    await currentPage().getByLabel("Description").fill("to-be-deleted");
    await currentPage().getByRole("button", { name: "Save" }).click();
    await expect(currentPage().getByText("Income record created.").first()).toBeVisible();

    const row = currentPage().locator("tr").filter({ hasText: "to-be-deleted" });
    await row.getByRole("button", { name: "Delete" }).click();
    await currentPage().getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();

    await expect(currentPage().getByText("Income record deleted.")).toBeVisible();
    await expect(currentPage().getByText("to-be-deleted")).not.toBeVisible();
  });

  // Step 5: tax calculator WebSocket

  test("calculates tax via WebSocket after entering income", async () => {
    await currentPage().goto("/calculator", { waitUntil: "domcontentloaded" });

    await expect(
      currentPage().getByText(/results appear here after you enter information/i),
    ).toBeVisible();

    await currentPage().getByLabel("Income field").fill("50000");

    // Wait for the WebSocket round trip — result replaces the placeholder
    await expect(currentPage().getByText(/based on your income/i)).toBeVisible();
    await expect(currentPage().getByText("€ —")).not.toBeVisible();
  });
});
