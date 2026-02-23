export default function handler(req, res) {
  const auth = req.headers.authorization;

  if (!auth) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Private Site"');
    res.status(401).end("Access denied");
    return;
  }

  const base64 = auth.split(" ")[1];
  const decoded = Buffer.from(base64, "base64").toString();
  const password = decoded.split(":")[1]; // ignore username

  if (password === "5656") {
    res.status(200).send("Access granted");
  } else {
    res.status(401).end("Wrong code");
  }
}
