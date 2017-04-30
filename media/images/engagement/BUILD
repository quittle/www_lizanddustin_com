# Copyright (c) 2017 Dustin Doloff
# Licensed under Apache License v2.0

load("@rules_web//generate:generate.bzl",
    "generate_variables",
)

load("@rules_web//images:images.bzl",
    "crop_image",
)

load("//media/images:internal.bzl",
    "all_images_filegroup",
)

load(":internal.bzl",
    "resize_all_images",
)

all_images_filegroup(filegroup, glob)

crop_image(
    name = "cropped_2894.jpg",
    image = "2894.jpg",
    height = "50%",
    y_offset = "50%",
    map_source = True,
)

cropped_images = [
    "2894.jpg",
]

all_images = glob([ "*.jpg" ], exclude = cropped_images) + [ ":cropped_2894.jpg" ]

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
