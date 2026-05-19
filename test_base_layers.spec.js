const { test, expect } = require('@playwright/test');

test('Verify layer persistence on base layer switch', async ({ page }) => {
    // Navigate to local index.html
    await page.goto('file://' + require('path').resolve('index.html'));
    
    // Wait for map to initialize and some overlay layers to be added.
    await page.waitForTimeout(2000);
    
    // Add Google Labels
    await page.click('button:has-text("Labels")');
    await page.waitForTimeout(500);
    
    // Switch to OSM base layer
    await page.click('#base-osm');
    await page.waitForTimeout(1000);
    
    // Evaluate in browser to check if layers are still present
    const layersIntact = await page.evaluate(() => {
        let hasImpacted = false;
        let hasGoogleLabels = false;
        let activeBaseCount = 0;
        
        map.eachLayer(l => {
            if (l === impactedVillages) hasImpacted = true;
            if (l === googleLabels) hasGoogleLabels = true;
            // Check if active base layer is the ONLY base layer
            Object.values(window.baseLayers).forEach(bl => {
                if (l === bl) activeBaseCount++;
            });
        });
        
        return { hasImpacted, hasGoogleLabels, activeBaseCount };
    });
    
    console.log("Layers intact check:", layersIntact);
    expect(layersIntact.hasImpacted).toBeTruthy();
    expect(layersIntact.hasGoogleLabels).toBeTruthy();
    expect(layersIntact.activeBaseCount).toBe(1);
    
    // Now check visual order (wms layers might be covered)
    // Actually we can just fix the logic in ui.js to use bringToBack() and remove the eachLayer hack.
});
