'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var list = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(_req, _res, _next) {
        var day, keys, result, _list;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        day = _req.params.day;

                        if (day === 'today') day = (0, _moment2.default)().format('YYYYMMDD');else if (day === 'yesterday') day = (0, _moment2.default)().add(-1, 'days').format('YYYYMMDD');else day = false;
                        _context2.next = 4;
                        return new _timegroup2.default().getKeys(day);

                    case 4:
                        keys = _context2.sent;
                        result = [];

                    case 6:
                        if (!keys.length) {
                            _context2.next = 14;
                            break;
                        }

                        _list = new _timegroup2.default(keys.shift());
                        _context2.next = 10;
                        return _list.list();

                    case 10:
                        _list = _context2.sent;

                        result.push(_list);
                        _context2.next = 6;
                        break;

                    case 14:
                        _res.json(result);

                    case 15:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function list(_x4, _x5, _x6) {
        return _ref2.apply(this, arguments);
    };
}();

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _timegroup = require('./timegroup.js');

var _timegroup2 = _interopRequireDefault(_timegroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var app = (0, _express2.default)();
//const router = app.Router()

app.use(_express2.default.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.send('hello world');
});

app.get('/timegroup/list', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_req, _res, _next) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _req.params.day = 'today';
                        _context.next = 3;
                        return list(_req, _res, _next);

                    case 3:
                        return _context.abrupt('return', _context.sent);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}());
app.get('/timegroup/list/:day', list);

app.get('/timegroup/actions/:days', function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(_req, _res, _next) {
        var days, callback, result, day, keys;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        days = parseInt(_req.params.days) || 30;
                        callback = _req.query.callback;
                        result = {
                            days: [],
                            actions: []
                        };

                    case 3:
                        if (!days--) {
                            _context3.next = 12;
                            break;
                        }

                        day = (0, _moment2.default)().add(-days, 'days').format('YYYYMMDD');
                        _context3.next = 7;
                        return new _timegroup2.default().getKeys(day);

                    case 7:
                        keys = _context3.sent;

                        result.days.push(day);
                        result.actions.push(keys.length);
                        _context3.next = 3;
                        break;

                    case 12:
                        _res.jsonp(result);

                    case 13:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }));

    return function (_x7, _x8, _x9) {
        return _ref3.apply(this, arguments);
    };
}());

app.get('/timegroup/:action/totaltime/:day', function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(_req, _res, _next) {
        var action_name, day, keys, result, key, res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        action_name = _req.params.action;
                        day = _req.params.day;

                        if (day === 'today') day = (0, _moment2.default)().format('YYYYMMDD');
                        if (day === 'yesterday') day = (0, _moment2.default)().add(-1, 'days').format('YYYYMMDD');
                        _context4.next = 6;
                        return new _timegroup2.default().getKeys(day);

                    case 6:
                        keys = _context4.sent;
                        result = [];

                    case 8:
                        if (!keys.length) {
                            _context4.next = 16;
                            break;
                        }

                        key = keys.shift();
                        _context4.next = 12;
                        return new _timegroup2.default().actions(action_name + ':' + key);

                    case 12:
                        res = _context4.sent;

                        result.push({
                            start: res.start,
                            total: res.end - res.start,
                            key: key
                        });
                        _context4.next = 8;
                        break;

                    case 16:

                        _res.jsonp(result);

                    case 17:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined);
    }));

    return function (_x10, _x11, _x12) {
        return _ref4.apply(this, arguments);
    };
}());

exports.default = app;