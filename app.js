const express = require("express");
const cors = require('cors'); // Importa el middleware cors
const fileUpload = require("express-fileupload")

const app = express();

const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = ['http://localhost:4200'];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204, // Algunas respuestas HTTP exitosas no tienen contenido
  };


app.use(cors(corsOptions));
app.use(express.json());

// Note that this option available for versions 1.0.0 and newer. 
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './uploads'
  }));

//  VARIACION
const variacionRoutes = require('./routes/variacion.routes');
app.use('/', variacionRoutes); 
// VARIANTE
const varianteRoutes = require('./routes/variante.routes');
app.use('/', varianteRoutes); 
// PRODUCTO
const productoRoutes = require('./routes/producto.routes');
app.use('/', productoRoutes); 
// CATEGORIA
const categoriaRoutes = require('./routes/categoria.routes');
app.use('/', categoriaRoutes); 




app.listen(3001, () =>  {
    console.log("servidor corriendo en el puerto 3001")
})