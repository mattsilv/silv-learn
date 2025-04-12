import { test, expect } from '@playwright/test'

test('should allow user to complete the quiz flow', async ({ page }) => {
  // Visit the home page
  await page.goto('/')
  
  // Verify we're on the welcome page and click start
  await expect(page.locator('h1')).toBeVisible()
  await page.getByText('Start Quiz').click()
  
  // We should be at the first question
  await expect(page).toHaveURL(/\/quiz\/1/)
  
  // Go through all 5 questions
  for (let i = 1; i <= 5; i++) {
    // Select the first option for simplicity
    await page.locator('input[type="checkbox"]').first().check()
    
    // Click next or finish
    if (i < 5) {
      await page.getByText('Next').click()
      // Verify we moved to the next question
      await expect(page).toHaveURL(`/quiz/${i+1}`)
    } else {
      await page.getByText(/Finish|Results/i).click()
    }
  }
  
  // Verify we reached the results page
  await expect(page).toHaveURL(/\/results/)
  
  // Results heading should be visible
  await expect(page.locator('h1').filter({ hasText: /Results/i })).toBeVisible()
})