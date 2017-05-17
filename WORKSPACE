# Copyright (c) 2016-2017 Dustin Doloff
# Licensed under Apache License v2.0

workspace(name = "www_lizanddustin_com")

git_repository(
    name = "rules_web",
    commit = "9b3e5c038b4cb05ad496e66f866db8fb0a221f98",
    remote = "https://github.com/quittle/rules_web.git",
)

load("@rules_web//:rules_web_repositories.bzl", "rules_web_repositories")
rules_web_repositories()

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()


_BOTO_CORE_BUILD_FILE = """

py_library(
    name = "boto_core",
    srcs = glob([
        "botocore/**/*.py",
    ]),
    visibility = [ "//visibility:public" ],
)

"""

new_git_repository(
    name = "boto_core",
    commit = "5867d5ef2961f1b8e087d39e891def3169dd619a",
    remote = "https://github.com/boto/botocore.git",
    build_file_content = _BOTO_CORE_BUILD_FILE,
)

_BOTO3_BUILD_FILE = """

py_library(
    name = "boto3",
    srcs = glob([
        "boto3/**/*.py",
    ]),
    deps = [
        "@boto_core//:boto_core",
    ],
    visibility = [ "//visibility:public" ],
)

"""

new_git_repository(
    name = "boto3",
    commit = "8227503d7b1322b45052a16b197ac41fedd634e9", # 1.4.4
    remote = "https://github.com/boto/boto3.git",
    build_file_content = _BOTO3_BUILD_FILE,
)
