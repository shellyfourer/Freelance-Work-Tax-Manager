import { test, expect, type Page } from "@playwright/test";

const BACKEND = process.env.PLAYWRIGHT_BACKEND_URL ?? "http://localhost:8080";
const today = new Date().toISOString().split("T")[0];

test.describe.serial("User journey", () => {
  let page: Page;

  test.beforeAll(async ({ browser, request }) => {
    // Wipe all income records then clients so each run starts empty
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

    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  // Step 1: empty state

  test("sees empty client dashboard", async () => {
    await page.goto("/clients", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();
    await expect(
      page.getByText("No clients yet. Add your first client to start tracking income."),
    ).toBeVisible({ timeout: 10000 });
  });

  // Step 2: add clients

  test("adds a FIXED client", async () => {
    await page.getByRole("button", { name: "+ Add Client" }).click();
    await expect(page.getByText("+ Add Client")).toBeVisible();

    await page.getByLabel("Name").fill("Globex Project");
    await page.getByLabel("Payment Type").fill("Fix");
    await page.getByLabel("Payment Type").press("ArrowDown");
    await page.getByLabel("Payment Type").press("Enter");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Client created.").first()).toBeVisible();
    await expect(page.getByText("Globex Project")).toBeVisible();
  });

  test("adds an HOURLY client", async () => {
    await page.getByRole("button", { name: "+ Add Client" }).click();

    await page.getByLabel("Name").fill("Acme Corp");
    await page.getByLabel("Payment Type").fill("Hour");
    await page.getByLabel("Payment Type").press("ArrowDown");
    await page.getByLabel("Payment Type").press("Enter");
    await page.getByLabel("Hourly Rate").fill("75");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Client created.").first()).toBeVisible();
    await expect(page.getByText("Acme Corp")).toBeVisible();
  });

  // Step 3: add income records

  test("adds an income record linked to a FIXED client", async () => {
    await page.goto("/income", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: "+ Add Income" }).click();
    await expect(page.getByText("+ Add Income")).toBeVisible();

    await page.getByLabel("Client").fill("Glob");
    await page.getByLabel("Client").press("ArrowDown");
    await page.getByLabel("Client").press("Enter");
    await page.getByLabel("Income Amount").fill("2500");
    await page.getByLabel("Income Date").fill(today);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Income record created.").first()).toBeVisible();
    await expect(page.getByText("Globex Project").first()).toBeVisible();
  });

  test("adds an income record linked to an HOURLY client — hours convert to amount", async () => {
    await page.getByRole("button", { name: "+ Add Income" }).click();

    await page.getByLabel("Client").fill("Acme");
    await page.getByLabel("Client").press("ArrowDown");
    await page.getByLabel("Client").press("Enter");

    // 8 hrs × €75 = €600
    await page.getByLabel("Hours").fill("8");
    await expect(page.getByText("€600.00")).toBeVisible();

    await page.getByLabel("Income Date").fill(today);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Income record created.").first()).toBeVisible();
    await expect(page.getByText("Acme Corp").first()).toBeVisible();
  });

  // Step 4: delete

  test("deletes an income record", async () => {
    await page.getByRole("button", { name: "+ Add Income" }).click();
    await page.getByLabel("Client").fill("Glob");
    await page.getByLabel("Client").press("ArrowDown");
    await page.getByLabel("Client").press("Enter");
    await page.getByLabel("Income Amount").fill("999");
    await page.getByLabel("Income Date").fill(today);
    await page.getByLabel("Description").fill("to-be-deleted");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Income record created.").first()).toBeVisible();

    const row = page.locator("tr").filter({ hasText: "to-be-deleted" });
    await row.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Income record deleted.")).toBeVisible();
    await expect(page.getByText("to-be-deleted")).not.toBeVisible();
  });

  // Step 5: tax calculator WebSocket

  test("calculates tax via WebSocket after entering income", async () => {
    await page.goto("/calculator", { waitUntil: "networkidle" });

    await expect(page.getByText(/results appear here after you enter information/i)).toBeVisible();

    await page.getByLabel("Income field").fill("50000");

    // Wait for the WebSocket round trip — result replaces the placeholder
    await expect(page.getByText(/based on your income/i)).toBeVisible();
    await expect(page.getByText("€ —")).not.toBeVisible();
  });
});
