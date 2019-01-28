LIBS_DIR := ./libs

.PHONY: dependencies
dependencies: boost gmp mpfr ledger

$(LIBS_DIR):
	mkdir -p $@

.PHONY: boost
boost: $(LIBS_DIR)/boost_1_67_0/out

$(LIBS_DIR)/boost_1_67_0/out: $(LIBS_DIR)/boost_1_67_0/source
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); cd $<; ./bootstrap.sh --with-libraries=date_time,filesystem,system,iostreams,regex,test --prefix=$$prefix
	cd $<; ./b2 install

$(LIBS_DIR)/boost_1_67_0/source: $(LIBS_DIR)/boost_1_67_0.tar.gz
	mkdir -p $@
	tar -xzf $< -C $@ --strip-components=1

$(LIBS_DIR)/boost_1_67_0.tar.gz: $(LIBS_DIR)
	curl -L https://dl.bintray.com/boostorg/release/1.67.0/source/boost_1_67_0.tar.gz >> $@

.PHONY: gmp
gmp: $(LIBS_DIR)/gmp-6.1.2/out

$(LIBS_DIR)/gmp-6.1.2/out: $(LIBS_DIR)/gmp-6.1.2/source
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); cd $<; ./configure --prefix=$$prefix
	cd $<; make
	cd $<; make install

$(LIBS_DIR)/gmp-6.1.2/source: $(LIBS_DIR)/gmp-6.1.2.tar.bz2
	mkdir -p $@
	tar -jxvf $< -C $@ --strip-components=1

$(LIBS_DIR)/gmp-6.1.2.tar.bz2: $(LIBS_DIR)
	curl -L https://gmplib.org/download/gmp/gmp-6.1.2.tar.bz2 >> $@

.PHONY: mpfr
mpfr: $(LIBS_DIR)/mpfr-4.0.1/out

$(LIBS_DIR)/mpfr-4.0.1/out: $(LIBS_DIR)/mpfr-4.0.1/source
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); gmp=$$(python -c "from os.path import abspath; print(abspath(\"$(LIBS_DIR)/gmp-6.1.2/out\"))"); cd $<; ./configure --prefix=$$prefix --with-gmp=$$gmp
	cd $<; make
	cd $<; make install

$(LIBS_DIR)/mpfr-4.0.1/source: $(LIBS_DIR)/mpfr-4.0.1.tar.gz
	mkdir -p $@
	tar -xzf $< -C $@ --strip-components=1

$(LIBS_DIR)/mpfr-4.0.1.tar.gz: $(LIBS_DIR)
	curl -L https://www.mpfr.org/mpfr-current/mpfr-4.0.1.tar.gz >> $@

.PHONY: ledger
ledger: $(LIBS_DIR)/ledger-3.1.1/out
	# need to link boost libraries
	# CXX="c++" CXXFLAGS="-std=c++11 -stdlib=libc++" ./acprep --loglevel=DEBUG --no-git --no-python --boost=/Users/mylesmegyesi/code/personal/ledger-node/libs/boost_1_67_0/out/ --prefix=/Users/mylesmegyesi/code/personal/ledger-node/libs/ledger-3.1.1/out --output=build opt make install -- -DMPFR_PATH=/Users/mylesmegyesi/code/personal/ledger-node/libs/mpfr-4.0.1/out/include -DMPFR_LIB=/Users/mylesmegyesi/code/personal/ledger-node/libs/mpfr-4.0.1/out/lib/libmpfr.dylib -DGMP_PATH=/Users/mylesmegyesi/code/personal/ledger-node/libs/gmp-6.1.2/out/include -DGMP_LIB=/Users/mylesmegyesi/code/personal/ledger-node/libs/gmp-6.1.2/out/lib/libgmp.dylib

$(LIBS_DIR)/ledger-3.1.1/out: $(LIBS_DIR)/ledger-3.1.1/source
	#prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); boost=$$(python -c "from os.path import abspath; print(abspath(\"$(LIBS_DIR)/boost_1_67_0/out\"))"); cd $<; ./configure --prefix=$$prefix --with-gmp=$$gmp
	#cd $<; make
	#cd $<; make install

$(LIBS_DIR)/ledger-3.1.1/source: $(LIBS_DIR)/ledger-3.1.1.tar.gz
	mkdir -p $@
	tar -xzf $< -C $@ --strip-components=1

$(LIBS_DIR)/ledger-3.1.1.tar.gz: $(LIBS_DIR)
	curl -L https://github.com/ledger/ledger/archive/v3.1.1.tar.gz >> $@
