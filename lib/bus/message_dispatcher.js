'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('../utils');

var _core = require('../core');

var _register = require('../register');

var _register2 = _interopRequireDefault(_register);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);

    this._dispatchingListeners = [];
    this._dispatchFailedListeners = [];
    this._dispatchedListeners = [];
  }

  // message = {name,type,data}


  _createClass(_class, [{
    key: 'dispatch',
    value: function dispatch(message) {
      var _this = this;

      if (!(0, _utils.isString)(message.name) || !(0, _utils.isString)(message.type) || message.type != 'event' && message.type != 'command') {
        (0, _utils.log)('消息无效');
        return;
      }
      var register = register[message.type + 'handler'];
      if (!register) {
        (0, _utils.log)('消息' + message.type + '类型尚未支持');
        return;
      }
      this._onDispatching();
      var handlers = register[message.name] || [];
      handlers.forEach(function (type) {
        var CLS = (0, _core.getType)(type);
        if (!CLS || !(0, _utils.isFunction)(CLS)) return;
        var handler = new CLS();
        if (!handler || !(0, _utils.isFunction)(handler.run)) return;
        var evt = {
          message: message,
          CLS: CLS,
          handler: handler
        };
        (0, _utils.log)('分发消息' + message.name);
        _this._onDispatching(evt);
        try {
          handler.run(message.data || {});
          _this._onDispatched(evt);
          (0, _utils.log)('分发消息' + message.name + '完成');
        } catch (err) {
          evt.err = err;
          (0, _utils.log)('分发消息' + message.name + '失败，' + err);
          _this._onDispatchFaild(evt);
        }
      });
    }
  }, {
    key: 'clear',
    value: function clear() {
      this._dispatchingListeners.clear();
      this._dispatchFailedListeners.clear();
      this._dispatchedListeners.clear();
    }
  }, {
    key: 'addListener',
    value: function addListener(dispatchingListener, dispatchedListener, dispatchFailedListener) {
      if ((0, _utils.isFunction)(dispatchedListener)) this._dispatchingListeners.push(dispatchedListener);
      if ((0, _utils.isFunction)(dispatchedListener)) this._dispatchedListeners.push(dispatchedListener);
      if ((0, _utils.isFunction)(dispatchFailedListener)) this._dispatchFailedListeners.push(dispatchFailedListener);
    }
  }, {
    key: '_onDispatching',
    value: function _onDispatching(event) {
      this._dispatchingListeners.forEach(function (listener) {
        try {
          listener(event);
        } catch (e) {
          (0, _utils.log)(e);
        }
      });
    }
  }, {
    key: '_onDispatchFaild',
    value: function _onDispatchFaild(event) {
      this.dispatchFailedListener.forEach(function (listener) {
        try {
          listener(event);
        } catch (e) {
          (0, _utils.log)(e);
        }
      });
    }
  }, {
    key: '_onDispatched',
    value: function _onDispatched(event) {
      this.dispatchedListener.forEach(function (listener) {
        try {
          listener(event);
        } catch (e) {
          (0, _utils.log)(e);
        }
      });
    }
  }]);

  return _class;
}();

exports.default = _class;