'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _timegroup = require('./timegroup.js');

var _timegroup2 = _interopRequireDefault(_timegroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var app = (0, _express2.default)();

app.use(_express2.default.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.send('hello world');
});

app.get('/timegroup/list', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_req, _res) {
        var keys, result, list;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return new _timegroup2.default().getKeys();

                    case 2:
                        keys = _context.sent;
                        result = [];

                    case 4:
                        if (!keys.length) {
                            _context.next = 12;
                            break;
                        }

                        list = new _timegroup2.default(keys.shift());
                        _context.next = 8;
                        return list.list();

                    case 8:
                        list = _context.sent;

                        result.push(list);
                        _context.next = 4;
                        break;

                    case 12:
                        _res.json(result);

                    case 13:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}());

exports.default = app;