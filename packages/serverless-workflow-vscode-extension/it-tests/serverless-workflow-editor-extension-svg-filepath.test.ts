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

import * as path from "path";
import * as fs from "fs";
import { assert, expect } from "chai";
import { VSCodeTestHelper, sleep } from "@kie-tools/vscode-extension-common-test-helpers";
import SwfEditorTestHelper from "./helpers/swf/SwfEditorTestHelper";
import SwfTextEditorTestHelper from "./helpers/swf/SwfTextEditorTestHelper";

describe.only("Serverless workflow editor - SVG generation integration tests", () => {
  const TEST_PROJECT_FOLDER: string = path.resolve("it-tests-tmp", "resources", "svg-filepath");
  const DIST_IT_TESTS_FOLDER: string = path.resolve("dist-it-tests");

  const FILE_NAME_NO_EXTENSION: string = "hello-world";
  const WORKFLOW_NAME: string = `${FILE_NAME_NO_EXTENSION}.sw.json`;
  const SVG_NAME: string = `${FILE_NAME_NO_EXTENSION}.svg`;
  const RESOURCE_DIRECTORY_PATH: string = path.join("src", "main", "resources");

  let testHelper: VSCodeTestHelper;

  before(async function () {
    this.timeout(60000);
    testHelper = new VSCodeTestHelper();
    await testHelper.openFolder(TEST_PROJECT_FOLDER);
  });

  beforeEach(async function () {
    this.timeout(15000);
    await testHelper.closeAllEditors();
    await testHelper.closeAllNotifications();
  });

  afterEach(async function () {
    this.timeout(15000);
    await testHelper.takeScreenshotOnTestFailure(this, DIST_IT_TESTS_FOLDER);
    await testHelper.closeAllEditors();
    await testHelper.closeAllNotifications();
  });

  it(`Opens ${WORKFLOW_NAME}, saves it, and verifies SVG generation`, async function () {
    this.timeout(30000);

    const editorWebViews = await testHelper.openFileFromSidebar(WORKFLOW_NAME, RESOURCE_DIRECTORY_PATH);

    await testHelper.saveFileInTextEditor();

    // verify SVG was generated after file save
    const SVG_FILE_PATH: string = path.resolve(TEST_PROJECT_FOLDER, RESOURCE_DIRECTORY_PATH, SVG_NAME);
    // assert(fs.existsSync(SVG_FILE_PATH), `SVG file was not generated at path: ${SVG_FILE_PATH}.`);
    expect(fs.readFileSync(SVG_FILE_PATH, "utf-8")).to.match(
      new RegExp("<svg.*<\\/svg>"),
      `SVG file was not generated correctly at path: ${SVG_FILE_PATH}.`
    );
  });

  it(`Changes settings, opens ${WORKFLOW_NAME}, saves it, and verifies SVG generation`, async function () {
    this.timeout(40000);

    const changedDirectory = path.join("META-INF", "processSVG");

    // set different filepapth for SVG generation
    const previousSettingValue = (await testHelper.setVSCodeSetting(
      path.join("${workspaceFolder}", changedDirectory),
      "Svg File Path",
      "Kogito",
      "Swf"
    )) as string;

    const editorWebViews = await testHelper.openFileFromSidebar(WORKFLOW_NAME, RESOURCE_DIRECTORY_PATH);

    // save file and wait for the SVG generation
    await testHelper.saveFileInTextEditor();
    await sleep(1000);

    // verify SVG was generated after file save
    const SVG_FILE_PATH: string = path.resolve(TEST_PROJECT_FOLDER, changedDirectory, SVG_NAME);
    expect(fs.readFileSync(SVG_FILE_PATH, "utf-8")).to.match(
      new RegExp("<svg.*<\\/svg>"),
      `SVG file was not generated correctly at path: ${SVG_FILE_PATH}.`
    );

    // Set back the previous setting value
    await testHelper.setVSCodeSetting(previousSettingValue, "Svg File Path", "Kogito", "Swf");
  });
});
