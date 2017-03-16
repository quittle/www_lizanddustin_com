# Copyright (c) 2016-2017 Dustin Doloff
# Licensed under Apache License v2.0

workspace(name = "www_lizanddustin_com")

git_repository(
    name = "rules_web",
    commit = "e6dc2a70d2588335bc3821c4dc89119520591cc2",
    remote = "https://github.com/quittle/rules_web.git",
)

load("@rules_web//:rules_web_repositories.bzl", "rules_web_repositories")
rules_web_repositories()

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()
