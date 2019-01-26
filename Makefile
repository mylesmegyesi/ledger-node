LIBS_DIR := ./libs

.PHONY: dependencies
dependencies: boost gmp mpfr

$(LIBS_DIR):
	mkdir -p $@

.PHONY: boost
boost: $(LIBS_DIR)/boost_1_67_0/out

$(LIBS_DIR)/boost_1_67_0/out: $(LIBS_DIR)/boost_1_67_0/source
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); cd $<; ./bootstrap.sh --with-libraries=date_time,filesystem,system,iostreams,regex --prefix=$$prefix
	cd $<; ./b2 install

$(LIBS_DIR)/boost_1_67_0/source: $(LIBS_DIR)/boost_1_67_0.tar.gz
	mkdir -p $@
	tar -xzf $< -C $@ --strip-components=1

$(LIBS_DIR)/boost_1_67_0.tar.gz: $(LIBS_DIR)
	curl -L https://dl.bintray.com/boostorg/release/1.67.0/source/boost_1_67_0.tar.gz >> $@

.PHONY: gmp
gmp: $(LIBS_DIR)/gpm-6.1.2/out

$(LIBS_DIR)/gpm-6.1.2/out: $(LIBS_DIR)/gpm-6.1.2/source
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); cd $<; ./configure --prefix=$$prefix
	cd $<; make
	cd $<; make install

$(LIBS_DIR)/gpm-6.1.2/source: $(LIBS_DIR)/gpm-6.1.2.tar.bz2
	mkdir -p $@
	tar -jxvf $< -C $@ --strip-components=1

$(LIBS_DIR)/gpm-6.1.2.tar.bz2: $(LIBS_DIR)
	curl -L https://gmplib.org/download/gmp/gmp-6.1.2.tar.bz2 >> $@

.PHONY: mpfr
mpfr: $(LIBS_DIR)/mpfr-4.0.1/out

$(LIBS_DIR)/mpfr-4.0.1/out: $(LIBS_DIR)/mpfr-4.0.1/source
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); gmp=$$(python -c "from os.path import abspath; print(abspath(\"$(LIBS_DIR)/gpm-6.1.2/out\"))"); cd $<; ./configure --prefix=$$prefix --with-gmp=$$gmp
	cd $<; make
	cd $<; make install

$(LIBS_DIR)/mpfr-4.0.1/source: $(LIBS_DIR)/mpfr-4.0.1.tar.gz
	mkdir -p $@
	tar -xzf $< -C $@ --strip-components=1

$(LIBS_DIR)/mpfr-4.0.1.tar.gz: $(LIBS_DIR)
	curl -L https://www.mpfr.org/mpfr-current/mpfr-4.0.1.tar.gz >> $@

