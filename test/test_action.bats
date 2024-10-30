#!/usr/bin/env bats

# Waited Env. Variable:
# - TEST_REPO_NAME: Name of the Repo (without the owner) and of the local directory contening its clone
# - TEST_REPO_ORG: Name of the Repo Owner
# - GH_TOKEN: Token used by gh cli

setup() {
	load 'test_helper/bats-support/load'
	load 'test_helper/bats-assert/load'
	load 'test_helper/bats-file/load'
}

@test "Develop branch is created on main branch" {
	sha_dev=$(gh api "repos/${TEST_REPO_ORG}/${TEST_REPO_NAME}/branches" --method GET --jq '.[] | select(.name == "develop") | .commit.sha')
	sha_main=$(gh api "repos/${TEST_REPO_ORG}/${TEST_REPO_NAME}/branches" --method GET --jq '.[] | select(.name == "main") | .commit.sha')
	assert_equal "$sha_dev" "$sha_main"
}

@test "Develop branch is not protected" {
	is_dev_protected=$(gh api "repos/${TEST_REPO_ORG}/${TEST_REPO_NAME}/branches" --method GET --jq '.[] | select(.name == "develop") | .protected')
	assert_equal "$is_dev_protected" "false"
}

@test "Feature branch is created on main branch" {
	sha_feature=$(gh api "repos/${TEST_REPO_ORG}/${TEST_REPO_NAME}/branches" --method GET --jq '.[] | select(.name == "feature") | .commit.sha')
	sha_main=$(gh api "repos/${TEST_REPO_ORG}/${TEST_REPO_NAME}/branches" --method GET --jq '.[] | select(.name == "main") | .commit.sha')
	assert_equal "$sha_feature" "$sha_main"
}

@test "Feature branch is protected" {
	is_feature_protected=$(gh api "repos/${TEST_REPO_ORG}/${TEST_REPO_NAME}/branches" --method GET --jq '.[] | select(.name == "feature") | .protected')
	assert_equal "$is_feature_protected" "true"
}

@test "toto branch is created on anotherBranch branch" {
	sha_toto=$(gh api "repos/${TEST_REPO_ORG}/${TEST_REPO_NAME}/branches" --method GET --jq '.[] | select(.name == "toto") | .commit.sha')
	sha_main=$(gh api "repos/${TEST_REPO_ORG}/${TEST_REPO_NAME}/branches" --method GET --jq '.[] | select(.name == "main") | .commit.sha')
	sha_another=$(gh api "repos/${TEST_REPO_ORG}/${TEST_REPO_NAME}/branches" --method GET --jq '.[] | select(.name == "anotherBranch") | .commit.sha')
	assert_not_equal "$sha_another" "$sha_main"
	assert_equal "$sha_toto" "$sha_another"
}

@test "toto branch is not protected" {
	is_toto_protected=$(gh api "repos/${TEST_REPO_ORG}/${TEST_REPO_NAME}/branches" --method GET --jq '.[] | select(.name == "toto") | .protected')
	assert_equal "$is_toto_protected" "false"
}
