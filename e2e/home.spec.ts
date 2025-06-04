import { test, expect } from '@playwright/test'
import { HomePage } from './pages/home.page'
import { testConfig } from './fixtures/test-data'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load home page successfully', async ({ page }) => {
    const homePage = new HomePage(page)
    
    await homePage.navigateToHome()
    expect(await homePage.isHomePageLoaded()).toBe(true)
  })

  test('should display navigation menu', async ({ page }) => {
    const homePage = new HomePage(page)
    
    await homePage.navigateToHome()
    expect(await homePage.isNavigationVisible()).toBe(true)
  })

  test('should toggle theme when theme button is clicked', async ({ page }) => {
    const homePage = new HomePage(page)
    
    await homePage.navigateToHome()
    
    const initialTheme = await page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    )
    
    await homePage.toggleTheme()
    
    const newTheme = await page.evaluate(() => 
      document.documentElement.classList.contains('dark')
    )
    
    expect(newTheme).not.toBe(initialTheme)
  })

  test('should take screenshot on failure', async ({ page }) => {
    const homePage = new HomePage(page)
    
    await homePage.navigateToHome()
    expect(await homePage.isHomePageLoaded()).toBe(true)
  })

  test('should respect timeout settings', async ({ page }) => {
    const homePage = new HomePage(page)
    
    await test.step('Load page with custom timeout', async () => {
      await page.goto('/', { timeout: testConfig.longTimeout })
      await homePage.waitForPageLoad()
    })
    
    expect(await homePage.isHomePageLoaded()).toBe(true)
  })
}) 