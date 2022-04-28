const server = require('./server');
const request = require('supertest');
const db = require('../data/db-config');
const Car = require('./cars/cars-model');

beforeAll(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
});

beforeEach(async () => {
    await db('cars').truncate();
    await db('cars')
        .insert([
            { name: 'Toyota' },
            { name: 'Ford' },
            { name: 'Chevy' },
        ])
});

afterAll(async () => {
    await db.destroy();
});

test('make sure env set correctly', () => {
    expect(process.env.NODE_ENV).toBe('testing');
});

describe('database tests', () => {
    test('getAll', async () => {
        const result = await Car.getAll();
        expect(result.constructor.name).toBe('Array');
        expect(result.length).toBe(3);
        expect(result[1]).toMatchObject({ name: 'Ford' });
    });
    test('insert', async () => {
        let result = await Car.insert({ name: 'Lexus' });
        expect(result).toHaveProperty('name', 'Lexus');
        expect(result.id).toBe(4);
        result = await Car.getAll();
        expect(result.length).toBe(4);
    });
    test('getById', async () => {
        let result = await Car.getById(0);
        expect(result).not.toBeDefined();
        result = await Car.getById(1);
        expect(result).toBeDefined();
        expect(result.name).toBe('Toyota');
    });
    test('update', async () => {
        let result = await Car.update(3, { name: 'Mazda' });
        expect(result).toEqual({ id: 3, name: 'Mazda' });
        result = await Car.getAll();
        expect(result).toHaveLength(3);
    });
    test('remove', async () => {
        let result = await Car.remove(1);
        expect(result).toHaveProperty('name', 'Toyota');
        result = await Car.getAll();
        expect(result).toHaveLength(2);
        expect(result[1].id).toBe(3);
    });
});

describe('HTTP API tests', () => {
    test('GET /cars', async () => {
        const res = await request(server).get('/cars');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(3);
    });
    test('GET /cars/:id', async () => {
        let res = await request(server).get('/cars/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 1, name: 'Toyota' });

        res = await request(server).get('/cars/100');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'car not found');
    });
    test('POST /cars', async () => {
        let res = await request(server).post('/cars').send({ name: 'Acura' });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ id: 4, name: 'Acura' });

        let result = await Car.getAll();
        expect(result).toHaveLength(4);

        res = await request(server).post('/cars').send({});
        expect(res.status).toBe(500);

        result = await Car.getAll();
        expect(result).toHaveLength(4);
    });
    test('DELETE /cars/:id', async () => {
        let res = await request(server).delete('/cars/2');
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ id: 2, name: 'Ford' });

        let result = await Car.getAll();
        expect(result).toHaveLength(2);

        res = await request(server).delete('/cars/2');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'car not found');

        result = await Car.getAll();
        expect(result).toHaveLength(2);
    });
    test('PUT /cars/:id', async () => {
        let res = await request(server).put('/cars/3').send({ name: 'Acura' });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ id: 3, name: 'Acura' });

        let result = await Car.getById(3);
        expect(result).toHaveProperty('name', 'Acura');

        result = await Car.getAll();
        expect(result).toHaveLength(3);

        res = await request(server).put('/cars/300').send({ name: 'Acura' });
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'car not found');

        res = await request(server).put('/cars/1').send({ name: null });
        expect(res.status).toBe(500);
    });
});
