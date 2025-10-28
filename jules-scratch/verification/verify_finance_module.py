from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the login page
    page.goto("http://localhost:3000/login")

    # Fill in the login form and submit
    page.fill('input[name="emailOrUsername"]', "superadmin")
    page.fill('input[name="password"]', "password123")
    page.click('button[type="submit"]')

    # Wait for navigation to the dashboard
    page.wait_for_url("http://localhost:3000/dashboard", timeout=60000)

    # Navigate to the Admin Finance page
    page.goto("http://localhost:3000/finance")
    page.wait_for_selector("text=Admin Finance Dashboard")
    page.screenshot(path="jules-scratch/verification/admin-finance-dashboard.png")

    # Navigate to the Fee Management page
    page.goto("http://localhost:3000/finance/fee-management")
    page.wait_for_selector("text=Fee Category Management")
    page.screenshot(path="jules-scratch/verification/fee-management.png")

    # Navigate to the Invoices page
    page.goto("http://localhost:3000/finance/invoices")
    page.wait_for_selector("text=Invoice Management")
    page.screenshot(path="jules-scratch/verification/invoices.png")

    # Navigate to the Payments page
    page.goto("http://localhost:3000/finance/payments")
    page.wait_for_selector("text=Payment Management")
    page.screenshot(path="jules-scratch/verification/payments.png")

    # Navigate to the Expenses page
    page.goto("http://localhost:3000/finance/expenses")
    page.wait_for_selector("text=Expense Management")
    page.screenshot(path="jules-scratch/verification/expenses.png")

    # Navigate to the Student Finance page
    page.goto("http://localhost:3000/student/finance")
    page.wait_for_selector("text=Student Finance Dashboard")
    page.screenshot(path="jules-scratch/verification/student-finance-dashboard.png")

    # Navigate to the Make Payment page
    page.goto("http://localhost:3000/student/finance/make-payment")
    page.wait_for_selector("text=Make a Payment")
    page.screenshot(path="jules-scratch/verification/make-payment.png")


    browser.close()

with sync_playwright() as playwright:
    run(playwright)
