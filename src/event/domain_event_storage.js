import config from '../config';
import err from '../err';
import i18n from '../i18n';
import EventStorage from './event_storage';

export default class DomainEventStorage extends EventStorage{
  constructor() {
    super();
    let eventConfig = config.get('event');
    let EventStorage = require(`./${eventConfig.storage}_storage`).default;
    if (!EventStorage)
      throw Error(
        err.configFailed,
        i18n.t('事件存储服务未正确配置，可以在config/event.js中指定')
      );

    this.eventStorage = new EventStorage();
  }

  async loadEvents(name, id, version) {
    let results;
    if (version) {
      results = await this.eventStorage.select({
        event_type: name,
        event_id: id,
        version: ['<', version]
      });
    }
    results = await this.eventStorage.select({
      event_type: name,
      event_id: id
    });
    let events = [];
    results.forEach(s => {
      events.push({
        data: JSON.parse(s.data),
        data: s.data,
        eventType: s.name,
        eventid: s.event_id,
        sourceid: s.source_id,
        branch: s.branch,
        version: s.version,
        timestamp: s.timestamp
      });
    });
    return events;
  }

  async saveEvent(event) {
    await this.eventStorage.inert({
      id: uuid.v1(),
      eventType: event.name,
      eventid: event.id,
      sourceid: event.sourceid,
      data: JSON.stringify(event.data),
      timestamp: event.timestamp,
      branch: event.branch,
      version: event.version
    });
  }

  async commit() {
    await this.eventStorage.commit();
  }

  async rollback() {
    await this.eventStorage.rollback();
  }
}
