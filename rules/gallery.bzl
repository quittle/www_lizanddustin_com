# Copyright (c) 2017 Dustin Doloff
# Licensed under Apache License v2.0

load(":internal.bzl",
    "file_list_impl",
)

# This should quite possibly be turned into using a script that does jinja2 replacement instead
file_list = rule(
    attrs = {
        "files": attr.label_list(
            allow_files = True,
            mandatory = True,
        ),
        "content": attr.string(
            mandatory = True,
        ),
    },
    outputs = {
        "file_list_fragment": "%{name}-file-list.html",
    },
    implementation = file_list_impl,
)
