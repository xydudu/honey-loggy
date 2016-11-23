'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _bluebird = require('bluebird');

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TimeGroup = function () {
    function TimeGroup(_key) {
        _classCallCheck(this, TimeGroup);

        var port = _package.redis_conf.port,
            host = _package.redis_conf.host;

        (0, _bluebird.promisifyAll)(_redis2.default.RedisClient.prototype);

        var _ = this;
        _.client = _redis2.default.createClient(port, host);

        if (_key && _key.indexOf(':') > 0) {
            _.key = _key;
            _.type = _key.split(':')[0];
        }

        _.client.on('error', function (_err) {
            console.error(_err);
        });
    }

    _createClass(TimeGroup, [{
        key: 'list',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!(this.type === 'time_group')) {
                                    _context.next = 4;
                                    break;
                                }

                                _context.next = 3;
                                return this._timeGroupList();

                            case 3:
                                return _context.abrupt('return', _context.sent);

                            case 4:
                                return _context.abrupt('return', []);

                            case 5:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function list() {
                return _ref.apply(this, arguments);
            }

            return list;
        }()
    }, {
        key: '_timeGroupList',
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
                var _;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _ = this;
                                _context2.next = 3;
                                return _.client.zrangeAsync(_.key, 0, -1, 'withscores').then(function (_list) {
                                    var arr = [];
                                    var i = {};
                                    _list.forEach(function (_item) {
                                        if (isNaN(_item)) {
                                            i.desc = _item;
                                        } else {
                                            i.timestamp = _item;
                                            arr.push(i);
                                            i = {};
                                        }
                                    });
                                    arr.reduce(function (_start, _end) {
                                        _start.start = _start.timestamp;
                                        _start.end = _end.timestamp;
                                        return _end;
                                    });
                                    return arr;
                                }).catch(function (_err) {
                                    console.log('[err] ' + _err);
                                    return [];
                                });

                            case 3:
                                return _context2.abrupt('return', _context2.sent);

                            case 4:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _timeGroupList() {
                return _ref2.apply(this, arguments);
            }

            return _timeGroupList;
        }()
    }, {
        key: 'getKeys',
        value: function () {
            var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(_day) {
                var now, day, key;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                now = (0, _moment2.default)().format('YYYYMMDD');
                                day = _day || now;
                                key = 'time_group:' + now;
                                _context3.next = 5;
                                return this.client.smembersAsync(key);

                            case 5:
                                return _context3.abrupt('return', _context3.sent);

                            case 6:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function getKeys(_x) {
                return _ref3.apply(this, arguments);
            }

            return getKeys;
        }()
    }]);

    return TimeGroup;
}();

exports.default = TimeGroup;