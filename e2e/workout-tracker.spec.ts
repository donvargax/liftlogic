import { test, expect } from '@playwright/test';

test.describe('Warm-up calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should calculate warm-up weights for a given working weight', async ({ page }) => {
    await page.getByLabel('Working Weight (lbs/kg)').fill('225');

    await expect(page.getByText('Estimated 1RM')).toBeVisible();
    await expect(page.getByText('First Warm-Up')).toBeVisible();
  });
});

test.describe('Workout tracker – save flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show unsaved-changes banner and enable Save after typing in a field', async ({ page }) => {
    await page.getByRole('button', { name: /Day 2 · Legs A & Core/ }).click();

    const weightInput = page.getByPlaceholder('e.g. 185').first();
    await weightInput.fill('225');

    await expect(page.getByText('You have unsaved changes for this day.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save workout' })).toBeEnabled();
  });

  test('should save workout data and show saved confirmation', async ({ page }) => {
    const weightInput = page.getByPlaceholder('e.g. 185').first();
    await weightInput.fill('185');

    await page.getByRole('button', { name: 'Save workout' }).click();

    await expect(page.getByText('Workout data saved locally.')).toBeVisible();
    await expect(page.getByText('You have unsaved changes for this day.')).not.toBeVisible();
  });

  test('should disable Save workout button when there are no unsaved changes', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save workout' })).toBeDisabled();
  });
});

test.describe('Workout tracker – Finish Routine / backup modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should open the backup modal when Finish Routine is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Finish Routine' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading')).toContainText('Day 1 is ready to wrap up');
  });

  test('modal export button receives focus when the dialog opens', async ({ page }) => {
    await page.getByRole('button', { name: 'Finish Routine' }).click();

    const exportButton = page.getByRole('button', { name: 'Export backup' });
    await expect(exportButton).toBeFocused();
  });

  test('Not now closes the backup modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Finish Routine' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: 'Not now' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});

test.describe('Workout tracker – day switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display the correct exercises when switching to Day 2', async ({ page }) => {
    await page.getByRole('button', { name: /Day 2 · Legs A & Core/ }).click();

    await expect(page.getByText('Hack Squat')).toBeVisible();
    await expect(page.getByText('Kneeling Cable Crunch')).toBeVisible();
  });

  test('should display Day 1 exercises on initial load', async ({ page }) => {
    await expect(page.getByText('Incline Barbell Press')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Day 1 · Torso A' })).toHaveClass(/bg-blue-600/);
  });
});

test.describe('Workout tracker – Export / Import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('clicking Export Data shows the exported confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'Export Data' }).click();

    await expect(page.getByText('Workout data exported.')).toBeVisible();
  });
});
