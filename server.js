require("dotenv").config();

const app = require("./app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor");
    process.exit(1);
  }
}

iniciar();