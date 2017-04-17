# Copyright (c) 2017 Dustin Doloff
# Licensed under Apache License v2.0

load(":internal.bzl",
    "all_images_filegroup",
    "minify_map_all",
)

all_images_filegroup(filegroup, glob, [
    "//media/images/engagement:all_images",
    "//media/images/luma:all_images",
])

minified_pngs = minify_map_all(
    name = "optimized_pngs",
    images = glob([ "*.png", "**/*.png" ]),
    variable_name = "optimized_pngs_map",
)

filegroup(
    name = "optimized_pngs",
    srcs = minified_pngs,
    visibility = [ "//visibility:public" ],
)
