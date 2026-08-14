const { Router } = require("express");
const { register, login, logout, changePassword, forgotPassword } = require("../controllers/UserControllers");
const { authCheck } = require("../middleware/authCheck");
const { resetPassword } = require("../controllers/ResetPassword");
const { authorization } = require("../middleware/authorization");
const router = Router();

router.post("/users/register",register)
router.post("/users/login",login)
router.get("/users/logout" ,authCheck,logout)
router.post("/users/change-password", authCheck ,changePassword)
router.post("/users/forgot-password",forgotPassword)
router.post("/users/reset-password/:token",resetPassword)
router.get("/users/admin",authCheck,authorization("admin"),(req,res)=>{
    console.log("admin");
    res.send("welcome Admin")
})

module.exports = router;
