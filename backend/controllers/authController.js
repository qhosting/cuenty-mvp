
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const pool = require('../config/database');

/**
 * Registro de administrador
 * En producción, esto debería ser un endpoint protegido o script de inicialización
 */
exports.registrarAdmin = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Verificar si ya existe un admin con ese username
    const existeQuery = 'SELECT * FROM admins WHERE username = $1';
    const existe = await pool.query(existeQuery, [username]);

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear tabla de admins si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insertar admin
    const query = `
      INSERT INTO admins (username, password, email)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, fecha_creacion
    `;
    const result = await pool.query(query, [username, hashedPassword, email]);

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar administrador' });
  }
};

/**
 * Login de administrador
 */
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Buscar admin
    const query = 'SELECT * FROM admins WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const admin = result.rows[0];

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, admin.password);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      isAdmin: true
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

/**
 * Obtener perfil del admin autenticado
 */
exports.obtenerPerfil = async (req, res) => {
  try {
    const query = 'SELECT id, username, email, fecha_creacion FROM admins WHERE id = $1';
    const result = await pool.query(query, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};
