import Queue from 'bull';
import config from '../config';
import assert from 'assert';
import {getDispatcher} from './index';
import {log} from '../utils';
import i18n from '../i18n';

export default class MqWorker {
  _isrunning;

  constructor(type) {
    assert(type);
    this.type = type;
  }

  get isRunning() {
    return this._isrunning;
  }

  get queue() {
    if (this._queue) {
      return this._queue;
    }
    const mqconfig = config.get('bus')[this.type + 'MQ'] || {};
    log(i18n.t('连接mq'));
    this._queue = Queue(mqconfig.name, mqconfig.port, mqconfig.host);
    return this._queue;
  }

  run() {
    if (this._isrunning) {
      return;
    }
    this._isrunning = true;
    this.queue.process(async(job) => {
      log(i18n.t('收到mq消息'));
      await getDispatcher(this.type).dispatch({
        ...job.data,
        type: this.type
      });
    });
  }

  pause() {
    this.queue.pause().then(function() {
      this._isrunning = false;
    });
  }

  resume() {
    this.queue.resume().then(function() {
      this._isrunning = true;
    });
  }

  stop() {
    this.queue.close();
  }

}
