# Copyright (c) 2016-2017 Dustin Doloff
# Licensed under Apache License v2.0

workspace(name = "www_lizanddustin_com")

git_repository(
    name = "rules_web",
    commit = "c754be1a35f3623917b2f43e9f98b761952ecbfc",
    remote = "https://github.com/quittle/rules_web.git",
)

# local_repository(
#     name = "rules_web",
#     path = "../rules_web",
# )

load("@rules_web//:rules_web_repositories.bzl", "rules_web_repositories")
rules_web_repositories()

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()
