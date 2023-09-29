import { FruitInput } from "services/fruits-service";
import app from "../src/app";
import supertest from "supertest";
import fruits from "data/fruits";
import fruitsRepository from "repositories/fruits-repository";

const server = supertest(app);

beforeEach(() => {
  fruits.length = 0;
})

describe('POST /fruits', () => {
  it('should return 201 when successfully creating a fruit', async () => {
    const fruit: FruitInput = {
      name: 'Abacaxi',
      price: 9
    }

    const response = await server.post('/fruits').send(fruit);

    expect(response.status).toBe(201);
  });

  it('should return 409 when inserting a fruit that is already registered', async () => {
    const fruit: FruitInput = {
      name: 'Abacaxi',
      price: 9
    };
    fruitsRepository.insertFruit(fruit);

    const response = await server.post('/fruits').send(fruit);

    expect(response.status).toBe(409);
  });

  it('should return 422 when inserting a fruit with data missing', async () => {
    const fruit = {
      name: 'Abacaxi'
    };
    const response = await server.post('/fruits').send(fruit);

    expect(response.status).toBe(422);
  });
});

describe('GET /fruits', () => {
  it("shoud return 404 when trying to get a fruit by an id that doesn't exist", async () => {
    const response = await server.get('/fruits/1234');

    expect(response.status).toBe(404);
  });

  it('should return 400 when id param is present but not valid', async () => {
    const response = await server.get('/fruits/a');

    expect(response.status).toBe(400);
  });

  it('should return one fruit when given a valid and existing id', async () => {
    const fruit: FruitInput = {
      name: 'Abacaxi',
      price: 9
    }
    fruitsRepository.insertFruit(fruit);

    const response = await server.get('/fruits/1');
    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ ...fruit, id: 1 });
  });

  it('should return all fruits if no id is present', async () => {
    const fruit1: FruitInput = {
      name: 'Abacaxi',
      price: 9
    }

    const fruit2: FruitInput = {
      name: 'banana',
      price: 14
    }

    fruitsRepository.insertFruit(fruit1);
    fruitsRepository.insertFruit(fruit2)

    const response = await server.get('/fruits');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          price: expect.any(Number)
        })
      ])
    )
  });
});