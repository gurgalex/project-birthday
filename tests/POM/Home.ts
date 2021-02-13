import {Page} from "puppeteer";
import NavPage from "./Nav";

export default class HomePage {
    static route = "/"

    static homeGreetingID = "home-greeting";
    static notificationConsentID = "notification-consent";
    static settingsSetupID = "settings-setup-btn";
    static firstTimeSetupID = "first-time-setup";
    static nextBirthdayReminderID = "when-next-birthday";
    static query = {
        homeGreeting: `#${HomePage.homeGreetingID}`,
        firstTimeSetupGreeting: `#${HomePage.firstTimeSetupID}`,
        settingsSetupBtn: `#${HomePage.settingsSetupID}`,
        notificationConsentBtn: `#${HomePage.notificationConsentID}`,
        nextBirthdayReminder: `#${HomePage.nextBirthdayReminderID}`,
    }
    private readonly page: Page;
    public navHeader: NavPage;
    constructor(page: Page) {
        this.page = page;
        this.navHeader = new NavPage(this.page);
    }

    async go() {
        await this.page.goto(process.env.SITE_URL + HomePage.route);
        await this.page.waitForSelector(HomePage.query.homeGreeting);
        return this;
    }

    async notificationConsentBtnElement() {
        return await this.page.$(HomePage.query.notificationConsentBtn);
    }

    async firstTimeSetupGreetingElement() {
        return await this.page.waitForSelector(HomePage.query.firstTimeSetupGreeting);
    }

    async changeSettingsBtnElement() {
        await this.page.waitForSelector(HomePage.query.settingsSetupBtn);
        return await this.page.$(HomePage.query.settingsSetupBtn);
    }

    async getBirthdayReminderISODate(): Promise<string | null> {
        await this.page.waitForSelector(HomePage.query.nextBirthdayReminder);
        let homeWhenBirthday = await this.page.$(HomePage.query.nextBirthdayReminder);
        // @ts-ignore
        return await homeWhenBirthday.evaluate(el => el.dataset.date);
    }
}