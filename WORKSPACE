# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

workspace(name = "toadstyle_lizanddustin_com")

git_repository(
    name = "rules_web",
    commit = "550a267cf06d2b603ee46dab30957c9324253d47",
    remote = "https://github.com/quittle/rules_web.git",
)

load("@rules_web//:rules_web_repositories.bzl", "rules_web_repositories")
rules_web_repositories()

load("@io_bazel_rules_sass//sass:sass.bzl", "sass_repositories")
sass_repositories()
