import puppeteer from "puppeteer";
import { expect } from 'chai';
import HomePage from "./testPOM/Home";
import NavHeader from "./testPOM/Nav";
import {SettingsPage} from "./testPOM/Settings";

// puppeteer options
const opts = {
    headless: true,
    slowMo: 0,
    args: ["--enable-low-end-device-mode"],
};

// testing local options
const base = "https://localhost:8080";
const site = {
    home: `${base}/#/`,
    settings: `${base}/#/settings`,
};

describe('App', () => {

    before(async () => {
        // @ts-ignore
        global.browser = await puppeteer.launch(opts);
        // @ts-ignore
        global.page = await browser.newPage();
        page.setDefaultTimeout(5000);
        console.log("Launch the global browser");
    });
    after(async () => {
       await page.close();
       await browser.close();
       console.log("Closed the global browser");
    });

    it("The homepage loads", async () => {
        const home = new HomePage(page);
        await home.go();
    });

    it("The currently viewed page is shown as active in the navigation list", async () => {
        const home = new HomePage(page);
        let currentPageNavID = await home.navHeader.activeNavID();
        expect(currentPageNavID).to.eq(NavHeader.homeNavID);
});
    it("Changing to and from settings using nav links keeps correct active link", async () => {
        const home = new HomePage(page);
        const nav = home.navHeader;
        await nav.clickSettings();
        expect(await nav.activeNavID()).to.eq(NavHeader.settingsNavID);
        await nav.clickHome();
        expect(await nav.activeNavID()).to.eq(NavHeader.homeNavID);
    })

    it("Prompt the user to setup their birthday if they have not used the site before", async () => {
        const home = new HomePage(page);
        await home.firstTimeSetupGreetingElement();
    });

    it('Show an edit settings button on the home page', async () => {
        const home = new HomePage(page);
        const settingsElement = await home.changeSettingsBtnElement();
        expect(settingsElement).to.not.eq(null);
    });

    it('Navigate to the Settings page when clicking the setup button', async () => {
        const home = new HomePage(page);
        const setupSettingsBtn = await home.changeSettingsBtnElement();
        await setupSettingsBtn.click();
        await page.waitForSelector('#settings-header');
        expect(await page.url()).to.equal(site.settings);
        let element = await page.$('#settings-header');
        await expect(element).to.not.eq({});
    });

    it("Clicking on the home link from settings takes you back to the homepage", async () => {
        await page.goto(site.settings);
        await page.waitForSelector('#settings-header');
        expect(await page.url()).to.eq(site.settings);
        await page.click("#home-link");
        await page.waitForSelector("#home-greeting");
    });

    it("Clicking on the settings link from the homepage takes you to the settings page", async () => {
        await page.goto(site.home);
        await page.waitForSelector('#home-greeting');
        await page.click("#settings-link");
        await page.waitForSelector('#settings-header');
        expect(await page.url()).to.eq(site.settings);
    });


    it('Saving your birthday reminder navigates to the homepage with the new birthday', async () => {
        const changeSettingsPage = new SettingsPage(page);
        await changeSettingsPage.go();
        let currentDayOnly = new Date();
        currentDayOnly.setUTCHours(0,0,0,0);

        await changeSettingsPage.fillInBirthDay(currentDayOnly);
        let home = await changeSettingsPage.submitBirthDay();
        let homeDateString = await home.getBirthdayReminderISODate();
        await expect(page.url()).to.eq(site.home);
        expect(await home.navHeader.activeNavID()).to.eq(NavHeader.homeNavID);
        expect(homeDateString).to.eq(currentDayOnly.toISOString());

    });
})