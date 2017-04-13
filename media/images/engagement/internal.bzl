# Copyright (c) 2017 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//images:images.bzl",
    "resize_image",
)

def _file_map_impl(ctx):
    mapping = {}
    for i in range(len(ctx.files.source)):
        source = ctx.files.source[i]
        destination = ctx.files.destination[i]
        mapping[source.path] = destination.path

    ctx.file_action(
        output = ctx.outputs.output,
        content = str({ctx.attr.root_variable: mapping}),
    )

_file_map = rule(
    attrs = {
        "root_variable": attr.string(
            mandatory = True,
        ),
        "source": attr.label_list(
            allow_files = True,
        ),
        "destination": attr.label_list(
            allow_files = True,
        ),
    },
    outputs = {
        "output": "%{name}.json",
    },
    implementation = _file_map_impl,
)

def resize_all_images(images, file_map_name, root_variable, height = None, width = None):
    source = []
    destination = []
    targets = []
    for image in images:
        resize_name = "shrunk_{file_map}_{image}".format(file_map=file_map_name, image=image)
        resize_image(
            name = resize_name,
            image = image,
            height = height,
            width = width,
        )
        target_reference = ":" + resize_name
        source.append(image)
        destination.append(target_reference)
        targets.append(target_reference)

    _file_map(
        name = file_map_name,
        root_variable = root_variable,
        source = source,
        destination = destination,
    )

    return targets
