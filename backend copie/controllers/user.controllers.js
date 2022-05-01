const db = require("../models/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

exports.signUp = (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      db.User.create({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        avatar: `${req.protocol}://${req.get(
          "host"
        )}/public/defaultPicture/random-user.png`,
        bio: req.body.bio,
      })
        .then((user) => {
          const dirname = "picOf-" + user.id;
          fs.mkdir(`public/postPic/${dirname}`, () => {
            fs.mkdir(`public/profilPic/${dirname}`, () => {
              res.status(201).json({
                message:
                  "Votre compte a été crée avec succés, vous pouvez desormais vous connecter.",
              });
            });
          });
        })
        .catch((err) =>
          res.status(400).json({
            error: err.parent.errno,
            sqlMessage: err.parent.sqlMessage,
          })
        );
    })
    .catch((err) => res.status(500).json({ err }));
};

exports.signIn = (req, res) => {
  db.User.findOne({
    where: {
      email: req.body.email,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
          }
          res.status(200).json({
            userId: user.id,
            token: jwt.sign(
              {
                userId: user.id,
                isAdmin: user.isAdmin,
              },
              "TOKEN",
              {
                expiresIn: "24h",
              }
            ),
          });
        })
        .catch((err) => res.status(500).json(err));
    })
    .catch((err) => res.status(500).json(err));
};

exports.updateUser = (req, res) => {
  db.User.findOne({
    where: {
      id: req.params.id,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      if (req.auth.userId !== user.id && req.admin.isAdmin === false) {
        return res.status(401).json({ message: "Requête non autorisée" });
      }

      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
          }

          user
            .update({ username: req.body.username })
            .then(() => res.status(200).json({ username: req.body.username }))
            .catch((err) => res.status(500).json({ err }));
        })
        .catch((err) => res.status(500).json({ err }));
    })
    .catch((err) => res.status(500).json({ err }));
};
exports.updateBio = (req, res) => {
  db.User.findOne({
    where: {
      id: req.params.id,
    },
  })
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .json({ message: "Utilisateur inconnu non trouvé" });
      }
      if (req.auth.userId !== user.id && req.admin.isAdmin === false) {
        return res.status(401).json({ message: "Requête non autorisée" });
      }

      user
        .update({ bio: req.body.bio })
        .then(() => res.status(200).json({ bio: req.body.bio }))
        .catch((err) => res.status(500).json({ err }));
    })
    .catch((err) => res.status(500).json({ err }));
};

exports.getOneUser = (req, res) => {
  db.User.findOne({
    attributes: { exclude: ["password"] },
    where: { id: req.params.id },
  })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "Utilisateur non trouvé" });
      }
      res.status(200).json(user);
    })
    .catch((err) => res.status(500).json({ err }));
};
exports.getAllUsers = (req, res, next) => {
  db.User.findAll({
    attributes: { exclude: ["password"] },
  })
    .then((users) => res.status(200).json(users))
    .catch((err) => res.status(400).json({ err }));
};

exports.deleteUser = (req, res) => {
  db.User.findOne({
    where: {
      id: req.params.id,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "Aucun utilisateur trouvé" });
      }
      if (user.id !== req.auth.userId && req.admin.isAdmin === false) {
        return res.status(401).json({ message: "Requête non autorisée" });
      } else {
        const dirname = user.id;
        fs.rmdir(
          `public/postPic/picOf-${dirname}`,
          { recursive: true, force: true },
          () => {
            fs.rmdir(
              `public/profilPic/picOf-${dirname}`,
              { recursive: true, force: true },
              () => {
                user
                  .destroy()
                  .then(() => {
                    res
                      .status(200)
                      .json({ message: "Compte supprimé avec succés" });
                  })
                  .catch((err) => res.satus(400).json({ err }));
              }
            );
          }
        );
      }
    })
    .catch((err) => res.status(500).json({ err }));
};

exports.updateAvatar = (req, res) => {
  db.User.findOne({
    where: {
      id: req.params.id,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "Utilisateur non trouvé" });
      }
      if (req.auth.userId !== user.id) {
        return res.status(401).json({ message: "Requête non autorisée" });
      }
      user
        .update({
          avatar: `${req.protocol}://${req.get(
            "host"
          )}/public/profilPic/picOf-${req.auth.userId}/${req.file.filename}`,
        })
        .then(() =>
          res.status(200).json({ message: "avatar mis à jour avec succés" })
        )
        .catch((err) => res.status(500).json({ err }));
    })
    .catch((err) => res.status(500).json({ err }));
};
