const database = require('../data/dbConfig');
const Users = require('./users/users-model');
const server = require('./server');
const request = require('supertest');

// Write your tests here

beforeAll(async () => {
  await database.migrate.rollback();
  await database.migrate.latest();
});

beforeEach(async () => {
  await database('users').truncate();
});

afterAll(async () => {
  await database.destroy();
});

test('Sanity checks', () => {
  expect(true).not.toBe(false);
  expect(99 * 99).toEqual(9801);
});

describe('Registration endpoint', () => {
  test('Responds with correct error if no username', async () => {
    const response = await request(server).post('/api/auth/register').send({ password: 'placeholder' });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('username and password required');
  });
  test('Responds with correct error if no password', async () => {
    const response = await request(server).post('/api/auth/register').send({ username: 'placeholder' });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('username and password required');
  });
});

describe('Log in endpoint', () => {
  test('Responds with correct error if username does not exist', async () => {
    const response = await request(server).post('/api/auth/login').send({ username: 'placeholder', password: 'placeholder' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('invalid credentials');
  });
  test('Responds with correct error if password is incorrect', async () => {
    await request(server).post('/api/auth/register').send({ username: 'placeholder', password: 'placeholder' });
    const response = await request(server).post('/api/auth/login').send({ username: 'placeholder', password: 'incorrect' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('invalid credentials');
  });
});

describe('Jokes endpoint', () => {
  test('Responds with correct error if no token', async () => {
    const response = await request(server).get('/api/jokes');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('token required');
  });
  test('Responds with jokes if valid token', async () => {
    await request(server).post('/api/auth/register').send({ username: 'placeholder', password: 'placeholder' });
    const initialResponse = await request(server).post('/api/auth/login').send({ username: 'placeholder', password: 'placeholder' });
    const token = initialResponse.body.token;
    const subsequentResponse = await request(server).get('/api/jokes').set({ authorization: token });
    expect(subsequentResponse.status).toBe(200);
    expect(subsequentResponse.body).toBeDefined;
    expect(subsequentResponse.body).toBeInstanceOf(Array);
    expect(subsequentResponse.body).toHaveLength(3);
  });
});
