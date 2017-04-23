# Copyright (c) 2017 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//generate:generate.bzl",
    "generate_variables",
)

load(":internal.bzl",
    "file_map_json",
)

def file_map(name, sources, destinations, variable_name):
    file_map_name = "{name}_file_map".format(name=name)
    file_map_json(
        name = file_map_name,
        sources = sources,
        destinations = destinations,
        variable_name = variable_name,
    )

    generate_variables(
        name = name,
        config = ":" + file_map_name,
        out_scss = "{name}.scss".format(name=name),
        visibility = [ "//visibility:public" ],
    )
