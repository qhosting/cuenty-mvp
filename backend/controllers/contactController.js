
const enviarContacto = async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    // Validación de campos requeridos
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes',
        detalles: 'Se requieren nombre, email y mensaje'
      });
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        detalles: 'Por favor proporciona un email válido'
      });
    }

    // TODO: Aquí puedes integrar con un servicio de email o guardar en base de datos
    // Por ahora solo registramos en consola
    console.log('📧 Nuevo mensaje de contacto:');
    console.log(`  Nombre: ${nombre}`);
    console.log(`  Email: ${email}`);
    console.log(`  Asunto: ${asunto || 'Sin asunto'}`);
    console.log(`  Mensaje: ${mensaje}`);

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: 'Mensaje enviado exitosamente. Te contactaremos pronto.',
      data: {
        nombre,
        email,
        fecha: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error al procesar contacto:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  enviarContacto
};
