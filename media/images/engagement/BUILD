# Copyright (c) 2017 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//generate:generate.bzl",
    "generate_variables",
)

load(":internal.bzl",
    "resize_all_images"
)

all_images = glob([ "*.jpg" ])

filegroup(
    name = "original_images",
    srcs = all_images,
    visibility = [ "//visibility:public" ],
)

filegroup(
    name = "shrunk_images",
    srcs = resize_all_images(all_images, "shrunk_image_map", "engagement-photos-map", height=1000) +
           resize_all_images([ "2961.jpg" ], "large_image_map", "large-images-map", width=2000),
    visibility = [ "//visibility:public" ],
)

generate_variables(
    name = "engagement_map",
    config = ":shrunk_image_map",
    out_scss = "engagement_map.scss",
    visibility = [ "//visibility:public" ],
)

generate_variables(
    name = "large_images",
    config = ":large_image_map",
    out_scss = "large_map.scss",
    visibility = [ "//visibility:public" ],
)
