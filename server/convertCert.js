import selfsigned from "selfsigned";
import fs from "fs";

const attrs = [{ name: "commonName", value: "192.168.29.62" }];
const options = {
  days: 365,
  keySize: 2048,
  algorithm: "sha256",
};

const pems = selfsigned.generate(attrs, options);

fs.writeFileSync("./key.pem", pems.private);
fs.writeFileSync("./cert.pem", pems.cert);

console.log("✅ Self-signed certificates generated successfully!");
console.log("Key: ./key.pem");
console.log("Cert: ./cert.pem");
