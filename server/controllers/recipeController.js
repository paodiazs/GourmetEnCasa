const sqlite3 = require('sqlite3');
// Importa la biblioteca bcrypt
const bcrypt = require('bcrypt'); 
const multer = require('multer');

// Crear una instancia de la base de datos y mantenerla global
const db = new sqlite3.Database('DataBaseP.db');

// Configura Multer para manejar la carga de imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//crear nueva receta
exports.createRecipe = upload.single('photo'), (req, res) => {
    const { name, desc_preparation, no_portions, difficulty, id_user, id_category, ingredients } = req.body;

    const photoBuffer = req.file.buffer;
    const sqlRecipe = `INSERT INTO recipes (name, desc_preparation, no_portions, difficulty, photo, id_user, id_category) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    let ingredientsObj;
    try {
        ingredientsObj = JSON.parse(ingredients);
    } catch (e) {
        return res.status(400).json({ error: "El campo ingredients debe ser una cadena JSON válida que represente un array." });
    }

    if (!Array.isArray(ingredientsObj)) {
        return res.status(400).json({ error: "El campo ingredients debe ser un array." });
    }
    
    db.run(sqlRecipe, [name, desc_preparation, no_portions, difficulty, photoBuffer, id_user, id_category], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const recipeId = this.lastID;
        const sqlIngredientRelation = `INSERT INTO recipe_ingredients (id_recipe, id_ingredient, quantity, unit_of_mesure) VALUES (?, ?, ?, ?)`;

        ingredientsObj.forEach(ingredient => {
            db.run(sqlIngredientRelation, [recipeId, ingredient.id_ingredient, ingredient.quantity, ingredient.unit_of_mesure], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
            });
        });

        res.json({ message: "Receta añadida exitosamente", data: { id: recipeId } });
    });

};

//actualizar receta
exports.updateRecipe = (req, res) =>{
    const id = req.params.id;
    const { name, desc_preparation, no_portions, difficulty, photo, id_user, id_category, ingredients } = req.body;

    // Primero, verifica si el usuario es el propietario de la receta
    const sqlCheckOwner = `SELECT id_user FROM recipes WHERE id_recipe=?`;
    db.get(sqlCheckOwner, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // Si la receta no existe o el usuario no es el propietario
        if (!row || row.id_user !== id_user) {
            return res.status(403).json({ error: "No tienes permiso para actualizar esta receta." });
        }

        // Si el usuario es el propietario, procede a actualizar
        const sqlUpdate = `UPDATE recipes SET name=?, desc_preparation=?, no_portions=?, difficulty=?, photo=?, id_user=?, id_category=? WHERE id_recipe=?`;
        db.run(sqlUpdate, [name, desc_preparation, no_portions, difficulty, photo, id_user, id_category, id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Elimina todos los ingredientes y los agrega nuevamente
            const sqlDeleteIngredients = `DELETE FROM recipe_ingredients WHERE id_recipe=?`;
            db.run(sqlDeleteIngredients, [id], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                const sqlInsertIngredient = `INSERT INTO recipe_ingredients (id_recipe, id_ingredient, quantity, unit_of_mesure) VALUES (?, ?, ?, ?)`;
                ingredients.forEach(ingredient => {
                    db.run(sqlInsertIngredient, [id, ingredient.id_ingredient, ingredient.quantity, ingredient.unit_of_mesure], (err) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                    });
                });

                res.json({ message: "Receta actualizada exitosamente" });
            });
        });
    });

};

exports.deleteRecipe = (req, res) => {
    const id = req.params.id;

    // Obtiene el id_user del cuerpo de la solicitud
    const userId = req.body.id_user;

    // Primero, verifica si el usuario es el propietario de la receta
    const sqlCheckOwner = `SELECT id_user FROM recipes WHERE id_recipe=?`;
    db.get(sqlCheckOwner, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // Si la receta no existe o el usuario no es el propietario
        if (!row || row.id_user !== userId) {
            return res.status(403).json({ error: "No tienes permiso para eliminar esta receta." });
        }

        // Si el usuario es el propietario, procede a eliminar
        const sqlDeleteIngredients = `DELETE FROM recipe_ingredients WHERE id_recipe=?`;
        db.run(sqlDeleteIngredients, [id], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const sqlDeleteRecipe = `DELETE FROM recipes WHERE id_recipe=?`;
            db.run(sqlDeleteRecipe, [id], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({ message: "Receta eliminada exitosamente" });
            });
        });
    });
};

//obtener los datos de la receta
exports.getRecipebyId = (req, res) => {
    const id = req.params.id;
    const sqlRecipe = "SELECT * FROM recipes WHERE id_recipe = ?";
    db.get(sqlRecipe, [id], (err, recipe) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const sqlIngredients = "SELECT ingredients.*, recipe_ingredients.quantity, recipe_ingredients.unit_of_mesure FROM ingredients JOIN recipe_ingredients ON ingredients.id_ingredient = recipe_ingredients.id_ingredient WHERE recipe_ingredients.id_recipe = ?";
        db.all(sqlIngredients, [id], (err, ingredients) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            recipe.ingredients = ingredients;
            res.json({ data: recipe });
        });
    });

};

//insertar datos en una categoría
exports.insertCategory = (req, res) => {
    const { name, description } = req.body;

    const photo = req.file ? req.file.buffer : null;
    // Validar que se haya enviado una imagen
    if (!req.file) {
        return res.status(400).json({ error: "Debe enviar una imagen para la categoría." });
    }

     // obtenemos la imagen en formato buffer

    const sqlCategory = `INSERT INTO category (name, description, photo) VALUES (?, ?, ?)`;

    db.run(sqlCategory, [name, description, photo], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const categoryId = this.lastID;
        res.json({ message: "Categoría añadida exitosamente", data: { id: categoryId } });
    });
};