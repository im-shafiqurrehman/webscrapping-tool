import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login, signup } from './app.controller.js';
import { env } from '../config/env.js';
import { User } from '../models/index.js';

type MutableUserModel = {
  exists: (filter: unknown) => Promise<unknown>;
  create: (document: Record<string, unknown>) => Promise<Record<string, unknown>>;
  findOne: (filter: unknown) => { select: (fields: string) => Promise<Record<string, unknown> | null> };
};

function responseRecorder() {
  let statusCode = 200;
  let payload: unknown;
  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(value: unknown) {
      payload = value;
      return this;
    },
  } as Response;
  return { response, statusCode: () => statusCode, payload: () => payload };
}

test('signup hashes the password and the returned account can log in', async () => {
  const model = User as unknown as MutableUserModel;
  const original = { exists: model.exists, create: model.create, findOne: model.findOne };
  let storedUser: Record<string, unknown> | null = null;

  try {
    model.exists = async () => null;
    model.create = async (document) => {
      storedUser = { _id: '507f1f77bcf86cd799439011', ...document };
      return storedUser;
    };

    const signupResponse = responseRecorder();
    await signup(
      {
        body: { name: '  QA User  ', email: ' QA@EXAMPLE.COM ', password: 'Verified123!' },
      } as Request,
      signupResponse.response,
    );

    assert.equal(signupResponse.statusCode(), 201);
    const createdUser = storedUser as Record<string, unknown> | null;
    assert.ok(createdUser);
    assert.equal(createdUser.email, 'qa@example.com');
    assert.equal(createdUser.role, 'researcher');
    assert.equal(await bcrypt.compare('Verified123!', String(createdUser.passwordHash)), true);

    const signupPayload = signupResponse.payload() as {
      token: string;
      user: { id: string; email: string; role: string; passwordHash?: string };
    };
    assert.equal(signupPayload.user.passwordHash, undefined);
    const decoded = jwt.verify(signupPayload.token, env.JWT_SECRET) as jwt.JwtPayload;
    assert.equal(decoded.id, '507f1f77bcf86cd799439011');
    assert.equal(decoded.role, 'researcher');
    assert.ok(Number(decoded.exp) > Number(decoded.iat));

    model.findOne = () => ({
      select: async () => storedUser,
    });
    const loginResponse = responseRecorder();
    await login(
      { body: { email: 'QA@EXAMPLE.COM', password: 'Verified123!' } } as Request,
      loginResponse.response,
    );
    const loginPayload = loginResponse.payload() as { token: string; user: { email: string } };
    assert.equal(loginResponse.statusCode(), 200);
    assert.equal(loginPayload.user.email, 'qa@example.com');
    assert.equal(typeof loginPayload.token, 'string');
  } finally {
    model.exists = original.exists;
    model.create = original.create;
    model.findOne = original.findOne;
  }
});
