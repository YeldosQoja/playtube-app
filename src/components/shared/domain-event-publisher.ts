import EventEmitter from "node:events";
import { DomainEvent } from "./domain-event.js";

type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

class DomainEventPublisher {
  private emitter = new EventEmitter();

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>,
  ) {
    this.emitter.on(eventName, handler);
  }

  publish(event: DomainEvent) {
    this.emitter.emit(event.eventName, event);
  }
}

export const domainEventPublisher = Object.freeze(new DomainEventPublisher());
