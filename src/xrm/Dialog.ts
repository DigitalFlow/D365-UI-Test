import * as puppeteer from "puppeteer";

export class Dialog {
    private _page: puppeteer.Page;

    constructor(page: puppeteer.Page) {
        this._page = page;
    }

    confirmDuplicateDetection = async() => {
        await this._page.waitFor(2000);
        const confirmButton = await this._page.$("#butBegin") || await this._page.$("button[data-id='ignore_save']");

        if (confirmButton) {
            await confirmButton.click();

            await this._page.waitFor(() => !document.querySelector("#butBegin") && !document.querySelector("button[data-id='ignore_save']"));

            await this._page.waitForNavigation({ waitUntil: "networkidle2" });
            await this._page.waitFor(2000);
        }
    }
}