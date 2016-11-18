'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

require('babel-polyfill');

var _bluebird = require('bluebird');

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(0, _bluebird.promisifyAll)(_redis2.default.RedisClient.prototype);
var port = _package.redis_conf.port,
    host = _package.redis_conf.host;

var redisClient = _redis2.default.createClient(port, host);

var Util = function () {
    function Util() {
        _classCallCheck(this, Util);
    }

    _createClass(Util, [{
        key: 'getKeyFromLog',
        value: function getKeyFromLog(_input) {
            var match = _input.match(/\[([a-z\_]+\:[a-zA-Z0-9]+)\]/);
            return match ? match[1] : false;
        }
    }, {
        key: 'getTimestampFromLog',
        value: function getTimestampFromLog(_input) {
            var match = _input.match(/\[([0-9]+)\]$/);
            return match ? match[1] : false;
        }
    }, {
        key: 'getAppnameFromLog',
        value: function getAppnameFromLog(_input) {
            var match = _input.match(/^\[([\w\-_]+)\]/);
            return match ? match[1] : false;
        }
    }, {
        key: 'getDescFromLog',
        value: function getDescFromLog(_input) {
            return _input.replace(/(\[.+?\]|\s)/gi, '');
        }
    }]);

    return Util;
}();

var LogMsg = function (_Util) {
    _inherits(LogMsg, _Util);

    function LogMsg(_input) {
        _classCallCheck(this, LogMsg);

        var _this = _possibleConstructorReturn(this, (LogMsg.__proto__ || Object.getPrototypeOf(LogMsg)).call(this));

        var _ = _this;
        _.client = redisClient;
        _.key = _.getKeyFromLog(_input);
        _.times = _.getTimestampFromLog(_input);
        _.app_name = _.getAppnameFromLog(_input);
        console.log(_input, _.app_name);
        _.desc = _.getDescFromLog(_input);
        _.type = _.key.split(':')[0];

        _.client.on('error', function (_err) {
            console.error(_err);
        });
        return _this;
    }

    _createClass(LogMsg, [{
        key: '_saveToTimeGroup',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                var _;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _ = this;
                                _context.next = 3;
                                return _.client.zaddAsync(_.key, _.times, '[' + _.app_name + '] ' + _.desc);

                            case 3:
                                return _context.abrupt('return', _context.sent);

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function _saveToTimeGroup() {
                return _ref.apply(this, arguments);
            }

            return _saveToTimeGroup;
        }()
    }, {
        key: 'save',
        value: function save() {
            if (this.type === 'time_group') return this._saveToTimeGroup();
            return false;
        }
    }]);

    return LogMsg;
}(Util);

exports.default = LogMsg;