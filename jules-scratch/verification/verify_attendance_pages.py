from playwright.sync_api import sync_playwright, expect
import re

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:3000/login")
    page.wait_for_timeout(15000) # 15 seconds wait
    page.screenshot(path="jules-scratch/verification/login_page.png")

    username_field = page.locator('input[name="emailOrUsername"]')
    password_field = page.locator('input[name="password"]')

    expect(username_field).to_be_visible()
    expect(password_field).to_be_visible()

    username_field.fill("superadmin")
    password_field.fill("password123")

    page.get_by_role("button", name="Sign In").click()

    # Wait for navigation to a dashboard URL
    expect(page).to_have_url(re.compile(".*dashboard"), timeout=120000)

    # Navigate to Student Attendance page
    page.goto("http://localhost:3000/academics/attendance/student")
    expect(page.get_by_role("heading", name="Student Attendance")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/student_attendance.png")

    # Navigate to Staff Attendance page
    page.goto("http://localhost:3000/academics/attendance/staff")
    expect(page.get_by_role("heading", name="Staff Attendance")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/staff_attendance.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
