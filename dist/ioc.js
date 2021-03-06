(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.ioc = mod.exports;
    }
})(this, function (exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    exports.inject = inject;

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var resolver = {
        number: function number(obj) {
            return obj;
        },
        string: function string(obj) {
            return obj;
        },
        boolean: function boolean(obj) {
            return obj;
        },
        object: function object(obj) {
            return obj;
        },
        'function': function _function(ctor, deps) {
            var instance = Object.create(ctor.prototype);
            return ctor.apply(instance, deps) || instance;
        },
        '*': function _() {
            throw new TypeError('Resolving undefined type');
        }
    };

    function _assertIsDefined(obj, message) {
        if (obj === undefined) {
            throw new TypeError(message);
        }
    }

    function getError(error, type) {
        var message = typeof error == "string" ? error : error.message + ' -> ' + type;
        var stack = error.stack ? error.stack : null;
        message = message.replace('Type not registered: ->', 'Type not registered:');
        var newError = new TypeError(message);
        newError.stack = stack;
        throw newError;
    }

    function inject() {
        for (var _len = arguments.length, injects = Array(_len), _key = 0; _key < _len; _key++) {
            injects[_key] = arguments[_key];
        }

        return function (target) {
            target.$inject = [].concat(injects);
            return target;
        };
    }

    var Ioc = (function () {
        function Ioc() {
            var _this = this;

            _classCallCheck(this, Ioc);

            this._map = {
                get: function get(key) {
                    return _this._map[key];
                },
                set: function set(key, value) {
                    _this._map[key] = value;
                }
            };
        }

        _createClass(Ioc, [{
            key: 'registerType',
            value: function registerType(key, value) {

                if (!key) {
                    throw new TypeError('Argument key \'' + key + '\' is undefined');
                }

                _assertIsDefined(value, 'Argument value of \'' + key + '\' is undefined');

                var registeredType = this._map.get(key);
                if (registeredType) {
                    if (registeredType !== value) {
                        throw new TypeError('Type already registered: ' + key);
                    }
                }

                this._map.set(key, value);
                this._findCircularDependencies(key);
                return this;
            }
        }, {
            key: 'resolve',
            value: function resolve(type) {
                var _this2 = this;

                try {
                    var registeredType = typeof type === 'string' ? this._map.get(type) : type;
                    _assertIsDefined(registeredType, 'Type ' + type + ' not registered:');

                    var typeOfResolve = typeof registeredType;
                    var injectProperty = (this._getInject(registeredType) || []).map(function (t) {
                        return _this2.resolve(t);
                    });
                    return (resolver[typeOfResolve] || resolver['*'])(registeredType, injectProperty);
                } catch (error) {
                    throw getError(error, type);
                }
            }
        }, {
            key: 'testConfig',
            value: function testConfig() {
                var _this3 = this;

                var _loop = function (key) {
                    (_this3._map.get(key).$inject || []).forEach(function (type) {
                        _assertIsDefined(_this3._map.get(type), 'Dependency \'' + type + '\' injected to \'' + key + '\' but not registered');
                    });
                };

                for (var key in this._map) {
                    _loop(key);
                }
                return true;
            }
        }, {
            key: '_findCircularDependencies',
            value: function _findCircularDependencies(type) {
                var _this4 = this;

                var path = [type];

                var loopInjects = function loopInjects(type) {
                    var inject = ((_this4._map.get(type) || {}).$inject || []).slice(0);
                    var dep = undefined;
                    while (inject.length) {
                        dep = inject.shift();
                        if (path.indexOf(dep) > -1) {
                            throw new TypeError('CircularDependencies in ' + path.concat(dep).join('->'));
                        }
                        path.push(dep);
                        loopInjects(dep);
                        path.pop();
                    }
                };

                loopInjects(type);
            }
        }, {
            key: '_getInject',
            value: function _getInject(registeredType) {
                if (registeredType.$inject) {
                    return registeredType.$inject;
                }
            }
        }]);

        return Ioc;
    })();

    exports['default'] = Ioc;
});