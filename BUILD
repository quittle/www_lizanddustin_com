# Copyright (c) 2016-2017 Dustin Doloff
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
    "inject_html",
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

load("//rules:gallery.bzl",
    "file_list",
)

file_list(
    name = "engagement_gallery",
    files = glob([ "!!media/images/engagement/*.jpg" ]),
    content = "<a href=\"#!gallery&image={file}\" style=\"background-image:url({file})\"></a>"
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
    name = "sass_libs",
    srcs =
        glob([ "css/*.scss" ], exclude=[ "css/detail.scss" ]) +
        [
            "//media/images/engagement:engagement_map",
            "//media/images/engagement:large_images",
            "//media/images/luma:luma_logo_map",
        ],
)

sass_binary(
    name = "main_css",
    src = "css/main.scss",
    deps = [
        ":sass_libs",
    ],
    visibility = [ "//visibility:public" ],
)

closure_compile(
    name = "main_js",
    srcs = [
        "js/detail.js",
        "js/flex_grid.js",
        "js/main.js",
        "js/utils.js",
    ],
)

closure_compile(
    name = "rsvp_js",
    srcs = [
        "js/rsvp.js",
        "js/utils.js",
    ],
)

html_page(
    name = "index_without_gallery",
    config = "//:index.json",
    body = "//:index_body.html",
    css_files = [
        ":main_css",
        ":miama_css",
    ],
    js_files = [
        ":rsvp_js",
    ],
    deferred_js_files = [
        ":main_js", # BUG: Should be async (but not supported yet)
    ],
    deps = [
        "cssPIE/PIE.htc",
        "//media/images/engagement:original_images",
        "//media/images/engagement:shrunk_images",
        "//media/images/luma:luma_logo",
        #"//media/images/engagement:shrunk_images",
    ] + glob([ "media/images/*", "media/images/**/*" ]),#+ glob([ "media/images/engagement/*.jpg" ]),
)

inject_html(
    name = "index",
    outer_html = ":index_without_gallery",
    inner_html = ":engagement_gallery",
    query_selector = "#engagement-shoot"
)

minify_html(
    name = "index_min",
    src = ":index",
)

zip_site(
    name = "www_lizanddustin_com",
    root_files = [
        ":index_min",
        "//media/images/engagement:shrunk_images",
    ],
    out_zip = "www_lizanddustin_com.zip",
)

minify_site_zip(
    name = "www_lizanddustin_com_zip",
    site_zip = ":www_lizanddustin_com",
    root_files = [
        ":index_min",
    ],
    keep_extensions = True,
    minified_zip = "www_lizanddustin_com.min.zip",
)

rename_zip_paths(
    name = "rename_index_www_lizanddustin_com_zip",
    source_zip = ":www_lizanddustin_com_zip",
    path_map_labels_in = [
        ":index_min",
    ],
    path_map_labels_out = [
        "index.html",
    ],
    out_zip = "www_lizanddustin_com_final.zip",
)

zip_server(
    name = "www_lizanddustin_com_zip_server",
    zip = ":rename_index_www_lizanddustin_com_zip",
    port = 8080,
)
