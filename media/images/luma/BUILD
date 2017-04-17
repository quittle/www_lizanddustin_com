# Copyright (c) 2017 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//images:images.bzl",
    "resize_image",
)

load("//media/images:internal.bzl",
    "all_images_filegroup",
)

load("//rules:utils.bzl",
    "file_map",
)

all_images_filegroup(filegroup, glob)

resize_image(
    name = "luma_logo",
    image = "wide.png",
    width = 600,
    visibility = [ "//visibility:public" ],
)

file_map(
    name = "luma_logo_map",
    sources = [ "wide.png" ],
    destinations = [ ":luma_logo" ],
    variable_name = "luma-logo",
)
