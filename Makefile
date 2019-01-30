LIBS_DIR := ./libs
RELEASE_DIR := ./build/Release

.PHONY: default
default: ledger-node

.PHONY: type-check
type-check:
	npx tsc

ledger-node: | $(RELEASE_DIR)/ledger.node $(RELEASE_DIR)/libledger.3.dylib
	install_name_tool -change libledger.3.dylib "@loader_path/libledger.3.dylib" $<

$(RELEASE_DIR):
	mkdir -p $@

$(RELEASE_DIR)/ledger.node:
	npx node-gyp rebuild

$(RELEASE_DIR)/libboost_date_time-mt.dylib: $(RELEASE_DIR) boost
	cp $(LIBS_DIR)/boost-1.67.0/out/lib/libboost_date_time-mt.dylib $<

$(RELEASE_DIR)/libboost_system-mt.dylib: $(RELEASE_DIR) boost
	cp $(LIBS_DIR)/boost-1.67.0/out/lib/libboost_system-mt.dylib $<

$(RELEASE_DIR)/libboost_iostreams-mt.dylib: $(RELEASE_DIR) boost
	cp $(LIBS_DIR)/boost-1.67.0/out/lib/libboost_iostreams-mt.dylib $<

$(RELEASE_DIR)/libboost_regex-mt.dylib: $(RELEASE_DIR) boost
	cp $(LIBS_DIR)/boost-1.67.0/out/lib/libboost_regex-mt.dylib $<

$(RELEASE_DIR)/libboost_chrono-mt.dylib: $(RELEASE_DIR) boost $(RELEASE_DIR)/libboost_system-mt.dylib
	cp $(LIBS_DIR)/boost-1.67.0/out/lib/libboost_chrono-mt.dylib $<
	install_name_tool -change libboost_system-mt.dylib "@loader_path/libboost_system-mt.dylib" $@

$(RELEASE_DIR)/libboost_filesystem-mt.dylib: $(RELEASE_DIR) boost $(RELEASE_DIR)/libboost_system-mt.dylib
	cp $(LIBS_DIR)/boost-1.67.0/out/lib/libboost_filesystem-mt.dylib $<
	install_name_tool -change libboost_system-mt.dylib "@loader_path/libboost_system-mt.dylib" $@

$(RELEASE_DIR)/libboost_timer-mt.dylib: $(RELEASE_DIR) boost $(RELEASE_DIR)/libboost_system-mt.dylib $(RELEASE_DIR)/libboost_chrono-mt.dylib
	cp $(LIBS_DIR)/boost-1.67.0/out/lib/libboost_timer-mt.dylib $<
	install_name_tool -change libboost_system-mt.dylib "@loader_path/libboost_system-mt.dylib" $@
	install_name_tool -change libboost_chrono-mt.dylib "@loader_path/libboost_chrono-mt.dylib" $@

$(RELEASE_DIR)/libboost_unit_test_framework-mt.dylib: $(RELEASE_DIR) boost $(RELEASE_DIR)/libboost_system-mt.dylib $(RELEASE_DIR)/libboost_timer-mt.dylib
	cp $(LIBS_DIR)/boost-1.67.0/out/lib/libboost_unit_test_framework-mt.dylib $<
	install_name_tool -change libboost_system-mt.dylib "@loader_path/libboost_system-mt.dylib" $@
	install_name_tool -change libboost_timer-mt.dylib "@loader_path/libboost_timer-mt.dylib" $@

$(RELEASE_DIR)/libgmp.10.dylib: $(RELEASE_DIR) gmp
	cp $(LIBS_DIR)/gmp-6.1.2/out/lib/libgmp.10.dylib $<

$(RELEASE_DIR)/libmpfr.6.dylib: $(RELEASE_DIR) mpfr $(RELEASE_DIR)/libgmp.10.dylib
	cp $(LIBS_DIR)/mpfr-4.0.1/out/lib/libmpfr.6.dylib $<
	install_name_tool -change libgmp.10.dylib "@loader_path/libgmp.10.dylib" $@

$(RELEASE_DIR)/libledger.3.dylib: $(RELEASE_DIR) ledger $(RELEASE_DIR)/libboost_date_time-mt.dylib $(RELEASE_DIR)/libboost_system-mt.dylib $(RELEASE_DIR)/libboost_iostreams-mt.dylib $(RELEASE_DIR)/libboost_regex-mt.dylib $(RELEASE_DIR)/libboost_filesystem-mt.dylib  $(RELEASE_DIR)/libboost_unit_test_framework-mt.dylib $(RELEASE_DIR)/libgmp.10.dylib $(RELEASE_DIR)/libmpfr.6.dylib
	cp $(LIBS_DIR)/ledger-3.1.1/out/lib/libledger.3.dylib $<
	install_name_tool -change libboost_date_time-mt.dylib "@loader_path/libboost_date_time-mt.dylib" $@
	install_name_tool -change libboost_filesystem-mt.dylib "@loader_path/libboost_filesystem-mt.dylib" $@
	install_name_tool -change libboost_system-mt.dylib "@loader_path/libboost_system-mt.dylib" $@
	install_name_tool -change libboost_iostreams-mt.dylib "@loader_path/libboost_iostreams-mt.dylib" $@
	install_name_tool -change libboost_regex-mt.dylib "@loader_path/libboost_regex-mt.dylib" $@
	install_name_tool -change libboost_unit_test_framework-mt.dylib "@loader_path/libboost_unit_test_framework-mt.dylib" $@
	install_name_tool -change libgmp.10.dylib "@loader_path/libgmp.10.dylib" $@
	install_name_tool -change libmpfr.6.dylib "@loader_path/libmpfr.6.dylib" $@

$(LIBS_DIR):
	mkdir -p $@

.PHONY: ledger
ledger: boost gmp mpfr $(LIBS_DIR)/ledger-3.1.1/out

$(LIBS_DIR)/ledger-3.1.1/out: $(LIBS_DIR)/ledger-3.1.1/source
	mkdir -p $@
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); \
		boost=$$(python -c "from os.path import abspath; print(abspath(\"$(LIBS_DIR)/boost-1.67.0/out\"))"); \
		gmp=$$(python -c "from os.path import abspath; print(abspath(\"$(LIBS_DIR)/gmp-6.1.2/out\"))"); \
		mpfr=$$(python -c "from os.path import abspath; print(abspath(\"$(LIBS_DIR)/mpfr-4.0.1/out\"))"); \
		cd $<; \
		CXX="c++" ./acprep \
		--loglevel=DEBUG \
		--no-git \
		--no-python \
		--output=build \
		--prefix=$$prefix \
		--boost=$$boost \
		opt make install -- \
		-DMPFR_PATH=/Users/mylesmegyesi/code/personal/ledger-node/libs/mpfr-4.0.1/out/include \
		-DMPFR_LIB=/Users/mylesmegyesi/code/personal/ledger-node/libs/mpfr-4.0.1/out/lib/libmpfr.dylib \
		-DGMP_PATH=$$gmp/include \
		-DGMP_LIB=$$gmp/lib/libgmp.dylib
	install_name_tool -id libledger.3.dylib $@/lib/libledger.3.dylib

$(LIBS_DIR)/ledger-3.1.1/source: $(LIBS_DIR)/ledger-3.1.1.tar.gz
	mkdir -p $@
	tar -xzf $< -C $@ --strip-components=1

$(LIBS_DIR)/ledger-3.1.1.tar.gz: $(LIBS_DIR)
	curl -L https://github.com/ledger/ledger/archive/v3.1.1.tar.gz >> $@

.PHONY: boost
boost: $(LIBS_DIR)/boost-1.67.0/out

$(LIBS_DIR)/boost-1.67.0/out: $(LIBS_DIR)/boost-1.67.0/source
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); \
				 cd $<; \
				 ./bootstrap.sh --with-libraries=date_time,filesystem,system,iostreams,regex,test --prefix=$$prefix
	cd $<; ./b2 headers
	cd $<; ./b2 -d2 --layout=tagged -sNO_LZMA=1 install threading=multi link=shared
	install_name_tool -id libboost_chrono-mt.dylib $@/lib/libboost_chrono-mt.dylib
	install_name_tool -id libboost_date_time-mt.dylib $@/lib/libboost_date_time-mt.dylib
	install_name_tool -id libboost_filesystem-mt.dylib $@/lib/libboost_filesystem-mt.dylib
	install_name_tool -id libboost_iostreams-mt.dylib $@/lib/libboost_iostreams-mt.dylib
	install_name_tool -id libboost_regex-mt.dylib $@/lib/libboost_regex-mt.dylib
	install_name_tool -id libboost_system-mt.dylib $@/lib/libboost_system-mt.dylib
	install_name_tool -id libboost_timer-mt.dylib $@/lib/libboost_timer-mt.dylib
	install_name_tool -id libboost_unit_test_framework-mt.dylib $@/lib/libboost_unit_test_framework-mt.dylib

$(LIBS_DIR)/boost-1.67.0/source: $(LIBS_DIR)/boost-1.67.0.tar.gz
	mkdir -p $@
	tar -xzf $< -C $@ --strip-components=1

$(LIBS_DIR)/boost-1.67.0.tar.gz: $(LIBS_DIR)
	curl -L https://dl.bintray.com/boostorg/release/1.67.0/source/boost_1_67_0.tar.gz >> $@

.PHONY: gmp
gmp: $(LIBS_DIR)/gmp-6.1.2/out

$(LIBS_DIR)/gmp-6.1.2/out: $(LIBS_DIR)/gmp-6.1.2/source
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); \
				 cd $<; \
				 ./configure --prefix=$$prefix --enable-cxx --enable-shared --disable-static
	cd $<; make
	cd $<; make install
	install_name_tool -id libgmp.10.dylib $@/lib/libgmp.10.dylib

$(LIBS_DIR)/gmp-6.1.2/source: $(LIBS_DIR)/gmp-6.1.2.tar.bz2
	mkdir -p $@
	tar -jxvf $< -C $@ --strip-components=1

$(LIBS_DIR)/gmp-6.1.2.tar.bz2: $(LIBS_DIR)
	curl -L https://gmplib.org/download/gmp/gmp-6.1.2.tar.bz2 >> $@

.PHONY: mpfr
mpfr: gmp $(LIBS_DIR)/mpfr-4.0.1/out

$(LIBS_DIR)/mpfr-4.0.1/out: $(LIBS_DIR)/mpfr-4.0.1/source
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); \
		gmp=$$(python -c "from os.path import abspath; print(abspath(\"$(LIBS_DIR)/gmp-6.1.2/out\"))"); \
		cd $<; \
		./configure --prefix=$$prefix --with-gmp=$$gmp --disable-dependency-tracking --disable-silent-rules --disable-static --enable-shared
	cd $<; make
	cd $<; make install
	install_name_tool -id libmpfr.6.dylib $@/lib/libmpfr.6.dylib

$(LIBS_DIR)/mpfr-4.0.1/source: $(LIBS_DIR)/mpfr-4.0.1.tar.gz
	mkdir -p $@
	tar -xzf $< -C $@ --strip-components=1

$(LIBS_DIR)/mpfr-4.0.1.tar.gz: $(LIBS_DIR)
	curl -L https://www.mpfr.org/mpfr-current/mpfr-4.0.1.tar.gz >> $@
