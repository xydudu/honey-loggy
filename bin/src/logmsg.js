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

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(0, _bluebird.promisifyAll)(_redis2.default.RedisClient.prototype);
var port = _package.redis_conf.port,
    host = _package.redis_conf.host;

var redisClient = _redis2.default.createClient(port, host);
redisClient.on('error', function (_err) {
    console.error(_err);
});

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
            var match = _input.replace(/[\s\t ]+$/g, '').match(/\[([0-9]+)\]$/);
            return match ? parseInt(match[1]) : false;
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
            return _input.replace(/(\[.+?\])/gi, '').replace(/(^\s+|\s+$)/gi, '');
        }
    }, {
        key: 'isPreview',
        value: function isPreview(_desc) {
            return (/预览请求/.test(_desc)
            );
        }
    }, {
        key: 'isDeploy',
        value: function isDeploy(_desc) {
            return (/发布请求/.test(_desc)
            );
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
        _.now = (0, _moment2.default)().format('YYYYMMDD');
        _.key = _.getKeyFromLog(_input);
        if (!_.key) {
            console.warn('日志类型为空');
            _.key = '';
        }
        _.times = _.getTimestampFromLog(_input);
        _.app_name = _.getAppnameFromLog(_input);
        _.desc = _.getDescFromLog(_input);
        _.type = _.key.split(':')[0];

        return _this;
    }

    _createClass(LogMsg, [{
        key: '_saveToTimeGroup',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                var _, is_preview, is_deploy, tasks;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _ = this;
                                is_preview = _.isPreview(_.desc);
                                is_deploy = _.isDeploy(_.desc);

                                if (_.times) {
                                    _context.next = 5;
                                    break;
                                }

                                return _context.abrupt('return', false);

                            case 5:
                                if (!(_.key === '')) {
                                    _context.next = 7;
                                    break;
                                }

                                return _context.abrupt('return', false);

                            case 7:
                                tasks = [_.client.saddAsync('time_group:' + _.now, _.key), _.client.zaddAsync(_.key, _.times, '[' + _.app_name + '] ' + _.desc)];

                                if (is_preview) tasks.push(_.client.hmsetAsync('preview:' + _.key, ['start', _.times, 'end', _.times]));
                                if (is_deploy) tasks.push(_.client.hmsetAsync('deploy:' + _.key, ['start', _.times, 'end', _.times]));

                                _context.next = 12;
                                return Promise.all([_.client.existsAsync('preview:' + _.key), _.client.existsAsync('deploy:' + _.key)]).then(function (_res) {
                                    if (_res[0]) tasks.push(_.client.hsetAsync(['preview:' + _.key, 'end', _.times]));
                                    if (_res[1]) tasks.push(_.client.hsetAsync('deploy:' + _.key, 'end', _.times));
                                    return Promise.all(tasks);
                                });

                            case 12:
                                return _context.abrupt('return', _context.sent);

                            case 13:
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
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!(this.type === 'time_group')) {
                                    _context2.next = 4;
                                    break;
                                }

                                _context2.next = 3;
                                return this._saveToTimeGroup();

                            case 3:
                                return _context2.abrupt('return', _context2.sent);

                            case 4:
                                return _context2.abrupt('return', false);

                            case 5:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function save() {
                return _ref2.apply(this, arguments);
            }

            return save;
        }()
    }]);

    return LogMsg;
}(Util);

exports.default = LogMsg;