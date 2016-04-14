import config from '../config';
import mqbus from './mq_bus';
import directbus from './direct_bus';
import dispatcher from './message_dipatcher';
import err from '../err'

const busConfig = config.get('bus');

let commandDispatcher = (busConfig.commandDispatcher || busConfig.dispatcher) == 'message_dipatcher'? new dispatcher():
  typeof (busConfig.commandDispatcher || busConfig.dispatcher) === 'function'? new (busConfig.commandDispatcher || busConfig.dispatcher) :
  null;

let eventDispatcher = (busConfig.eventDispatcher || busConfig.dispatcher) == 'message_dipatcher'? new dispatcher():
    typeof (busConfig.eventDispatcher || busConfig.dispatcher) === 'function'? new (busConfig.eventDispatcher || busConfig.dispatcher) :
    null;

if (commandbus == null)
      throw {code:err.configFailed, msg: '消息分发器未正确配置，可以在config/bus.js中指定'};
if (eventbus == null)
      throw {code:err.configFailed, msg: '事件总线未正确配置，可以在config/bus.js中指定'};

let commandbus = (busConfig.commandBus || busConfig.type) === 'mq'? new mqbus() :
  (busConfig.commandBus || busConfig.type) === 'direct' ? new directbus() :
  typeof (busConfig.commandBus || busConfig.type) === 'function'? new (busConfig.commandBus || busConfig.type)('command',commandDispatcher) :
  null;

let eventbus = (busConfig.eventBus || busConfig.type) === 'mq'? new mqbus() :
  (busConfig.eventBus || busConfig.type) === 'direct' ? new directbus() :
  typeof (busConfig.eventBus || busConfig.type) === 'function'? new (busConfig.eventBus || busConfig.type)('event',eventDispatcher) :
  null;

if (commandbus == null)
  throw {code:err.configFailed, msg: '命令总线未正确配置，可以在config/bus.js中指定'};
if (eventbus == null)
  throw {code:err.configFailed, msg: '事件总线未正确配置，可以在config/bus.js中指定'};


export default {
  eventbus,
  commandbus,
  publishEvent: function (...messages){
    if (messages.length == 2 && typeof messages[0] === 'string'){
      bus.publish({
        name: messages[0],
        data: message[1]
      });
    }else{
      bus.publish(messages);
    }
    bus.commit();
  },
  publishCommand: function (...messages){
    if (messages.length == 2 && typeof messages[0] === 'string'){
      commandbus.publish({
        name: messages[0],
        data: message[1]
      });
    }else{
      commandbus.publish(messages);
    }
    commandbus.commit();
  }
}