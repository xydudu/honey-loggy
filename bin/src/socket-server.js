'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _package = require('../package.json');

var _logmsg = require('./logmsg.js');

var _logmsg2 = _interopRequireDefault(_logmsg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class() {
        _classCallCheck(this, _class);

        var _ = this;
        _.server = _net2.default.createServer(function (_socket) {
            _socket.on('data', function (_msg) {
                _._receive(_msg, _socket);
            });
        });
        _.server.listen(_package.server.port, _package.server.host);
    }

    _createClass(_class, [{
        key: '_receive',
        value: function _receive(_msg, _socket) {
            //let socket = this.socket
            console.log('[msg] ' + _msg);
            new _logmsg2.default(_msg.toString()).save();
        }
    }]);

    return _class;
}();

exports.default = _class;