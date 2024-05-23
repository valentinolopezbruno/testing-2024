const express = require("express");
const cors = require('cors'); 
const fileUpload = require("express-fileupload");
const http = require('http'); 
const socketIo = require('socket.io'); 

const allowedOrigins = ["http://localhost:4200", "https://admintuttobene.web.app","https://fronttuttobene.web.app"];

const app = express();
const server = http.createServer(app);

const configureCors = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Origin not allowed by CORS'));
  }
};

const corsOptions = {
  origin: configureCors,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204, 
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './uploads'
}));

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Exportar io para usarlo en los controladores
module.exports = io;

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