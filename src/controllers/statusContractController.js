const StatusContract = require("../models/StatusContract");

const getAllStatusContracts = async (req, res) => {
  try {
    const statuses = await StatusContract.findAll();
    res.status(200).json(statuses);
  } catch (error) {
    console.error("Ошибка при получении статусов:", error);
    res.status(500).json({ error: "Ошибка при получении статусов" });
  }
};

const getStatusContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await StatusContract.findByPk(id);
    if (!status) {
      return res.status(404).json({ error: "Статус не найден" });
    }
    res.status(200).json(status);
  } catch (error) {
    console.error("Ошибка при получении статуса:", error);
    res.status(500).json({ error: "Ошибка при получении статуса" });
  }
};

const createStatusContract = async (req, res) => {
  try {
    const { status_contract_name, description } = req.body;
    const newStatus = await StatusContract.create({ status_contract_name, description });
    res.status(201).json(newStatus);
  } catch (error) {
    console.error("Ошибка при создании статуса:", error);
    res.status(500).json({ error: "Ошибка при создании статуса" });
  }
};

const updateStatusContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_contract_name, description } = req.body;
    const status = await StatusContract.findByPk(id);

    if (!status) {
      return res.status(404).json({ error: "Статус не найден" });
    }

    status.status_contract_name = status_contract_name;
    status.description = description;
    await status.save();

    res.status(200).json(status);
  } catch (error) {
    console.error("Ошибка при обновлении статуса:", error);
    res.status(500).json({ error: "Ошибка при обновлении статуса" });
  }
};

const deleteStatusContract = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await StatusContract.findByPk(id);

    if (!status) {
      return res.status(404).json({ error: "Статус не найден" });
    }

    await status.destroy();
    res.status(200).json({ message: "Статус успешно удалён" });
  } catch (error) {
    console.error("Ошибка при удалении статуса:", error);
    res.status(500).json({ error: "Ошибка при удалении статуса" });
  }
};

module.exports = {
  getAllStatusContracts,
  getStatusContractById,
  createStatusContract,
  updateStatusContract,
  deleteStatusContract,
};