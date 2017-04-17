# Copyright (c) 2017 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//images:images.bzl",
    "minify_png",
)

load("//rules:utils.bzl",
    "file_map"
)

def all_images_filegroup(filegroup, glob, other_sources=[]):
    filegroup(
        name = "all_images",
        srcs = glob([
            "**/*.gif",
            "**/*.jpg",
            "**/*.png",
        ]) + other_sources,
        visibility = [ "//visibility:public" ],
    )

def minify_map_all(name, images, variable_name):
    minified = []
    for image in images:
        minify_name = "_minify_{name}".format(name=image)
        minify_png(
            name = minify_name,
            png = image,
        )
        minified.append(":" + minify_name)
    return minified
    # file_map(
    #     name = name,
    #     sources = images,
    #     destinations = minified,
    #     variable_name = variable_name
    # )
