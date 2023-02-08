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

package command

import (
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"testing"

	"github.com/kiegroup/kie-tools/packages/kn-plugin-workflow/pkg/common"
)

type testDeploy struct {
	input      DeployCmdConfig
	expected   bool
	createFile string
}

var testRunDeploySuccess = []testDeploy{
	{input: DeployCmdConfig{Path: "./target/kubernetes"}, expected: false, createFile: "kogito.yml"},
	{input: DeployCmdConfig{Path: ""}, expected: false, createFile: ""},
}

func fakeRunDeploy(testIndex int) func(command string, args ...string) *exec.Cmd {
	return func(command string, args ...string) *exec.Cmd {
		cs := []string{"-test.run=TestHelperRunDeploy", "--", command}
		cs = append(cs, args...)
		cmd := exec.Command(os.Args[0], cs...)
		cmd.Env = []string{fmt.Sprintf("GO_TEST_HELPER_RUN_DEPLOY_IMAGE=%d", testIndex)}
		return cmd
	}
}

func TestHelperRunDeploy(t *testing.T) {
	testIndex, err := strconv.Atoi(os.Getenv("GO_TEST_HELPER_RUN_DEPLOY_IMAGE"))
	if err != nil {
		return
	}
	fmt.Fprintf(os.Stdout, "%v", testRunDeploySuccess[testIndex].expected)
	os.Exit(0)
}

func TestRunDeploy_Success(t *testing.T) {
	for testIndex, test := range testRunDeploySuccess {
		common.ExecCommand = fakeRunDeploy(testIndex)
		defer func() { common.ExecCommand = exec.Command }()

		if test.createFile != "" {
			createFileInFolderStructure(t, test.createFile)
			defer deleteFolderStructure(t)
		}

		out, err := deployKnativeServiceAndEventingBindings(test.input)
		if err != nil {
			t.Errorf("Expected nil error, got %#v", err)
		}

		if out != test.expected {
			t.Errorf("Expected %v, got %v", test.expected, out)
		}
	}
}

func deleteFolderStructure(t *testing.T) {
	err := os.RemoveAll("./target")
	if err != nil {
		t.Error("Unable to delete folder structure")
	}
}

func createFileInFolderStructure(t *testing.T, fileName string) {
	err := os.MkdirAll("./target/kubernetes", 0750)
	if err != nil {
		t.Error("Unable to create folder structure")
	}
	file, err := os.Create("./target/kubernetes/" + fileName)
	if err != nil {
		t.Error("Unable to create" + fileName + "file")
	}
	defer file.Close()
}
