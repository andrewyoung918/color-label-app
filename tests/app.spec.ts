import { test, expect } from '@playwright/test';

test.describe('Color Label App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Color Label App/);
  });

  test('should navigate between pages', async ({ page }) => {
    // Start on search page
    await expect(page.locator('h1')).toContainText('Search Paint Colors');

    // Navigate to Library
    await page.getByRole('link', { name: 'Library' }).click();
    await expect(page.locator('h1')).toContainText('My Color Library');

    // Navigate to Palettes
    await page.getByRole('link', { name: 'Palettes' }).click();
    await expect(page.locator('h1')).toContainText('Color Palettes');

    // Navigate to Labels
    await page.getByRole('link', { name: 'Labels' }).click();
    await expect(page.locator('h1')).toContainText('Label Designer');

    // Navigate back to Search
    await page.getByRole('link', { name: 'Search' }).click();
    await expect(page.locator('h1')).toContainText('Search Paint Colors');
  });

  test('should display search input on search page', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by color name, brand, or code...');
    await expect(searchInput).toBeVisible();
  });

  test('should perform color search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by color name, brand, or code...');
    await searchInput.fill('blue');

    // Wait for search to trigger (debounced)
    await page.waitForTimeout(500);

    // Should show search results or mock data
    const resultsSection = page.locator('text=Search Results').locator('..');
    await expect(resultsSection).toBeVisible();
  });

  test('library page should show empty state initially', async ({ page }) => {
    await page.getByRole('link', { name: 'Library' }).click();

    const emptyMessage = page.locator('text=No colors in your library yet');
    await expect(emptyMessage).toBeVisible();
  });

  test('palettes page should show empty state initially', async ({ page }) => {
    await page.getByRole('link', { name: 'Palettes' }).click();

    const emptyMessage = page.locator('text=No palettes yet');
    await expect(emptyMessage).toBeVisible();

    const goToLibraryButton = page.getByRole('button', { name: 'Go to Library' });
    await expect(goToLibraryButton).toBeVisible();
  });

  test('labels page should show controls and empty preview', async ({ page }) => {
    await page.getByRole('link', { name: 'Labels' }).click();

    // Check for layout options
    await expect(page.getByText('Layout Style')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Default' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Minimal' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Detailed' })).toBeVisible();

    // Check for display options
    await expect(page.getByText('Display Options')).toBeVisible();
    await expect(page.getByText('Show Brand Name')).toBeVisible();
    await expect(page.getByText('Show Color Code')).toBeVisible();

    // Check empty state
    const emptyMessage = page.locator('text=No colors selected');
    await expect(emptyMessage).toBeVisible();

    const selectColorsButton = page.getByRole('button', { name: 'Select Colors' });
    await expect(selectColorsButton).toBeVisible();
  });

  test('should switch between label layouts', async ({ page }) => {
    await page.getByRole('link', { name: 'Labels' }).click();

    const defaultButton = page.getByRole('button', { name: 'Default' });
    const minimalButton = page.getByRole('button', { name: 'Minimal' });
    const detailedButton = page.getByRole('button', { name: 'Detailed' });

    // Default should be selected initially
    await expect(defaultButton).toHaveClass(/border-primary-500/);

    // Click minimal
    await minimalButton.click();
    await expect(minimalButton).toHaveClass(/border-primary-500/);
    await expect(defaultButton).not.toHaveClass(/border-primary-500/);

    // Click detailed
    await detailedButton.click();
    await expect(detailedButton).toHaveClass(/border-primary-500/);
    await expect(minimalButton).not.toHaveClass(/border-primary-500/);
  });

  test('should toggle display options', async ({ page }) => {
    await page.getByRole('link', { name: 'Labels' }).click();

    const brandCheckbox = page.locator('input[type="checkbox"]').nth(0);
    const codeCheckbox = page.locator('input[type="checkbox"]').nth(1);
    const rgbCheckbox = page.locator('input[type="checkbox"]').nth(2);

    // Check initial states
    await expect(brandCheckbox).toBeChecked();
    await expect(codeCheckbox).toBeChecked();
    await expect(rgbCheckbox).not.toBeChecked();

    // Toggle brand checkbox
    await brandCheckbox.uncheck();
    await expect(brandCheckbox).not.toBeChecked();

    // Toggle RGB checkbox
    await rgbCheckbox.check();
    await expect(rgbCheckbox).toBeChecked();
  });

  test('should have responsive navigation', async ({ page, viewport }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigation should still be visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // All nav links should be accessible
    await expect(page.getByRole('link', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Library' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Palettes' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Labels' })).toBeVisible();
  });
});

test.describe('LocalStorage Persistence', () => {
  test('should persist library data across page reloads', async ({ page, context }) => {
    // Mock localStorage data
    await context.addInitScript(() => {
      const mockLibrary = [
        {
          id: 'test-color-1',
          name: 'Test Blue',
          brand: 'Test Brand',
          hex: '#0000FF',
          rgb: [0, 0, 255],
          addedAt: new Date().toISOString()
        }
      ];
      window.localStorage.setItem('colorLabelApp_library', JSON.stringify(mockLibrary));
    });

    // Navigate to library page
    await page.goto('/library');

    // Should display the saved color
    await expect(page.locator('text=Test Blue')).toBeVisible();
    await expect(page.locator('text=Test Brand')).toBeVisible();
  });

  test('should persist palette data across page reloads', async ({ page, context }) => {
    // Mock localStorage data
    await context.addInitScript(() => {
      const mockPalettes = [
        {
          id: 'test-palette-1',
          name: 'My Test Palette',
          colors: [
            {
              id: 'color-1',
              name: 'Red',
              brand: 'Test',
              hex: '#FF0000',
              rgb: [255, 0, 0]
            },
            {
              id: 'color-2',
              name: 'Blue',
              brand: 'Test',
              hex: '#0000FF',
              rgb: [0, 0, 255]
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      window.localStorage.setItem('colorLabelApp_palettes', JSON.stringify(mockPalettes));
    });

    // Navigate to palettes page
    await page.goto('/palettes');

    // Should display the saved palette
    await expect(page.locator('text=My Test Palette')).toBeVisible();
    await expect(page.locator('text=2 colors')).toBeVisible();
  });
});