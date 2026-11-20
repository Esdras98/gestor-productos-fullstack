
process.env.JWT_SECRET = "clave-segura-solo-para-pruebas";

// Simular las operaciones de MongoDB
jest.mock("../src/models/Product", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn()
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const Product = require("../src/models/Product");

const usuarioId = "507f1f77bcf86cd799439011";
const productoId = "507f1f77bcf86cd799439012";

const token = jwt.sign(
  { sub: usuarioId },
  process.env.JWT_SECRET,
  { expiresIn: "2h" }
);

const productoEjemplo = {
  _id: productoId,
  nombre: "Laptop Lenovo",
  descripcion: "Laptop con 16 GB de RAM",
  precio: 12500,
  stock: 8,
  propietario: usuarioId
};

describe("Pruebas CRUD de productos", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("1. Rechaza usuarios sin token", async () => {
    const respuesta = await request(app)
      .get("/api/productos");

    expect(respuesta.status).toBe(401);
  });

  test("2. Rechaza tokens inválidos", async () => {
    const respuesta = await request(app)
      .get("/api/productos")
      .set("Authorization", "Bearer token-falso");

    expect(respuesta.status).toBe(401);
  });

  test("3. Permite consultar productos", async () => {
    Product.find.mockResolvedValue([productoEjemplo]);

    const respuesta = await request(app)
      .get("/api/productos")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].nombre).toBe("Laptop Lenovo");

    expect(Product.find).toHaveBeenCalledWith({
      propietario: usuarioId
    });
  });

  test("4. Permite crear productos", async () => {
    Product.create.mockResolvedValue(productoEjemplo);

    const respuesta = await request(app)
      .post("/api/productos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Laptop Lenovo",
        descripcion: "Laptop con 16 GB de RAM",
        precio: 12500,
        stock: 8
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.mensaje).toBe(
      "Producto creado correctamente"
    );

    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        propietario: usuarioId,
        nombre: "Laptop Lenovo"
      })
    );
  });

  test("5. Rechaza precios negativos", async () => {
    const respuesta = await request(app)
      .post("/api/productos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Producto inválido",
        precio: -100,
        stock: 5
      });

    expect(respuesta.status).toBe(400);
    expect(Product.create).not.toHaveBeenCalled();
  });

  test("6. Permite actualizar productos", async () => {
    Product.findOneAndUpdate.mockResolvedValue({
      ...productoEjemplo,
      precio: 14500
    });

    const respuesta = await request(app)
      .put(`/api/productos/${productoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Laptop Lenovo",
        descripcion: "Laptop actualizada",
        precio: 14500,
        stock: 8
      });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.producto.precio).toBe(14500);

    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: productoId,
        propietario: usuarioId
      }),
      expect.any(Object),
      expect.objectContaining({
        runValidators: true
      })
    );
  });

  test("7. Permite eliminar productos", async () => {
    Product.findOneAndDelete.mockResolvedValue(productoEjemplo);

    const respuesta = await request(app)
      .delete(`/api/productos/${productoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.mensaje).toBe(
      "Producto eliminado correctamente"
    );

    expect(Product.findOneAndDelete).toHaveBeenCalledWith({
      _id: productoId,
      propietario: usuarioId
    });
  });

  test("8. Devuelve 404 si el producto no existe", async () => {
    Product.findOne.mockResolvedValue(null);

    const respuesta = await request(app)
      .get(`/api/productos/${productoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.status).toBe(404);
  });

  test("9. Rechaza identificadores inválidos", async () => {
    const respuesta = await request(app)
      .get("/api/productos/identificador-invalido")
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.status).toBe(400);
  });

});
