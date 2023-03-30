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

async function getCoordinatesOverride(): Promise<[number, number]> {
  const coords: number[] = [];
  const statusBar = new StatusBar();
  const coordinates = <RegExpMatchArray>(await statusBar.getCurrentPosition()).match(/\d+/g);
  for (const c of coordinates) {
    coords.push(+c);
  }
  return [coords[0], coords[1]];
}

describe("Serverless workflow editor - Diagram navigation tests", () => {
  const TEST_PROJECT_FOLDER: string = path.resolve("it-tests-tmp", "resources", "diagram-navigation");

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
    await testHelper.closeAllEditors();
    await testHelper.closeAllNotifications();
  });

  it("Select states", async function () {
    this.timeout(100000);
    console.log("START");

    const controls = new TitleBar().getWindowControls();
    await controls.maximize();

    VSBrowser.instance.takeScreenshot("error-screenshot");

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
