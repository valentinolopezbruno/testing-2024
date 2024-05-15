const express = require("express");
const cors = require('cors'); // Importa el middleware cors
const fileUpload = require("express-fileupload")
const http = require('http'); // Importa el módulo HTTP nativo
const socketIo = require('socket.io'); // Importa socket.io

const app = express();
const server = http.createServer(app); // Crea un servidor HTTP usando Express
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",  // Ajusta esto según tus necesidades
    methods: ["GET", "POST"],
    credentials: true
  }
});
// Exportar io para usarlo en los controladores
module.exports = io ;

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

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads'
}));

// Importar y usar rutas
const detallePedidoRoutes = require('./routes/detallePedido.routes');
app.use('/', detallePedidoRoutes);
const horarioRoutes = require('./routes/horario.routes');
app.use('/', horarioRoutes);
const pedidoRoutes = require('./routes/pedido.routes');
app.use('/', pedidoRoutes);
const variacionRoutes = require('./routes/variacion.routes');
app.use('/', variacionRoutes);
const varianteRoutes = require('./routes/variante.routes');
app.use('/', varianteRoutes);
const productoRoutes = require('./routes/producto.routes');
app.use('/', productoRoutes);
const categoriaRoutes = require('./routes/categoria.routes');
app.use('/', categoriaRoutes);

server.listen(3001, () => {
  console.log("Servidor corriendo en el puerto 3001");
});

// Configurar la conexión de WebSocket
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

