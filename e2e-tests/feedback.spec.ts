import { test, expect } from '@playwright/test';

test.describe('Feedback Management Tests', () => {
  test('Add Feedback button navigates to the feedback form', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Add Feedback")');
    await expect(page).toHaveURL(/\/add-feedback/);
  });

  test('User can submit a new feedback', async ({ page }) => {
    await page.goto('/add-feedback');

    // Fill the form
    await page.fill('[aria-label="Name"]', 'John Doe');
    await page.fill('[aria-label="Email"]', 'john.doe@example.com');
    await page.click('button:has-text("Next")'); // Navigate to next step
    await page.fill('[aria-label="Survey Question"]', 'How was your experience?');
    await page.fill('[aria-label="Option 1"]', 'Great');
    await page.fill('[aria-label="Option 2"]', 'Good');
    await page.fill('[aria-label="Option 3"]', 'Okay');
    await page.fill('[aria-label="Option 4"]', 'Bad');
    await page.click('button:has-text("Finish")'); // Submit form

    // Verify success message
    await expect(page.locator('text=Survey created and link sent!')).toBeVisible();
  });

  test('Votes button shows vote details', async ({ page }) => {
    await page.goto('/feedbacks');
    await page.click('button:has-text("Votes")');

    // Verify vote details modal
    await expect(page.locator('[data-testid="voter-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="selected-option"]')).toBeVisible();
  });

  test('Update button navigates to the update page', async ({ page }) => {
    await page.goto('/feedbacks');
    await page.click('button:has-text("Update")');

    // Verify navigation to update page
    await expect(page).toHaveURL(/\/update-feedback/);
  });

  test('Delete button removes a feedback', async ({ page }) => {
    await page.goto('/feedbacks');
    await page.click('button:has-text("Delete")');

    // Confirm delete modal
    await page.click('button:has-text("Yes")');

    // Verify success message
    await expect(page.locator('text=Feedback successfully deleted!')).toBeVisible();
  });

  test('Survey creation displays success message', async ({ page }) => {
    await page.goto('/add-feedback');

    // Fill and submit the form
    await page.fill('[aria-label="Name"]', 'Jane Doe');
    await page.fill('[aria-label="Email"]', 'jane.doe@example.com');
    await page.click('button:has-text("Next")');
    await page.fill('[aria-label="Survey Question"]', 'How likely are you to recommend us?');
    await page.fill('[aria-label="Option 1"]', 'Very likely');
    await page.fill('[aria-label="Option 2"]', 'Somewhat likely');
    await page.fill('[aria-label="Option 3"]', 'Not likely');
    await page.click('button:has-text("Finish")');

    // Verify success message
    await expect(page.locator('text=Survey created and link sent!')).toBeVisible();
  });
});
