import mkcert from "mkcert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateCerts() {
  const certPath = path.join(__dirname, "cert.pem");
  const keyPath = path.join(__dirname, "key.pem");

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log("✅ Certificates already exist");
    return;
  }

  const ca = await mkcert.createCA({
    organization: "Test",
    countryCode: "US",
    state: "CA",
    locality: "SF",
    validity: 365,
  });

  const cert = await mkcert.createCert({
    ca: { key: ca.key, cert: ca.cert },
    domains: ["192.168.29.62", "localhost"],
    validity: 365,
  });

  fs.writeFileSync(certPath, cert.cert);
  fs.writeFileSync(keyPath, cert.key);

  console.log("✅ Certificates generated successfully");
}

generateCerts().catch(console.error);
