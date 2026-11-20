
process.env.JWT_SECRET = "secreto-exclusivo-para-pruebas";

// Simular el modelo de usuarios
jest.mock("../src/models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

// Simular bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const User = require("../src/models/User");
const bcrypt = require("bcryptjs");

const usuarioId = "507f1f77bcf86cd799439011";

const usuario = {
  _id: usuarioId,
  nombre: "Usuario Prueba",
  email: "usuario@ejemplo.com",
  password: "hash-de-prueba"
};

describe("Pruebas de autenticación JWT", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  // PRUEBA 1
  test("Permite registrar un usuario", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hash-de-prueba");
    User.create.mockResolvedValue(usuario);

    const respuesta = await request(app)
      .post("/api/auth/registro")
      .send({
        nombre: "Usuario Prueba",
        email: "usuario@ejemplo.com",
        password: "ClaveSegura123!"
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.mensaje).toBe(
      "Usuario registrado correctamente"
    );

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        password: "hash-de-prueba"
      })
    );
  });

  // PRUEBA 2
  test("Rechaza contraseñas cortas", async () => {
    const respuesta = await request(app)
      .post("/api/auth/registro")
      .send({
        nombre: "Usuario Prueba",
        email: "usuario@ejemplo.com",
        password: "123"
      });

    expect(respuesta.status).toBe(400);
  });

  // PRUEBA 3
  test("Rechaza correos duplicados", async () => {
    User.findOne.mockResolvedValue(usuario);

    const respuesta = await request(app)
      .post("/api/auth/registro")
      .send({
        nombre: "Usuario Prueba",
        email: "usuario@ejemplo.com",
        password: "ClaveSegura123!"
      });

    expect(respuesta.status).toBe(409);
  });

  // PRUEBA 4
  test("Permite iniciar sesión correctamente", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(usuario)
    });

    bcrypt.compare.mockResolvedValue(true);

    const respuesta = await request(app)
      .post("/api/auth/login")
      .send({
        email: "usuario@ejemplo.com",
        password: "ClaveSegura123!"
      });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.token).toBeDefined();

    const decoded = jwt.verify(
      respuesta.body.token,
      process.env.JWT_SECRET
    );

    expect(decoded.sub).toBe(usuarioId);
  });

  // PRUEBA 5
  test("Rechaza una contraseña incorrecta", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(usuario)
    });

    bcrypt.compare.mockResolvedValue(false);

    const respuesta = await request(app)
      .post("/api/auth/login")
      .send({
        email: "usuario@ejemplo.com",
        password: "ClaveIncorrecta123"
      });

    expect(respuesta.status).toBe(401);
  });

  // PRUEBA 6
  test("Rechaza un usuario inexistente", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const respuesta = await request(app)
      .post("/api/auth/login")
      .send({
        email: "noexiste@ejemplo.com",
        password: "ClaveSegura123!"
      });

    expect(respuesta.status).toBe(401);
  });

  // PRUEBA 7
  test("Bloquea el perfil sin JWT", async () => {
    const respuesta = await request(app)
      .get("/api/auth/perfil");

    expect(respuesta.status).toBe(401);
  });

  // PRUEBA 8
  test("Permite acceder al perfil con JWT válido", async () => {
    const token = jwt.sign(
      { sub: usuarioId },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const respuesta = await request(app)
      .get("/api/auth/perfil")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.usuarioId).toBe(usuarioId);
  });

});
