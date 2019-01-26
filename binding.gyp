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
      "<!(echo $HOMEBREW_PREFIX)/Cellar/ledger/3.1.1_11/include/",
      "./libs/boost_1_67_0/out/include/",
      "./libs/gpm-6.1.2/out/include/",
      "<!(echo $HOMEBREW_PREFIX)/Cellar/mpfr/4.0.1/include/",
      "<!(echo $HOMEBREW_PREFIX)/Cellar/python@2/2.7.15_1/Frameworks/Python.framework/Versions/2.7/include/python2.7/",
      "../ledger/lib/utfcpp/source/",
    ],
    "libraries": [
      "-L<!(echo $HOMEBREW_PREFIX)/Cellar/ledger/3.1.1_11/lib/",
      "-lledger.3",
      "-L<!(echo $HOMEBREW_PREFIX)/Cellar/python@2/2.7.15_1/Frameworks/Python.framework/Versions/2.7/lib/",
      "-lpython2.7",
      "-L<(module_root_dir)/libs/boost_1_67_0/out/lib/",
      "-L<!(echo $HOMEBREW_PREFIX)/Cellar/boost-python/1.68.0/lib/"
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
