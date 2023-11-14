const sqlite3 = require('sqlite3');
// Importa la biblioteca bcrypt
const bcrypt = require('bcrypt'); 

const db = new sqlite3.Database('DataBaseP.db');

//CREAR USUARIO sin foto
exports.registerUser = (req, res) => {
  // Implementa la lógica para registrar un usuario aquí
  const { name, last_name, email, password } = req.body;

  // Generar un hash de la contraseña antes de almacenarla
  bcrypt.hash(password, 10, (err, hashedPassword) => { // 10 es el número de rondas de sal
    if (err) {
      return res.status(500).send('Error al encriptar la contraseña');
    }

    // Insertar el usuario en la base de datos con la contraseña encriptada
    db.run("INSERT INTO users (name, last_name, email, password) VALUES (?, ?, ?, ?)", [name, last_name, email, hashedPassword], function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }

      // Respondemos con un mensaje de éxito u otra respuesta apropiada.
      res.status(200).json({ message: 'Registro de usuario exitoso' });
    });
  });
};
// ACTUALIZAR USUARIO sin contraseña
exports.updateUser = (req, res) => {
    const userId = req.params.id; // Captura el ID del usuario a actualizar
    const { name, last_name, email} = req.body; // Nuevos datos del usuario
  
    // Asegúrate de que userId sea un número entero válido
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return res.status(400).json({ message: 'ID de usuario no válido' });
    }
  
    // Realiza una consulta SQL para actualizar el usuario con el ID proporcionado
    const query = "UPDATE users SET name = ?, last_name = ?, email = ? WHERE id_user = ?";
    db.run(query, [name, last_name, email, userIdInt], function(err) {
      if (err) {
        return res.status(500).send(err.message);
      }
  
      // Comprueba si se actualizó algún registro (this.changes es el número de filas afectadas)
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    });
};

//Actualizar contraseña del usuario
exports.updatePassword = (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

  // Primero, verifica que el usuario exista en la base de datos
  db.get("SELECT email, password FROM users WHERE email = ?", email, (err, user) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verifica si la contraseña actual es correcta
    bcrypt.compare(currentPassword, user.password, (compareErr, result) => {
      if (compareErr || !result) {
        return res.status(401).json({ message: 'Contraseña actual incorrecta' });
      }
      // Genera un nuevo hash para la nueva contraseña y actualiza la base de datos
      bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          return res.status(500).send('Error al encriptar la nueva contraseña');
        }

        db.run("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], (updateErr) => {
          if (updateErr) {
            return res.status(500).send(updateErr.message);
          }

          res.status(200).json({ message: 'Contraseña actualizada con éxito' });
        });
      });
    });
  });
};

//Borrar usuario 
exports.deleteUser = (req, res) => {
  const userId = req.params.id; // Captura el ID del usuario que se va a eliminar

  // Asegúrate de que userId sea un número entero válido
  const userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt)) {
    return res.status(400).json({ message: 'ID de usuario no válido' });
  }

  // Realiza una consulta SQL para eliminar el usuario con el ID proporcionado
  const query = "DELETE FROM users WHERE id_user = ?";
  db.run(query, [userIdInt], function(err) {
    if (err) {
      return res.status(500).send(err.message);
    }

    // Comprueba si se eliminó algún registro (this.changes es el número de filas afectadas)
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  });
};

exports.getUserById = (req, res) => {
  const userId = req.params.id; // Captura el ID del usuario a ver

  // Asegúrate de que userId sea un número entero válido
  const userIdInt = parseInt(userId, 10);
  if (isNaN(userIdInt)) {
    return res.status(400).json({ message: 'ID de usuario no válido' });
  }

  // Realiza una consulta SQL para obtener el usuario con el ID proporcionado
  const query = "SELECT name, last_name, email FROM users WHERE id_user = ?";
  db.get(query, [userIdInt], (err, row) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    if (!row) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(row); // Devuelve los datos del usuario
  });
};
