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

exports.default = app;