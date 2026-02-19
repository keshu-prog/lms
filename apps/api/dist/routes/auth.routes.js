import { Router } from "express";
const router = Router();
router.post("/login", (req, res) => {
    res.json({ message: "Logged in!" });
});
export default router;
