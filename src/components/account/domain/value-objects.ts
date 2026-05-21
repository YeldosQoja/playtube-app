export class AccountId {
  constructor(public readonly value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("Account id must be a positive integer.");
    }
  }

  toNumber(): number {
    return this.value;
  }

  isEqual(accountId: AccountId) {
    return this.value === accountId.toNumber();
  }
}

export class AuthUserId {
  constructor(public readonly value: string) {
    const authUserId = value.trim();

    if (!authUserId.length) {
      throw new Error("Auth user id can't be empty.");
    }

    this.value = authUserId;
  }

  toString(): string {
    return this.value;
  }
}

export class AccountName {
  constructor(public readonly value: string) {
    const name = value.trim();

    if (!name.length) {
      throw new Error("Account name can't be empty.");
    }

    if (name.length > 50) {
      throw new Error("Account name can't be longer than 50 characters.");
    }

    this.value = name;
  }

  toString(): string {
    return this.value;
  }
}

export class Username {
  constructor(public readonly value: string) {
    const username = value.trim();

    if (!username.length) {
      throw new Error("Username can't be empty.");
    }

    if (username.length > 50) {
      throw new Error("Username can't be longer than 50 characters.");
    }

    this.value = username;
  }

  toString(): string {
    return this.value;
  }
}

export class EmailAddress {
  constructor(public readonly value: string) {
    const email = value.trim().toLowerCase();

    if (!email.length) {
      throw new Error("Email address can't be empty.");
    }

    if (email.length > 50) {
      throw new Error("Email address can't be longer than 50 characters.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Email address is invalid.");
    }

    this.value = email;
  }

  toString(): string {
    return this.value;
  }
}

export class BirthDate {
  public readonly value: Date;

  constructor(value: Date | string) {
    const birthDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(birthDate.getTime())) {
      throw new Error("Birth date is invalid.");
    }

    if (birthDate > new Date()) {
      throw new Error("Birth date can't be in the future.");
    }

    this.value = birthDate;
  }

  ageOn(date: Date = new Date()): number {
    let age = date.getUTCFullYear() - this.value.getUTCFullYear();
    const monthDiff = date.getUTCMonth() - this.value.getUTCMonth();
    const hasBirthdayPassed =
      monthDiff > 0 ||
      (monthDiff === 0 && date.getUTCDate() >= this.value.getUTCDate());

    if (!hasBirthdayPassed) {
      age -= 1;
    }

    return age;
  }

  isAtLeast(age: number, date: Date = new Date()): boolean {
    return this.ageOn(date) >= age;
  }

  toISOString(): string {
    return this.value.toISOString();
  }
}
