import { randomUUID } from "node:crypto";

export abstract class DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor() {
    this.eventId = randomUUID();
    this.occurredOn = new Date();
  }

  abstract get eventName(): string;
}
