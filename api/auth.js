export default function handler(req, res) {
  const auth = req.headers.authorization;

  if (!auth) {
    res.setHeader("WWW-Authenticate", "Basic");
    res.status(401).send("Authentication required.");
    return;
  }

  const base64 = auth.split(" ")[1];
  const [user, pass] = Buffer.from(base64, "base64").toString().split(":");

  if (user === "admin" && pass === "1234") {
    res.status(200).send("Access granted");
  } else {
    res.status(401).send("Wrong credentials");
  }
}
