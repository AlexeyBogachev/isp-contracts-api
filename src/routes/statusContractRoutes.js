const express = require("express");
const router = express.Router();
const statusContractController = require("../controllers/statusContractController");

router.get("/", statusContractController.getAllStatusContracts);
router.get("/:id", statusContractController.getStatusContractById);
router.post("/", statusContractController.createStatusContract);
router.put("/:id", statusContractController.updateStatusContract);
router.delete("/:id", statusContractController.deleteStatusContract);

module.exports = router;