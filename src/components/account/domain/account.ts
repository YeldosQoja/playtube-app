import {
  AccountId,
  AccountName,
  AuthUserId,
  BirthDate,
  EmailAddress,
  Username,
} from "./value-objects.js";

export interface AccountSnapshot {
  id: number;
  authUserId: string;
  firstName: string;
  lastName: string;
  username: string;
  birthDate: string;
  email: string | null;
}

export class Account {
  constructor(
    private id: AccountId,
    private authUserId: AuthUserId,
    private firstName: AccountName,
    private lastName: AccountName,
    private username: Username,
    private birthDate: BirthDate,
    private email: EmailAddress | null = null,
  ) {}

  public getId() {
    return this.id;
  }

  public getAuthUserId() {
    return this.authUserId;
  }

  public getFirstName() {
    return this.firstName;
  }

  public getLastName() {
    return this.lastName;
  }

  public getUsername() {
    return this.username;
  }

  public getBirthdate() {
    return this.birthDate;
  }

  public getEmail() {
    return this.email;
  }

  updateProfile(
    firstName: AccountName,
    lastName: AccountName,
    username: Username,
    email: EmailAddress | null,
  ): void {
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email;
  }

  toSnapshot(): AccountSnapshot {
    return {
      id: this.id.value,
      authUserId: this.authUserId.value,
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      username: this.username.value,
      birthDate: this.birthDate.toISOString(),
      email: this.email?.value ?? null,
    };
  }
}

export const createAccount = (
  id: AccountId,
  authUserId: AuthUserId,
  firstName: AccountName,
  lastName: AccountName,
  username: Username,
  birthDate: BirthDate,
  email?: EmailAddress | null,
): Account => {
  return new Account(
    id,
    authUserId,
    firstName,
    lastName,
    username,
    birthDate,
    email ?? null,
  );
};
