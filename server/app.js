const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 5001;

app.use(bodyParser.json());

// Importa las rutas de usuarios
const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

//ruta de recetas
const recipeRoutes = require('./routes/recipeRoutes');
app.use('/recipe', recipeRoutes);

//ruta de reviews
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/review', reviewRoutes);

//inicializando servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
  });
  