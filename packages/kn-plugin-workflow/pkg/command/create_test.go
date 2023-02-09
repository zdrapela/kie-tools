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

type testCreate struct {
	input    CreateCmdConfig
	expected string
}

var testRunCreateSuccess = []testCreate{
	{input: CreateCmdConfig{ProjectName: "new-project", Extesions: ""}, expected: ""},
	{input: CreateCmdConfig{ProjectName: "second-project", Extesions: ""}, expected: ""},
}

func fakeRunCreate(testIndex int) func(command string, args ...string) *exec.Cmd {
	return func(command string, args ...string) *exec.Cmd {
		cs := []string{"-test.run=TestHelperRunCreate", "--", command}
		cs = append(cs, args...)
		cmd := exec.Command(os.Args[0], cs...)
		cmd.Env = []string{fmt.Sprintf("GO_TEST_HELPER_RUN_CREATE_IMAGE=%d", testIndex)}
		return cmd
	}
}

func TestHelperRunCreate(t *testing.T) {
	testIndex, err := strconv.Atoi(os.Getenv("GO_TEST_HELPER_RUN_CREATE_IMAGE"))
	if err != nil {
		return
	}
	fmt.Fprintf(os.Stdout, "%v", testRunCreateSuccess[testIndex].expected)
	os.Exit(0)
}

func TestRunCreate_Success(t *testing.T) {
	for testIndex, test := range testRunCreateSuccess {
		common.ExecCommand = fakeRunCreate(testIndex)
		defer func() { common.ExecCommand = exec.Command }()

		err := runCreateProject(test.input) //out,
		if err != nil {
			t.Errorf("Expected nil error, got %#v", err)
		}

		// if out != test.expected {
		// 	t.Errorf("Expected %v, got %v", test.expected, out)
		// }
	}
}
