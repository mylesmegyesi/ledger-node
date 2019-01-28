{
	"targets": [{
		"target_name": "testaddon",
    "cflags!": [ "-fno-exceptions" ],
    "cflags_cc!": [ "-fno-exceptions" ],
    "sources": [
      "src/cpp/main.cpp"
    ],
    "include_dirs": [
      "<!@(node -p \"require('node-addon-api').include\")",
      "./libs/boost_1_67_0/out/include/",
      "./libs/gpm-6.1.2/out/include/",
      "./libs/mpfr-4.0.1/out/include/",
      "./libs/ledger-3.1.1/out/include/",
      "./libs/ledger-3.1.1/source/lib/utfcpp/v2_0/source/"
    ],
    "libraries": [
      "-L<(module_root_dir)/libs/ledger-3.1.1/out/lib/",
      "-lledger"
    ],
    "dependencies": [
      "<!(node -p \"require('node-addon-api').gyp\")"
    ],
    "conditions": [
      ["OS==\"mac\"", {
        "xcode_settings": {
          "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
          "GCC_ENABLE_CPP_RTTI": "YES"
        }
      }]
    ]
  }]
}
