import { XrmUiTest } from "../src";
import * as playwright from "playwright";
import * as fs from "fs";

const xrmTest = new XrmUiTest();
let browser: playwright.Browser;
let page: playwright.Page;

const takeScreenShotOnFailure = (testName: string, func: () => any): any => {
    return async () => {
        try {
            return await func();
        }
        catch (e) {
            const reportsExists = await new Promise((resolve, reject) => fs.exists("reports", (exists) => resolve(exists)));

            if (!reportsExists) {
                await new Promise((resolve, reject) => fs.mkdir("reports", (err) => err ? reject(err) : resolve()));
            }

            await page.screenshot({path: `./${testName}.png`, });
            throw e;
        }
    };
};

describe("Basic operations UCI", () => {
    beforeAll(() => {
        jest.setTimeout(60000);

        return xrmTest.launch({
            headless: true,
            args: ["--start-fullscreen"]
        })
        .then(b => {
            browser = b;

            return browser.newPage();
        })
        .then(p => {
            page = p;
            return page.setViewportSize({ width: 1920, height: 1080 });
        });
    });

    test("It should create email", takeScreenShotOnFailure("emailTest", async () => {
        jest.setTimeout(60000);

        await page.goto("https://demo.microsoftcrmportals.com/de-DE/");

        const link = await page.waitForSelector("a[href*='kontakt']");
        await link.click();

        const emailLink = await page.waitForSelector("a[href*='email']");
        await emailLink.click();

        await page.waitForSelector("#demo_firstname");
        await page.type("#demo_firstname", "UI Test Firstname");
        await page.type("#demo_lastname", "UI Test Lastname");

        await page.type("#emailaddress", "uitest@orbis.de");
        await page.type("#demo_street", "Planckstraße 10");
        await page.type("#demo_zippostalcode", "88677");
        await page.type("#demo_city", "Markdorf");
        await page.selectOption("#demo_countrycode", "100000085");
        await page.type("#title", "Automated UI Test");

        await page.type("#description", "UI Test Firstname");

        await page.evaluate(() => {
            (document.querySelector("#InsertButton") as any).click();
        });

        await page.waitForNavigation({ waitUntil: "networkidle" });

        const successDiv = await page.$(".alert-case-created");
        expect(successDiv).toBeDefined();
    }));

    afterAll(() => {
        return xrmTest.close();
    });
});