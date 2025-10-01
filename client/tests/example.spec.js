import { test, expect } from '@playwright/test';

test('homepage should display Arabic content', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:3000');
  
  // Verify that the main title "توصيلة" appears on the page (using first() to handle multiple elements)
  await expect(page.getByText('توصيلة').first()).toBeVisible();
  
  // Verify that at least one of the action buttons is present
  const searchButton = page.getByText('ابحث عن رحلة');
  const postButton = page.getByText('انشر رحلة');
  
  await expect(searchButton.or(postButton)).toBeVisible();
});
