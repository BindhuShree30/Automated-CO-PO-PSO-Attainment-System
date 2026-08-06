import bcrypt from "bcrypt";

const password = "admin";

const hash = await bcrypt.hash(password, 10);

console.log(hash);