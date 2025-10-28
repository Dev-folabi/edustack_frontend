from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Login
    page.goto("http://localhost:3000/login", timeout=60000)
    page.wait_for_selector('button:text("Sign In")', timeout=60000)
    page.get_by_placeholder("you@example.com").fill("test@test.com")
    page.get_by_placeholder("••••••••").fill("password")
    page.get_by_role("button", name="Sign In").click()
    page.wait_for_load_state("networkidle", timeout=60000)
    print(page.url)

    # Navigate to Fee Management
    page.goto("http://localhost:3000/finance/fee-management", timeout=60000)
    page.wait_for_selector('h1:text("Invoices")', timeout=60000)
    page.screenshot(path="jules-scratch/verification/fee-management.png")

    # Navigate to Fee Types
    page.get_by_role("button", name="Manage Fee Types").click()
    page.wait_for_url("http://localhost:3000/finance/fee-management/fee-types", timeout=60000)
    page.wait_for_selector('h1:text("Fee Types Management")', timeout=60000)
    page.screenshot(path="jules-scratch/verification/fee-types.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
