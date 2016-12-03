# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load("@io_bazel_rules_sass//sass:sass.bzl",
    "sass_binary",
    "sass_library",
)

load("@rules_web//html:html.bzl",
    "html_page",
    "minify_html",
)

load("@rules_web//js:js.bzl",
    "minify_js",
)

load("@rules_web//images:images.bzl",
    "minify_png",
)

load("@rules_web//site_zip:site_zip.bzl",
    "generate_zip_server_python_file",
    "minify_site_zip",
    "rename_zip_paths",
    "zip_server",
    "zip_site",
)

sass_library(
    name = "blocks_sass",
    srcs = [
        "css/blocks.scss",
    ],
)

sass_binary(
    name = "main_css",
    src = "css/main.scss",
    deps = [
        ":blocks_sass",
    ],
    visibility = [ "//visibility:public" ],
)

minify_js(
    name = "main_js",
    srcs = [ "js/main.js" ],
)

html_page(
    name = "index",
    config = "//:index.json",
    body = "//:index_body.html",
    css_files = [
        ":main_css",
    ],
    deferred_js_files = [
        ":main_js", # BUG: Should be async (but not supported yet)
    ],
    deps = [
        "media/images/flowers.jpg",
        "media/images/flowers-white-60.png",
        "media/images/splash.png",
        "cssPIE/PIE.htc",
        "media/videos/Engagement.mp4",
        "fonts/miama-webfont.ttf",
    ],
)

minify_html(
    name = "index_min",
    src = ":index",
)

zip_site(
    name = "toadstyle_lizanddustin_com",
    root_files = [
        ":index_min",
    ],
    out_zip = "toadstyle_lizanddustin_com.zip",
)

minify_site_zip(
    name = "toadstyle_lizanddustin_com_zip",
    site_zip = ":toadstyle_lizanddustin_com",
    root_files = [
        ":index_min",
    ],
    minified_zip = "toadstyle_lizanddustin_com.min.zip",
)

rename_zip_paths(
    name = "rename_index_toadstyle_lizanddustin_com_zip",
    source_zip = ":toadstyle_lizanddustin_com_zip",
    path_map_labels_in = [
        ":index_min",
    ],
    path_map_labels_out = [
        "index.html",
    ],
    out_zip = "toadstyle_lizanddustin_com_final.zip",
)

zip_server(
    name = "toadstyle_lizanddustin_com_zip_server",
    zip = ":rename_index_toadstyle_lizanddustin_com_zip",
    port = 8080,
)
