const sqlite3 = require('sqlite3');
// Importa la biblioteca bcrypt
const bcrypt = require('bcrypt'); 
const multer = require('multer');

// Crear una instancia de la base de datos y mantenerla global
const db = new sqlite3.Database('DataBaseP.db');

// Configura Multer para manejar la carga de imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//crear review
exports.createReview = (req, res) => {
    const { recipeId } = req.params;
    const userId = req.body.userId; // Se Asume que el ID del usuario está en el cuerpo de la solicitud
    const liked = true; // El usuario está dando "like"

    // Verificar si el usuario y la receta existen
    const checkUserQuery = 'SELECT * FROM users WHERE id_user = ?';
    const checkRecipeQuery = 'SELECT * FROM recipes WHERE id_recipe = ?';

    db.get(checkUserQuery, [userId], (userErr, userRow) => {
        if (userErr) {
            return res.status(500).json({ error: 'Error al verificar el usuario' });
        }

        if (!userRow) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        db.get(checkRecipeQuery, [recipeId], (recipeErr, recipeRow) => {
            if (recipeErr) {
                return res.status(500).json({ error: 'Error al verificar la receta' });
            }

            if (!recipeRow) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }

            // Insertar el "like" en la tabla de reviews
            const insertLikeQuery = 'INSERT INTO reviews (liked, id_user, id_recipe) VALUES (?, ?, ?)';
            db.run(insertLikeQuery, [liked, userId, recipeId], (insertErr) => {
                if (insertErr) {
                    return res.status(500).json({ error: 'Error al dar "like" a la receta' });
                }

                return res.status(200).json({ message: '¡Has dado "like" a la receta!' });
            });
        });
    });
};

// Endpoint para obtener la lista de recetas con "like" de un usuario cuando este en su perfil
exports.likesReview = (req, res) =>{
    const { userId } = req.body; // El ID del usuario se espera en el cuerpo de la solicitud

    // Consulta SQL para obtener la lista de recetas con "like" de un usuario específico
    const getLikesQuery = 'SELECT recipes.id_recipe, recipes.name FROM recipes ' +
        'INNER JOIN reviews ON recipes.id_recipe = reviews.id_recipe ' +
        'WHERE reviews.id_user = ? AND reviews.liked = 1';

    db.all(getLikesQuery, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener la lista de recetas con "like"' });
        }

        return res.status(200).json(rows);
    });
};
//quitar like
exports.deleteReview = (req, res)=> {
    const { recipeId } = req.params;
    const userId = req.body.userId; // Asume que el ID del usuario está en el cuerpo de la solicitud

    // Verificar si el usuario y la receta existen
    const checkUserQuery = 'SELECT * FROM users WHERE id_user = ?';
    const checkRecipeQuery = 'SELECT * FROM recipes WHERE id_recipe = ?';

    db.get(checkUserQuery, [userId], (userErr, userRow) => {
        if (userErr) {
            return res.status(500).json({ error: 'Error al verificar el usuario' });
        }

        if (!userRow) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        db.get(checkRecipeQuery, [recipeId], (recipeErr, recipeRow) => {
            if (recipeErr) {
                return res.status(500).json({ error: 'Error al verificar la receta' });
            }

            if (!recipeRow) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }

            // Eliminar el "like" de la tabla de reviews
            const deleteLikeQuery = 'DELETE FROM reviews WHERE id_user = ? AND id_recipe = ?';
            db.run(deleteLikeQuery, [userId, recipeId], (deleteErr) => {
                if (deleteErr) {
                    return res.status(500).json({ error: 'Error al quitar "like" a la receta' });
                }

                return res.status(200).json({ message: 'Has quitado "like" a la receta' });
            });
        });
    });
};

// Endpoint para obtener el número de "likes" de una receta
exports.getlikescount = (req, res) => {
    const { recipeId } = req.params;

    // Consulta SQL para contar los "likes" de una receta específica
    const countLikesQuery = 'SELECT COUNT(*) AS likesCount FROM reviews WHERE id_recipe = ? AND liked = 1';

    db.get(countLikesQuery, [recipeId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el número de "likes" de la receta' });
        }

        const likesCount = row ? row.likesCount : 0;

        return res.status(200).json({ likesCount });
    });
};