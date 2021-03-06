import puppeteer from "puppeteer";
import { expect } from 'chai';
import HomePage from "./POM/Home";
import NavHeader from "./POM/Nav";
import {SettingsPage} from "./POM/Settings";
import dotenv from  'dotenv';
dotenv.config();

// puppeteer options
const opts = {
    headless: true,
    slowMo: 0,
    args: ["--enable-low-end-device-mode"],
};

// testing local options
const base = process.env.SITE_URL;
const site = {
    home: `${base}/#/`,
    settings: `${base}/#/settings`,
};

describe('App', function() {
    this.timeout(5000);

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

    it("A consent to notifications button is shown if the user has not been asked before", async () => {
        const home = new HomePage(page);
        expect(await home.notificationConsentBtnElement()).to.not.be.null;

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
        await page.waitForSelector(SettingsPage.selector.header);
        expect(await page.url()).to.equal(site.settings);
        let element = await page.$(SettingsPage.selector.header);
        await expect(element).to.not.eq({});
    });

    it("Clicking on the home link from settings takes you back to the homepage", async () => {
        let settings = new SettingsPage(page);
        await settings.go();
        expect(await page.url()).to.eq(site.settings);
        await settings.navHeader.clickHome();
        await page.waitForSelector("#home-greeting");
    });

    it("Clicking on the settings link from the homepage takes you to the settings page", async () => {
        let home = new HomePage(page);
        await home.go();
        await home.navHeader.clickSettings();
        await page.waitForSelector(SettingsPage.selector.header);
        expect(await page.url()).to.eq(site.settings);
    });

    it("When visiting the settings page, the first form input is focused", async () => {
       const instanceSettingsPage = new SettingsPage(page);
       const activeElementID = await instanceSettingsPage.page.evaluate(() => document.activeElement.id);
       expect(activeElementID).to.eq(SettingsPage.birthdayInputID);
    });

    it('Saving your birthday reminder navigates to the homepage with the new birthday', async () => {
        const changeSettingsPage = new SettingsPage(page);
        await changeSettingsPage.go();
        let currentDayOnly = new Date();
        currentDayOnly.setUTCHours(0,0,0,0);

        await changeSettingsPage.fillInBirthDay(currentDayOnly);
        let home = await changeSettingsPage.submitBirthDayReminder();
        let homeDateString = await home.getBirthdayReminderISODate();
        await expect(page.url()).to.eq(site.home);
        expect(await home.navHeader.activeNavID()).to.eq(NavHeader.homeNavID);
        expect(homeDateString).to.eq(currentDayOnly.toISOString());
    });

    it("Refreshing the homepage with a far out reminder still shows it as upcoming", async () => {
        const changeSettingsPage = new SettingsPage(page);
        await changeSettingsPage.go();
        let oldYear = new Date();
        oldYear.setFullYear(1910);
        oldYear.setUTCHours(0, 0, 0, 0);
        await changeSettingsPage.fillInBirthDay(oldYear);
        let home = await changeSettingsPage.submitBirthDayReminder();
        // Wait for notification to trigger
        await home.page.waitForTimeout(2500);
        let reminderPast = await home.pastReminder();
        expect(reminderPast).to.not.be.null;


        await changeSettingsPage.go();
        let farOutReminder = new Date();
        farOutReminder.setFullYear(2022);
        farOutReminder.setUTCHours(0, 0, 0, 0);
        await changeSettingsPage.fillInBirthDay(farOutReminder);
        home = await changeSettingsPage.submitBirthDayReminder();
        await home.page.waitForTimeout(1500);

        // Refresh page to reload state from offline storage
        await home.go();
        reminderPast = await home.pastReminder();
        await home.getBirthdayReminderISODate();
        expect(reminderPast).to.be.null;
    })
});