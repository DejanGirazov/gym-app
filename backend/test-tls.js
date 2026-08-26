import tls from "tls";

const socket = tls.connect(465, "smtp.gmail.com", { rejectUnauthorized: false }, () => {
  const cert = socket.getPeerCertificate(true);
  console.log("Issuer:", cert.issuer);
  console.log("Subject:", cert.subject);
  socket.end();
});

socket.on("error", (err) => console.error("TLS error:", err));