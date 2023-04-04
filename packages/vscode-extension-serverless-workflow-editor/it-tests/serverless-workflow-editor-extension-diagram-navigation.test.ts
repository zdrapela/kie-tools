/*
 * Copyright 2023 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from "chai";
import * as path from "path";
import { StatusBar, TitleBar, VSBrowser } from "vscode-extension-tester";
import SwfEditorTestHelper from "./helpers/swf/SwfEditorTestHelper";
import SwfTextEditorTestHelper from "./helpers/swf/SwfTextEditorTestHelper";
import VSCodeTestHelper, { sleep } from "./helpers/VSCodeTestHelper";
// import { before } from 'vscode-extension-tester'
import * as fs from "fs";

// async function takeScreenshotAndMoveToDist(name:string) {
//   // await VSBrowser.instance.takeScreenshot(name);
//   // // console.log("TEST_PROJECT_FOLDER: "+TEST_PROJECT_FOLDER);
//   // const originalScreenshotPath = path.join(__dirname, "../test-resources/screenshots/"+ name+".png");
//   // console.log(originalScreenshotPath);
//   // const newScreenshotPath = path.join(__dirname, "../dits-it-tests/"+ name+".png");
//   // console.log(newScreenshotPath);
//   // fs.rename(originalScreenshotPath, newScreenshotPath,(err) => {
//   //   if (err) throw err;
//   //   console.log(`File '${originalScreenshotPath}' has been moved to '${newScreenshotPath}'.`);
//   // });
//   const data = await this._driver.takeScreenshot();
//   const dir = path.join(__dirname,'NEW_SCREENSHOTS');
//   fs.mkdirSync(dir);
//   fs.writeFileSync(path.join(dir, `${name}.png`), data, 'base64');
// }

describe("Serverless workflow editor - Diagram navigation tests", () => {
  const TEST_PROJECT_FOLDER: string = path.resolve("it-tests-tmp", "resources", "diagram-navigation");
  const DIST_IT_TESTS_FOLDER: string = path.resolve("dist-it-tests");

  let testHelper: VSCodeTestHelper;

  before(async function () {
    this.timeout(30000);
    testHelper = new VSCodeTestHelper();
    await testHelper.openFolder(TEST_PROJECT_FOLDER, "diagram-navigation");
  });

  beforeEach(async function () {
    this.timeout(30000);
    await testHelper.closeAllEditors();
    await testHelper.closeAllNotifications();
  });

  afterEach(async function () {
    this.timeout(30000);
    if (this.currentTest && this.currentTest?.state !== "passed") {
      console.log("IS FAILED, taking screenshot");
      const screenshotDir = path.join(DIST_IT_TESTS_FOLDER, "screenshots-failed-tests");
      testHelper.takeScreenshotAndSave(this.currentTest.fullTitle(), screenshotDir);
    }
    await testHelper.closeAllEditors();
    await testHelper.closeAllNotifications();
  });

  it("Select states", async function () {
    this.timeout(100000);
    console.log("START");

    const controls = new TitleBar().getWindowControls();
    await controls.maximize();

    const WORKFLOW_NAME = "applicant-request-decision.sw.json";

    const editorWebViews = await testHelper.openFileFromSidebar(WORKFLOW_NAME);
    const swfTextEditor = new SwfTextEditorTestHelper(editorWebViews[0]);
    const swfEditor = new SwfEditorTestHelper(editorWebViews[1]);
    console.log("AFTER OPEN FILE");

    const nodeIds = await swfEditor.getAllNodeIds();
    expect(nodeIds.length).equal(6);
    console.log("AFTER GET ALL");

    // Select CheckApplication node
    await swfEditor.selectNode(nodeIds[1]);
    console.log("AFTER SELECT NODE");
    const statusbar = new StatusBar();
    statusbar.wait(10000);
    console.log("const statusbar = new StatusBar();");
    await sleep(2000);
    await statusbar.closeNotificationsCenter();
    const items = await statusbar.getItems();
    await sleep(2000);
    console.log("const items = await statusbar.getItems();");

    const posString = await statusbar.getCurrentPosition();
    console.log("const posString = await statusbar.getCurrentPosition();");
    console.log("POSITION STRING: " + posString);

    const textEditor = await swfTextEditor.getSwfTextEditor();
    console.log("const textEditor = await swfTextEditor.getSwfTextEditor();");
    expect(await textEditor.getCoordinates()).to.deep.equal([16, 7]);
    console.log("expect(await textEditor.getCoordinates()).to.deep.equal([16,7]);");
    let lineNumber = (await textEditor.getCoordinates())[0];
    console.log("let lineNumber = (await textEditor.getCoordinates())[0];");
    let columnNumber = (await textEditor.getCoordinates())[1];
    console.log("let columnNumber = (await textEditor.getCoordinates())[1];");

    expect(lineNumber).equal(16);
    expect(columnNumber).equal(7);
    console.log("AFTER EXPECT");

    // Select StartApplication node
    await swfEditor.selectNode(nodeIds[2]);
    lineNumber = (await textEditor.getCoordinates())[0];
    columnNumber = (await textEditor.getCoordinates())[1];
    console.log("AFTER GET COORDINATES");

    expect(lineNumber).equal(33);
    expect(columnNumber).equal(7);
    console.log("AFTER SECOND EXPECT");
  });
});
