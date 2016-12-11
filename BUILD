# Copyright (c) 2016 Dustin Doloff
# Licensed under Apache License v2.0

load("@io_bazel_rules_sass//sass:sass.bzl",
    "sass_binary",
    "sass_library",
)

load("@rules_web//fonts:fonts.bzl",
    "font_generator",
    "minify_ttf",
    "ttf_to_eot",
    "ttf_to_woff",
    "ttf_to_woff2",
)

load("@rules_web//html:html.bzl",
    "html_page",
    "minify_html",
)

load("@rules_web//js:js.bzl",
    "closure_compile",
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

minify_ttf(
    name = "miama_ttf",
    ttf = "fonts/miama.ttf",
)

ttf_to_eot(
    name = "miama_eot",
    ttf = ":miama_ttf",
)

ttf_to_woff(
    name = "miama_woff",
    ttf = ":miama_ttf",
)

ttf_to_woff2(
    name = "miama_woff2",
    ttf = ":miama_ttf",
)

font_generator(
    name = "miama_css",
    font_name = "miama",
    eot = ":miama_eot",
    ttf = ":miama_ttf",
    woff = ":miama_woff",
    woff2 = ":miama_woff2",
)

sass_library(
    name = "detail_sass",
    srcs = [
        "css/detail.scss",
    ],
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
        ":detail_sass",
    ],
    visibility = [ "//visibility:public" ],
)

closure_compile(
    name = "main_js",
    srcs = [ "js/main.js" ],
)

html_page(
    name = "index",
    config = "//:index.json",
    body = "//:index_body.html",
    css_files = [
        ":main_css",
        ":miama_css",
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
