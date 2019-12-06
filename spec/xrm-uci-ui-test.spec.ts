import { XrmUiTest } from "../src";
import * as fs from "fs";
import * as puppeteer from "puppeteer";
import * as path from "path";

const xrmTest = new XrmUiTest();
let browser: puppeteer.Browser = undefined;
let page: puppeteer.Page = undefined;
const guidRegex = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

describe("Basic operations UCI", () => {
  beforeAll(async () => {
    jest.setTimeout(60000);

    const config = fs.readFileSync(
      path.resolve(__dirname, "../../settings.txt"),
      {
        encoding: "utf-8"
      }
    );
    const [url, user, password] = config.split(",");

    browser = await xrmTest.launch({
      headless: false,
      args: ["--start-fullscreen"]
    });

    page = await xrmTest.open(url, { userName: user, password: password });
  });

  test("It should set string field", async () => {
    jest.setTimeout(60000);

    await xrmTest.Navigation.openCreateForm("account");

    await xrmTest.Attribute.setValue("name", "Test name");

    const value = await xrmTest.Attribute.getValue("name");
    expect(value).toBe("Test name");

    await xrmTest.Form.reset();
  });

  test("It should set option field", async () => {
    jest.setTimeout(60000);
    await xrmTest.Navigation.openCreateForm("account");

    await xrmTest.Attribute.setValue("customertypecode", 3);

    const value = await xrmTest.Attribute.getValue("customertypecode");
    expect(value).toBe(3);

    await xrmTest.Form.reset();
  });

  test("It should set boolean field", async () => {
    jest.setTimeout(60000);
    await xrmTest.Navigation.openCreateForm("account");

    await xrmTest.Attribute.setValue("msdyn_taxexempt", true);

    const value = await xrmTest.Attribute.getValue("msdyn_taxexempt");
    expect(value).toBe(true);

    await xrmTest.Form.reset();
  });

  test("It should set money field", async () => {
    jest.setTimeout(60000);
    await xrmTest.Navigation.openCreateForm("account");

    await xrmTest.Attribute.setValue("creditlimit", 123.12);

    const value = await xrmTest.Attribute.getValue("creditlimit");
    expect(value).toBe(123.12);

    await xrmTest.Form.reset();
  });

  test("It should click Save command button by name", async () => {
    jest.setTimeout(60000);

    await xrmTest.Navigation.openCreateForm("lead");
    await xrmTest.Attribute.setValue("subject", "Test Subject");
    await xrmTest.Attribute.setValue("lastname", "Test Last Name");

    await xrmTest.Navigation.clickCommand("Save");

    await page.waitForNavigation({
      waitUntil: "networkidle0",
      timeout: 0
    });

    return await xrmTest.Entity.getId().then(id =>
      expect(id).toMatch(guidRegex)
    );
  });

  test("It should click Qualify command button by name", async () => {
    jest.setTimeout(60000);

    await xrmTest.Navigation.openCreateForm("lead");
    await xrmTest.Attribute.setValue("subject", "Test Subject");
    await xrmTest.Attribute.setValue("lastname", "Test Last Name");
    await xrmTest.Entity.save();

    await xrmTest.Navigation.clickCommand("Qualify");

    await page.waitForSelector("li[id*='parentcontactid']");

    return await xrmTest.Entity.getEntityName().then(name =>
      expect(name.toLowerCase()).toMatch("opportunity")
    );
  });

  /*
    test("It should set lookup", async () => {
        jest.setTimeout(60000);
        await xrmTest.Navigation.openCreateForm("account");

        const lookup = {entityType: "oss_country", id: "{FF4F3346-8CFB-E611-80FE-5065F38B06F1}", name: "AT"};
        await xrmTest.Attribute.setValue("oss_countryid", [lookup]);

        const [value] = await xrmTest.Attribute.getValue("oss_countryid");
        expect(value.id).toBe(lookup.id);
        expect(value.entityType).toBe(lookup.entityType);
        expect(value.name).toBe(lookup.name);

        await xrmTest.Entity.reset();
    });*/

  /*test("It should create and delete record", async () => {
        jest.setTimeout(60000);
        await xrmTest.Navigation.openCreateForm("account");

        await xrmTest.Attribute.setValue("name", "Test New Foo");

        const lookup = {entityType: "orb_country", id: "{FF4F3346-8CFB-E611-80FE-5065F38B06F1}", name: "AT"};
        await xrmTest.Attribute.setValue("orb_countryid", [lookup]);

        await xrmTest.Entity.save();
        await xrmTest.Dialog.confirmDuplicateDetection();

        await xrmTest.Entity.delete();
    });*/

  /*
    test("It should set quick create fields", async () => {
        jest.setTimeout(60000);

        await xrmTest.Navigation.openQuickCreate("account");
        console.log("Form open");
        await xrmTest.Attribute.setValue("name", "Test name");
        await page.waitFor(50000);
        const value = await xrmTest.Attribute.getValue("name");
        expect(value).toBe("Test name");

        await xrmTest.Form.reset();
    });
    */

  afterAll(() => {
    return xrmTest.close();
  });
});

