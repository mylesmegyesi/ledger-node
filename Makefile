LIBS_DIR := ./libs

.PHONY: dependencies
dependencies: boost

.PHONY: boost
boost: $(LIBS_DIR)/boost/boost_1_67_0/out

$(LIBS_DIR):
	mkdir -p $@

$(LIBS_DIR)/boost: $(LIBS_DIR)
	mkdir -p $@

$(LIBS_DIR)/boost/boost_1_67_0.tar.gz: $(LIBS_DIR)/boost
	curl -L https://dl.bintray.com/boostorg/release/1.67.0/source/boost_1_67_0.tar.gz >> $@

$(LIBS_DIR)/boost/boost_1_67_0/source: $(LIBS_DIR)/boost/boost_1_67_0.tar.gz
	mkdir -p $@
	tar -xzf $< -C $@ --strip-components=1

$(LIBS_DIR)/boost/boost_1_67_0/out: $(LIBS_DIR)/boost/boost_1_67_0/source
	prefix=$$(python -c "from os.path import abspath; print(abspath(\"$@\"))"); cd $<; ./bootstrap.sh --with-libraries=date_time,filesystem,system,iostreams,regex --prefix=$$prefix
	cd $<; ./b2 install

