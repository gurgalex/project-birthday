import {Page} from "puppeteer";
import HomePage from "./Home";
import {SettingsPage} from "./Settings";

export default class NavPage {
    static homeNavID = "home-link";
    static settingsNavID = "settings-link";
    private readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async clickHome(): Promise<HomePage> {
        await this.page.waitForSelector("nav");
        const query = `#${NavPage.homeNavID}`
        const link = await this.page.$(`${query}`);
        if (link == null) {
            throw Error(`Nav Home link is missing using query: ${query}`)
        }
        await link.click();
        return new HomePage(this.page);
    }

    async clickSettings(): Promise<SettingsPage> {
        await this.page.waitForSelector("nav");
        const query = `#${NavPage.settingsNavID}`
        const link = await this.page.$(query);
        if (link == null) {
            throw Error(`Nav Settings link is missing using query: ${query}`)
        }
        await link.click();
        return new SettingsPage(this.page);
    }

    async getActiveNavElement() {
        await this.page.waitForSelector("nav [aria-current='page']");
        return await this.page.$("nav [aria-current='page']");
    }

    async activeNavID(): Promise<string | null> {
        const activeLink = await this.getActiveNavElement();
        if (activeLink == null) {
            return null;
        }
        return await activeLink.evaluate(el => el.id);

    }
}
