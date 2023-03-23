const pool = require("../../services/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passwordJwt = require("../../services/passwordJwt");

const listTasks = async (req, res) => {
  const { authorization } = req.headers;
  const authorized = authorization.split(" ")[1];
  if (!authorized) {
    return res.status(401).json({ message: "Não autorizado!" });
  }
  try {
    const token = authorization.split(" ")[1];
    const tokenUser = jwt.verify(token, passwordJwt);

    const query =
      "select * from usuarios join tarefas on usuarios.id = usuario_id";

    const { rows } = await pool.query(query);

    const userQuery = rows;

    const filterTaskUser = userQuery.filter((user) => {
      return user.usuario_id === tokenUser.id;
    });

    if (filterTaskUser.length < 1) {
      return res.status(404).json({ message: "Usuario não possui tarefas!" });
    }

    return res.status(200).json(filterTaskUser);
  } catch (error) {
    res.status(404).json({ message: "Erro Interno" });
  }
};
const addUser = async (req, res) => {
  const { email, senha, nome } = req.body;
  const query = "select email from usuarios";
  const responseQuery = await pool.query(query);

  try {
    const encryptedPassword = await bcrypt.hash(senha, 10);
    if (!email || !senha || !nome) {
      return res
        .status(400)
        .json({ message: "Todos os dados são obrigatorios" });
    }
    const userFound = responseQuery.rows.filter((user) => user.email === email);
    if (userFound.length > 0) {
      return res.status(400).json({ message: "Usuario já cadastrado" });
    }
    const queryRegister =
      "insert into usuarios (email, senha, nome) values ($1, $2, $3)";
    const params = [email, encryptedPassword, nome];
    const record = await pool.query(queryRegister, params);

    return res.status(201).json({ message: "Usuario Cadastrado com sucesso!" });
  } catch (error) {
    res.status(404).json({ message: "Erro Interno" });
  }
};
const loginUser = async (req, res) => {
  const { email, senha } = req.body;
  const query = "select * from usuarios where email = $1";
  const params = [email];
  try {
    if (!email || !senha) {
      return res
        .status(404)
        .json({ mensagem: "email e senha são obrigatorios" });
    }
    const responseQuery = await pool.query(query, params);
    if (responseQuery.rowCount < 1) {
      return res.status(404).json({ message: "E-mail ou senha invalida" });
    }
    const validatedPassword = await bcrypt.compare(
      senha,
      responseQuery.rows[0].senha
    );
    if (!validatedPassword) {
      return res.status(400).json({ message: "E-mail ou senha invalida" });
    }
    const token = jwt.sign({ id: responseQuery.rows[0].id }, passwordJwt, {
      expiresIn: "8h",
    });
    const { senha: _, ...userAuthenticated } = responseQuery.rows[0];
    return res.status(200).json({ usuario: userAuthenticated, token });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Erro Interno" });
  }
};
const addTasks = async (req, res) => {
  const { tarefa } = req.body;
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  const tokenUser = jwt.verify(token, passwordJwt);

  if (!tarefa || !token) {
    return res.status(401).json({ message: "Não autorizado!" });
  }
  try {
    const query =
      "insert into tarefas (tarefa, usuario_id) values ($1, $2) returning *";
    const params = [tarefa, tokenUser.id];
    const responseQuery = await pool.query(query, params);
    return res.status(200).json({ message: "Tarefa cadastrada com sucesso!" });
  } catch (error) {
    res.status(404).json({ message: "Erro Interno" });
  }
};

const deleteTask = async (req, res) => {
  const { authorization } = req.headers;
  const { id } = req.params;
  try {
    const token = authorization.split(" ")[1];
    const tokenUser = jwt.verify(token, passwordJwt);

    const authorized = authorization.split(" ")[1];
    if (!authorized) {
      return res.status(401).json({ message: "Não autorizado!" });
    }
    const query = "delete from tarefas where id = $1 and usuario_id = $2";
    const params = [id, tokenUser.id];

    const response = await pool.query(query, params);

    if (response.rowCount > 0) {
      return res.status(202).json({ message: "Tarefa excluida com sucesso !" });
    }
    res.status(404).json({ message: "Esta tarefa não existe" });
  } catch (error) {
    res.status(404).json({ message: "Erro Interno" });
  }
};

module.exports = {
  addUser,
  listTasks,
  loginUser,
  addTasks,
  deleteTask,
};
