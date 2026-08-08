const { Router } = require("express");
const { register, login, logout } = require("../controllers/UserControllers");
const { authCheck } = require("../middleware/authCheck");
const router = Router();

router.post("/users",register)
router.post("/users/login",login)
router.get("/users/logout" ,authCheck,logout)

module.exports = router;
