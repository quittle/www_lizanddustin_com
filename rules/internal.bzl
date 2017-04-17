# Copyright (c) 2017 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//:internal.bzl",
    "transitive_resources_",
)

def file_list_impl(ctx):
    list_contents = "<ul>"
    for index, file in enumerate(ctx.files.files):
        content = ctx.attr.content.format(file=file.path, index=index)
        list_contents += "<li>{content}</li>".format(content=content)
    list_contents += "</ul>"

    ctx.file_action(ctx.outputs.file_list_fragment, list_contents)

    return struct(
        resources = set([ ctx.outputs.file_list_fragment ] + ctx.files.files),
    )

def _file_map_json_impl(ctx):
    mapping = {}
    for i in range(len(ctx.files.sources)):
        source = ctx.files.sources[i]
        destination = ctx.files.destinations[i]
        mapping[source.path] = destination.path

    ctx.file_action(
        output = ctx.outputs.output,
        content = str({ctx.attr.variable_name: mapping}),
    )

    # ret = struct()
    # for file in ctx.files.sources + ctx.files.destinations:
    #     ret = transitive_resources_(ret, file)
    # return transitive_resources_(ret, struct(
    #     resources = set([ ctx.outputs.output ]),
    #     source_map =
    # ))

file_map_json = rule(
    attrs = {
        "sources": attr.label_list(
            allow_files = True,
            allow_empty = False,
            mandatory = True,
        ),
        "destinations": attr.label_list(
            allow_files = True,
            allow_empty = False,
            mandatory = True,
        ),
        "variable_name": attr.string(
            mandatory = True,
        )
    },
    outputs = {
        "output": "%{name}.json",
    },
    implementation = _file_map_json_impl,
)
