import * as puppeteer from "puppeteer";
import { EnsureXrmGetter } from "./Global";
import { XrmUiTest } from "./XrmUITest";

/**
 * State of a control
 */
export interface ControlState {
    /**
     * Whether the control is currently visible
     */
    isVisible: boolean;

    /**
     * Whether the control is currently disabled
     */
    isDisabled: boolean;
}

/**
 * Module for interacting with D365 Controls
 */
export class Control {
    private _page: puppeteer.Page;

    constructor(private xrmUiTest: XrmUiTest) {
        this._page = xrmUiTest.page;
        this.xrmUiTest = xrmUiTest;
    }

    /**
     * Gets the state of the specified control
     * @param controlName Name of the control to retrieve
     * @returns Promise which fulfills with the current control state
     */
    get = async (controlName: string): Promise<ControlState> => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((controlName: string) => {
            const xrm = window.oss_FindXrm();
            const control = xrm.Page.getControl(controlName);

            return {
                isVisible: control.getVisible(),
                isDisabled: (control as any).getDisabled() as boolean
            };
        }, controlName);
    }

    /**
     * Gets the options of the specified option set control
     * @param controlName Name of the control to retrieve
     * @returns Promise which fulfills with the control's options
     */
    getOptions = async (controlName: string): Promise<Array<Xrm.OptionSetValue>> => {
        await EnsureXrmGetter(this._page);

        return this._page.evaluate((controlName: string) => {
            const xrm = window.oss_FindXrm();
            const control = xrm.Page.getControl<Xrm.Controls.OptionSetControl>(controlName);

            return (control as any).getOptions();
        }, controlName);
    }
}